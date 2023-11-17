import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { BiBorderAll } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";

const ConfirmedOrders = () => {
  const [schools, setSchools] = useState(null);
  const [schoolsOption, setSchoolsOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [orderPresent, setOrderPresent] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  //   const fetchSchools = async () => {
  //     const schoolsRef = collection(db, "Schools");
  //     const querySnapshot = await getDocs(schoolsRef);
  //     const schoolList = querySnapshot.docs.map((doc) => doc.data());
  //     console.log(schoolList);
  //     let schoolArra = [];
  //     schoolList.forEach((element) => {
  //       schoolArra.push(element.email);
  //     });

  //     setSchools(schoolArra);
  //   };

  //   const handleOrderConfirmation = async () => {
  //     try {
  //       // Replace this with your logic to fetch the list of school emails

  //       // Create an array to store all orders
  //       const allOrders = [];

  //       // Iterate over each school email
  //       for (const schoolEmail of schools) {
  //         // Create a reference to the "Orders" subcollection for the school
  //         const ordersRef = collection(db, "orders", schoolEmail, "Orders");

  //         // Query all documents in the "Orders" subcollection for the school
  //         const querySnapshot = await getDocs(ordersRef);

  //         // Extract the data from the query snapshot and add it to the allOrders array
  //         const schoolOrders = querySnapshot.docs.map((doc) => doc.data());
  //         allOrders.push(...schoolOrders);
  //       }

  //       console.log(allOrders);
  //     } catch (error) {
  //       console.error("Error fetching all orders:", error);
  //     }
  //   };

  //   useEffect(() => {
  //     fetchSchools();
  //     handleOrderConfirmation();
  //   }, []);
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const schoolsRef = collection(db, "Schools");
      const querySnapshot = await getDocs(schoolsRef);
      const schoolList = querySnapshot.docs.map((doc) => doc.data().email);
      const schoolListOption = querySnapshot.docs.map((doc) => doc.data());
      console.log(schoolListOption);
      setSchools(schoolList);
      setSchoolsOption(schoolListOption);

      // Call handleOrderConfirmation here after setting schools
      handleOrderConfirmation(schoolList); // Pass schoolList as an argument
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const handleOrderConfirmation = async (schoolList) => {
    try {
      setLoading(true);
      // Check if schoolList is null or undefined
      if (!schoolList) {
        console.error("Schools list is null or undefined.");
        return;
      }

      // Create an object to store orders grouped by school
      const ordersBySchool = {};

      // Iterate over each school email
      for (const element of schoolList) {
        const ordersRef = collection(db, "orders", element, "Orders");

        // Query all documents in the "Orders" subcollection for the school
        const querySnapshot = await getDocs(ordersRef);

        // Log the school email and the number of documents retrieved
        console.log("School Email:", element);
        console.log("Number of Documents Retrieved:", querySnapshot.size);

        // Extract the data from the query snapshot and add it to the ordersBySchool object
        const schoolOrders = querySnapshot.docs.map((doc) => {
          const orderData = doc.data();
          orderData.id = doc.id; // Add the document ID as 'id'
          return orderData;
        });

        if (schoolOrders?.length > 0) {
          ordersBySchool[element] = schoolOrders;
        }

        // Fetch school information for the current school email
        const schoolDocRef = doc(db, "Schools", element); // Adjust the collection and document path accordingly
        const schoolDocSnapshot = await getDoc(schoolDocRef);

        if (schoolDocSnapshot.exists()) {
          // Merge school information with the orders for this school
          ordersBySchool[element]?.forEach((order) => {
            order.schoolInfo = schoolDocSnapshot.data();
          });
        }
      }

      setOrderPresent(ordersBySchool);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };

  console.log(orderPresent);
  useEffect(() => {
    fetchSchools();
  }, []);

  const handleDateFilter = (start, end) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };

  console.log("Selected Start Date", selectedStartDate);
  console.log("Selected End Date", selectedEndDate);

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
      const isSchoolMatch =
        selected?.length === 0 ||
        selected.some(
          (option) => option.value.toLowerCase() === item.schoolInfo.email
        );

      const isSearchMatch =
        item.schoolInfo.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.schoolInfo.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.orderTimeStamp.includes(searchQuery) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase());

      return isDateWithinRange && isSchoolMatch && isSearchMatch;
    });

  filteredOrders.sort(
    (a, b) => new Date(b.orderTimeStamp) - new Date(a.orderTimeStamp)
  );

  console.log(filteredOrders);

  const batchInvoice = () => {
    const filteredInvoice = filteredOrders.filter((res) => {
      return (
        res.status === "Confirmed" ||
        res.status === "Delivered" ||
        res.status === "On-Route"
      );
    });

    // console.log(filteredInvoice);
    navigate("/batch-invoice", {
      state: [
        filteredInvoice,
        { date: { fromDate: selectedStartDate, fromToDate: selectedEndDate } },
      ],
    });
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the array to display only the items for the current page
  const currentItems = filteredOrders?.slice(indexOfFirstItem, indexOfLastItem);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredOrders?.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleMultiSelectChange = (selectedOptions) => {
    console.log(selectedOptions.value);
    // Extract and store selected school emails in an array

    setSelected(selectedOptions);
  };
  return (
    <>
      {orderPresent && !loading ? (
        <>
          <div className="py-6 px-4 ">
            <h3 className="text-4xl font-semibold">All Orders</h3>
          </div>

          <>
            {" "}
            <div>
              <input
                type="text"
                placeholder="Search by School Name, Email, Status or Date"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3 pr-3  py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetchSchools();
                      setSearchQuery("");
                    }}
                    className="btn btn-neutral"
                  >
                    Clear Filter
                  </button>
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
                <option disabled selected>
                  Select Status
                </option>
                <option value="Confirmed">Confirmed</option>
                <option value="On-Route">On-Route</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {console.log(selected)}
            {schoolsOption && selected !== undefined && (
              <>
                {console.log(schools)}
                <div className="max-w-[90vw]">
                  <label className="font-semibold">Filter By School: </label>
                  <MultiSelect
                    options={schoolsOption?.map((school) => ({
                      label: `${school.name}  (${school.email})`,
                      value: school.email,
                    }))}
                    value={selected}
                    onChange={handleMultiSelectChange}
                    labelledBy="Select"
                    hasSelectAll={true}
                  />
                </div>
              </>
            )}
            {filteredOrders?.length === 0 ? (
              <>
                <p className="text-center font-semibold text-2xl">
                  No Orders Available
                </p>
              </>
            ) : (
              <>
                {" "}
                <div className="mt-4 flex justify-end">
                  <button
                    className="btn btn-info text-white"
                    onClick={batchInvoice}
                  >
                    Download Batch Invoice
                  </button>
                </div>
                <div className="shadow-sm border rounded-lg overflow-x-auto mt-4">
                  <table className="w-full table-auto text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-6">School Name</th>
                        <th className="py-3 px-6">Products</th>
                        <th className="py-3 px-6">Date</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                      {currentItems?.map((item, idx) => (
                        <>
                          {console.log(item)}
                          <tr key={idx + 1}>
                            <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                              <img
                                src={item.schoolInfo.avatar}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <span className="block text-gray-700 text-sm font-medium">
                                  {item.schoolInfo.name}
                                </span>
                                <span className="block text-gray-700 text-xs">
                                  {item.schoolInfo.email}
                                </span>
                              </div>
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
                                    navigate("/order-status", { state: item })
                                  }
                                  className="btn btn-xs  hover:bg-info hover:text-white"
                                >
                                  <BiBorderAll /> view
                                </button>
                              </div>
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

export default ConfirmedOrders;
