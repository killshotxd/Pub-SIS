import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { BiBorderAll } from "react-icons/bi";
import { TailSpin } from "react-loader-spinner";

const BuyerOrderList = () => {
  const schoolEmail = localStorage.getItem("email");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [schools, setSchools] = useState(schoolEmail);
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
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };
  console.log("Order Presenet", orderPresent);
  useEffect(() => {
    handleOrderConfirmation();
  }, []);

  const filteredOrders = Object?.keys(orderPresent)?.flatMap((schoolEmail) =>
    orderPresent[schoolEmail]?.filter(
      (item) =>
        item.schoolInfo.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.schoolInfo.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.orderTimeStamp.includes(searchQuery) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  filteredOrders?.sort(
    (a, b) => new Date(b.orderTimeStamp) - new Date(a.orderTimeStamp)
  );
  return (
    <>
      {orderPresent && !loading ? (
        <>
          <div className="py-6 px-4 ">
            <h3 className="text-4xl font-semibold">All Orders</h3>
          </div>
          <div className="py-6">
            <input
              type="text"
              placeholder="Search by School Name, Email, Status or Date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div className="shadow-sm border rounded-lg overflow-x-auto">
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
                {filteredOrders?.map((item, idx) => (
                  <>
                    {console.log(item)}

                    <tr key={item.did}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.schoolInfo.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.orders.length} Products
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.orderTimeStamp.slice(0, 10)}
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
                          <button className="btn btn-xs  hover:bg-info hover:text-white">
                            <BiBorderAll />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
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
