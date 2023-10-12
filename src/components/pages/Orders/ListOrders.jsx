import { collection, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../Firebase";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { BiBorderAll, BiEdit, BiTrash } from "react-icons/bi";
import { doc } from "firebase/firestore";
const ListOrders = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(null);
  const itemsPerPage = 7;

  //   FETCH Products FROM DB

  // const fetchApprovals = async () => {
  //   try {
  //     // Get a reference to the "Admin" collection
  //     const schoolsRef = collection(db, "approve");

  //     // Get all documents in the "Admin" collection
  //     const querySnapshot = await getDocs(schoolsRef);

  //     // Extract the data from each document

  //     const productsList = querySnapshot.docs.map((doc) => ({
  //       did: doc.id,
  //       ...doc.data(),
  //     }));
  //     productsList.sort((a, b) => b.time - a.time);
  //     const totalPages = Math.ceil(productsList?.length / itemsPerPage);

  //     // Generate an array of page numbers
  //     const generatedPages = [];
  //     for (let i = 1; i <= totalPages; i++) {
  //       generatedPages.push(i);
  //     }
  //     // Update the adminList array in reverse order so the newest data comes first
  //     // setAdminList(adminList.reverse());

  //     // Now "adminList" contains an array of all documents in the "Admin" collection
  //     console.log(productsList);
  //     setPages(generatedPages);
  //     setApprovals(productsList);
  //     return productsList;
  //   } catch (error) {
  //     console.error("Error fetching documents:", error);
  //     return [];
  //   }
  // };
  const fetchApprovals = async () => {
    try {
      // Get a reference to the "approve" collection
      const approvalsRef = collection(db, "approve");

      // Get all documents in the "approve" collection
      const querySnapshot = await getDocs(approvalsRef);

      // Extract the data from each approval document
      const approvalsList = [];
      let schoolData;
      // Use Promise.all to fetch school data for each approval
      await Promise.all(
        querySnapshot.docs.map(async (docss) => {
          const approvalData = docss.data();
          console.log(approvalData);

          // Check if there are orders in the approval data
          if (approvalData.orders && Array.isArray(approvalData.orders)) {
            // Fetch school data for each school associated with this approval
            const schoolPromises = approvalData.orders.map(async (order) => {
              const schoolId = order.addedById;
              if (schoolId) {
                const schoolRef = doc(db, "Schools", schoolId);
                const schoolSnapshot = await getDoc(schoolRef);
                schoolData = schoolSnapshot.data();
                console.log(schoolData);

                // Create a new object for the order with school data
                const orderWithSchoolData = {
                  ...order,
                };

                return orderWithSchoolData;
              }
              return null; // Handle the case where schoolId is missing
            });

            // Wait for all school data fetches to complete
            const schoolResults = await Promise.all(schoolPromises);

            // Filter out null values (if any)
            const validSchoolResults = schoolResults.filter(
              (result) => result !== null
            );
            console.log(validSchoolResults);
            // Merge approval data with school data for each school
            if (validSchoolResults.length > 0) {
              approvalsList.push({
                ...approvalData,
                orders: validSchoolResults,
                schoolData: schoolData, // Add schoolData property here
              });
            }
          }
        })
      );

      approvalsList.sort((a, b) => b.time - a.time);
      setApprovals(approvalsList);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = approvals?.slice(startIndex, endIndex);
  console.log(itemsToDisplay);
  useEffect(() => {
    fetchApprovals();
  }, [currentPage]);

  return (
    <>
      <Toaster />
      {itemsToDisplay && itemsToDisplay.length == 0 ? (
        <>
          <h2 className="text-4xl text-center h-full flex justify-center m-auto items-center font-semibold">
            No Orders For Approval !
          </h2>
        </>
      ) : (
        <>
          <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
            <table className="w-full table-auto text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="py-3 px-6">School Name</th>
                  {/* <th className="py-3 px-6">Date</th> */}
                  <th className="py-3 px-6">Products</th>
                  <th className="py-3 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 divide-y">
                {itemsToDisplay?.map((item, idx) => (
                  <>
                    <tr key={item.did}>
                      <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                        <img
                          src={item?.schoolData?.avatar}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <span className="block text-gray-700 text-sm font-medium">
                            {item?.schoolData?.name}
                          </span>
                          {/* <span className="block text-gray-700 text-xs">
                      {item.email}
                    </span> */}
                        </div>
                      </td>

                      {/* <td className="px-6 py-4 whitespace-nowrap">{item.price}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.orders.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              navigate("/order-info", { state: item })
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

          {/* Pagination */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {/* Previous Page */}
              <a
                onClick={() => handlePageChange(currentPage - 1)}
                className={`hover:text-indigo-600 flex items-center gap-x-2 ${
                  currentPage === 1 ? "pointer-events-none text-gray-400" : ""
                }`}
              >
                {/* ... */}
              </a>

              {/* Page Numbers */}
              <ul className="flex items-center gap-1">
                {pages?.map((page) => (
                  <li key={page} className="text-sm">
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
                  currentPage === pages?.length
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
  );
};

export default ListOrders;
