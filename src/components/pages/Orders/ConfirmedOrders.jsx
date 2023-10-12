import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { BiBorderAll } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";

const ConfirmedOrders = () => {
  const [schools, setSchools] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [orderPresent, setOrderPresent] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      console.log(schoolList);
      setSchools(schoolList);

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

        if (schoolOrders.length > 0) {
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

      setLoading(false);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };

  console.log(orderPresent);
  useEffect(() => {
    fetchSchools();
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
                          <button
                            onClick={() =>
                              navigate("/order-status", { state: item })
                            }
                            className="btn btn-xs  hover:bg-info hover:text-white"
                          >
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

export default ConfirmedOrders;
