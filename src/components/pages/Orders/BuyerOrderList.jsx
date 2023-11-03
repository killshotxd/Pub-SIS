import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { BiBorderAll, BiCircle } from "react-icons/bi";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const BuyerOrderList = () => {
  const navigate = useNavigate();
  const schoolEmail = localStorage.getItem("email");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [schools, setSchools] = useState(schoolEmail);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderPresent, setOrderPresent] = useState([]);
  const handleOrderConfirmation = async () => {
    try {
      setLoading(true);
      // Check if schoolList is null or undefined

      // Create an object to store orders grouped by school
      const ordersBySchool = {};

      // Iterate over each school email

      const ordersRef = collection(db, "orders", schoolEmail, "Orders");

      // Query all documents in the "Orders" subcollection for the school
      const querySnapshot = await getDocs(ordersRef);

      // Log the school email and the number of documents retrieved
      console.log("School Email:", schoolEmail);
      console.log("Number of Documents Retrieved:", querySnapshot.size);

      // Extract the data from the query snapshot and add it to the ordersBySchool object
      // Extract the data from the query snapshot and add it to the ordersBySchool object
      const schoolOrders = querySnapshot.docs.map((doc) => {
        const orderData = doc.data();
        orderData.id = doc.id; // Add the document ID as 'id'
        return orderData;
      });

      if (schoolOrders.length > 0) {
        ordersBySchool[schoolEmail] = schoolOrders;
      }

      // Fetch school information for the current school email
      const schoolDocRef = doc(db, "Schools", schoolEmail); // Adjust the collection and document path accordingly
      const schoolDocSnapshot = await getDoc(schoolDocRef);
      if (schoolDocSnapshot.exists()) {
        // Merge school information with the orders for this school
        ordersBySchool[schoolEmail]?.forEach((order) => {
          order.schoolInfo = schoolDocSnapshot.data();
        });
      }

      setOrderPresent(ordersBySchool);
      setLoading(false);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };
  console.log("Order Presenet", orderPresent);
  useEffect(() => {
    handleOrderConfirmation();
  }, []);

  const handleDateFilter = (start, end) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };
  const filteredOrders = Object.values(orderPresent)
    .flat()
    .filter((item) => {
      const orderDate = new Date(item.orderTimeStamp)
        .toISOString()
        .split("T")[0]; // Extract date portion
      const selectedStart = selectedStartDate;
      const selectedEnd = selectedEndDate;

      const isDateWithinRange =
        (!selectedStart || orderDate >= selectedStart) &&
        (!selectedEnd || orderDate <= selectedEnd);

      const isSearchMatch =
        item.schoolInfo.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.schoolInfo.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.orderTimeStamp.includes(searchQuery) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase());

      return isDateWithinRange && isSearchMatch;
    });

  filteredOrders.sort(
    (a, b) => new Date(b.orderTimeStamp) - new Date(a.orderTimeStamp)
  );
  // const filteredOrders = Object?.keys(orderPresent)?.flatMap((schoolEmail) =>

  //   orderPresent[schoolEmail]?.filter(
  //     (item) =>
  //       item.orders.some((order) =>
  //         order.name.toLowerCase().includes(searchQuery.toLowerCase())
  //       ) ||
  //       item.orderTimeStamp.includes(searchQuery) ||
  //       item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       item.id.toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  // );

  // filteredOrders?.sort(
  //   (a, b) => new Date(b.orderTimeStamp) - new Date(a.orderTimeStamp)
  // );

  const reOrder = async (item) => {
    console.log(item);
    const uidEmail = localStorage.getItem("email");
    const productsToAddToCart = [];

    for (const product of item.orders) {
      console.log(product);
      const ItemRef = doc(db, "Products", `${product.pid}`);
      const itemSnapshot = await getDoc(ItemRef);
      console.log(itemSnapshot);
      const productData = itemSnapshot.data();
      console.log(productData);

      if (productData?.visibleCheck === true) {
        toast.error(
          "Product '" +
            product.name +
            "' is not available right now and has been skipped."
        );
      } else {
        // Check if the product is already in the cart
        const cartRef = collection(db, "cart", `${uidEmail}/items`);
        const querySnapshot = await getDocs(cartRef);
        const cartItems = querySnapshot.docs.map((doc) => doc.data());
        const isProductInCart = cartItems.some(
          (itemInCart) =>
            itemInCart.pid === product.did && itemInCart.name === product.name
        );

        if (isProductInCart) {
          toast.error(
            "Product '" + product.name + "' is already in your cart."
          );
        } else {
          productsToAddToCart.push(product);
        }
      }
    }

    try {
      const currentUserEmail = localStorage.getItem("email");

      // Check if the user is authenticated
      if (!currentUserEmail) {
        // Handle unauthenticated user (e.g., redirect to the login page)
        console.error("User is not authenticated");
        return;
      }

      // Loop through each product to add to the cart
      for (const product of productsToAddToCart) {
        const totalPrice = parseFloat(product.price);

        const newCartRe = {
          pid: product.did,
          image: product.image,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          total: product.total,
          reorder: true,
          description: product.description,
          addedAt: new Date().toLocaleDateString(),
          addedById: currentUserEmail,
        };

        // Add the new order to the cart
        await addDoc(collection(db, "cart", `${uidEmail}/items`), newCartRe);

        // Wait for this item to be processed before moving on to the next
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a delay if needed

        // You can add more processing or notifications here if needed
        toast.success("Order Added to your cart!");

        setTimeout(() => {
          navigate("/cart");
        }, 600);
      }
    } catch (error) {
      console.error("Error handling product orders: ", error);
    }
  };

  // PAGINATION

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the array to display only the items for the current page
  const currentItems = filteredOrders?.slice(indexOfFirstItem, indexOfLastItem);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredOrders.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
  return (
    <>
      <Toaster />
      {orderPresent && !loading ? (
        <>
          <div className="py-6 px-4 ">
            <h3 className="text-4xl font-semibold">All Orders</h3>
          </div>

          <div className="py-6">
            <input
              type="text"
              placeholder="Search by Product Name, Status or Date"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div className="py-6 flex items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label>Start Date: </label>
                <input
                  type="date"
                  value={selectedStartDate || ""}
                  onChange={(e) => {
                    handleDateFilter(e.target.value, selectedEndDate);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label>End Date: </label>
                <input
                  type="date"
                  value={selectedEndDate || ""}
                  onChange={(e) =>
                    handleDateFilter(selectedStartDate, e.target.value)
                  }
                />
              </div>
            </div>
          </div>
          <div className="py-6 flex items-center  gap-6">
            <label htmlFor="FilterByStatus">Filter By Status - </label>
            <select
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="select select-bordered w-full max-w-xs"
            >
              <option value="" selected>
                Select Status
              </option>
              <option value="Confirmed">Confirmed</option>
              <option value="On-Route">On-Route</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleOrderConfirmation();
                  setSearchQuery("");
                }}
                className="btn btn-neutral"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {filteredOrders?.length === 0 ? (
            <>
              <p className="text-center font-semibold text-3xl">No Orders !</p>
            </>
          ) : (
            <>
              <div className="shadow-sm border rounded-lg overflow-x-auto">
                <table className="w-full table-auto text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="py-3 px-6">Order No</th>
                      <th className="py-3 px-6">Order Names</th>
                      {/* <th className="py-3 px-6">Products</th> */}
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">View</th>
                      <th className="py-3 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y">
                    {currentItems?.map((item, idx) => (
                      <>
                        {console.log(item)}

                        <tr key={item.did}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            #{item?.id.slice(0, 6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.orders.map((res) => (
                              <>
                                <p className="font-semibold flex items-center flex-wrap gap-3 ">
                                  <div className="avatar">
                                    <div className="w-6 rounded">
                                      <img src={res.image} alt="avatar" />
                                    </div>
                                  </div>{" "}
                                  {res?.name} - {res?.quantity} Qty
                                </p>
                              </>
                            ))}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                        {item.orders.length} Products
                      </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(item.orderTimeStamp).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={
                                item?.status === "Cancelled"
                                  ? "badge badge-error text-white"
                                  : item?.status === "Delivered"
                                  ? "badge badge-success text-white"
                                  : "badge badge-info text-white"
                              }
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  navigate("/buyer-order-status", {
                                    state: item,
                                  })
                                }
                                className="btn btn-xs  hover:bg-info hover:text-white"
                              >
                                <BiBorderAll /> view
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => reOrder(item)}
                              className="btn btn-xs  hover:bg-warning hover:text-white"
                            >
                              {" "}
                              <BiCircle /> Reorder
                            </button>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-8 pb-8">
                <div className="flex items-center justify-between">
                  {/* Previous Page */}
                  <a
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`hover:text-indigo-600 flex items-center gap-x-2 ${
                      currentPage === 1
                        ? "pointer-events-none text-gray-400"
                        : ""
                    }`}
                  >
                    {/* ... */}
                  </a>

                  {/* Page Numbers */}
                  <ul className="flex items-center gap-1">
                    {pageNumbers?.map((page) => (
                      <li key={page.id} className="text-sm">
                        <a
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg duration-150 hover:text-indigo-600 hover:bg-indigo-50 ${
                            currentPage === page
                              ? "bg-indigo-50 text-indigo-600 font-medium"
                              : ""
                          }`}
                        >
                          {page}
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Next Page */}
                  <a
                    href="javascript:void(0)"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`hover:text-indigo-600 flex items-center gap-x-2 ${
                      currentPage === pageNumbers?.length
                        ? "pointer-events-none text-gray-400"
                        : ""
                    }`}
                  >
                    {/* ... */}
                  </a>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="w-100 h-full flex justify-center items-center m-auto">
            <TailSpin
              height="80"
              width="80"
              color="#15b3de"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        </>
      )}
    </>
  );
};

export default BuyerOrderList;
