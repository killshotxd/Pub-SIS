import { collection, deleteDoc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../Firebase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { BiBorderAll, BiEdit, BiTrash } from "react-icons/bi";
import { doc } from "firebase/firestore";
const ListOrders = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(null);
  const itemsPerPage = 7;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
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
          const approvalDid = docss.id;
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
                schoolData: schoolData,
                did: approvalDid, // Add schoolData property here
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
  const handleDelete = async (item) => {
    try {
      const docRef = doc(db, "approve", item.did);
      await deleteDoc(docRef);
      fetchApprovals();

      try {
        item.orders.forEach(async (element) => {
          const cartRef = doc(db, "cart", item.did, "items", element.did);
          await deleteDoc(cartRef);
        });
      } catch (error) {
        console.log(error);
      }
      toast.success("Approval Deleted Successfully !");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId

    // Set the product to delete and open the modal
    setOrderToDelete(product);
    setDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    handleDelete(orderToDelete);
    // Close the modal
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const cancelDelete = () => {
    // Close the modal without deleting
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };
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
                    {console.log(item)}
                    <tr key={idx + 1}>
                      <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                        <img
                          src={item?.schoolData?.avatar}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <span className="block text-gray-700 text-sm font-medium">
                            {item?.schoolData?.name}
                          </span>
                          <span className="block text-gray-700 text-xs">
                            {item.schoolData.email}
                          </span>
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
                            <BiBorderAll /> open
                          </button>
                          <button
                            onClick={() => handleDeleteModal(item)}
                            className="btn btn-xs hover:bg-red-400 hover:text-white"
                          >
                            <BiTrash /> delete
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

      {isDeleteModalOpen && orderToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Product
                </h3>
                <p>
                  Are you sure you want to delete the approval:{" "}
                  {orderToDelete?.schoolData.name} with{" "}
                  {orderToDelete.orders.length} Products?
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListOrders;
