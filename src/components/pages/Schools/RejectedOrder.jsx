import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { BiTrash } from "react-icons/bi";
import toast, { Toaster } from "react-hot-toast";

const RejectedOrder = () => {
  const uid = localStorage.getItem("email");

  const [rejected, setRejected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const getRejectedOrders = async () => {
    setLoading(true);
    try {
      // Construct a reference to the school's specific orders
      const rejectedRef = collection(db, "rejected", "orders", uid);

      // Attach a real-time listener to the collection
      const unsubscribe = onSnapshot(rejectedRef, (collectionSnapshot) => {
        const orders = [];
        console.log(collectionSnapshot);
        collectionSnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });

        setRejected(orders);
        // Now, the "orders" array contains all the orders for the school in real-time
        console.log("Received orders:", orders);
      });
      setLoading(false);
      // Remember to return the unsubscribe function if you want to stop listening later
      return unsubscribe;
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = getRejectedOrders();
  }, []);

  rejected?.sort(
    (a, b) => new Date(b.orderTimeStamp) - new Date(a.orderTimeStamp)
  );
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the array to display only the items for the current page
  const currentItems = rejected?.slice(indexOfFirstItem, indexOfLastItem);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(rejected?.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleDelete = async (did) => {
    const uid = localStorage.getItem("email");
    try {
      const docRef = doc(db, "rejected/orders", uid, did);
      await deleteDoc(docRef);
      toast.success("Item Deleted Successfully !");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId

    // Set the product to delete and open the modal
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    handleDelete(productToDelete.id);
    // Close the modal
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    // Close the modal without deleting
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };
  return (
    <>
      <Toaster />
      {loading ? (
        <>
          {" "}
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
      ) : (
        <>
          {rejected?.length > 0 ? (
            <>
              <div className="flex flex-col mx-auto max-w-6xl p-6 space-y-4 sm:p-10 dark:bg-gray-900 dark:text-gray-100">
                <h2 className="text-xl font-semibold">Rejected Items</h2>

                <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
                  <table className="w-full table-auto text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-6">Product Name</th>
                        <th className="py-3 px-6">Rejected Date</th>

                        <th className="py-3 px-6">Quantity</th>
                        <th className="py-3 px-6">Unit Price</th>
                        <th className="py-3 px-6">Total</th>
                        <th className="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                      {currentItems?.map((item, idx) => (
                        <>
                          <tr key={item.did}>
                            <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                              <img
                                src={item?.image}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <span className="block text-gray-700 text-sm font-medium">
                                  {item?.name}{" "}
                                  {item.reorder ? (
                                    <span className="badge badge-xs badge-primary">
                                      Reorder
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.rejectedAt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              ${parseFloat(item.price).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              ${parseFloat(item.total).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteModal(item)}
                                className="btn btn-xs hover:bg-red-400 hover:text-white"
                              >
                                <BiTrash /> delete
                              </button>
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
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

              {isDeleteModalOpen && productToDelete && (
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
                          Are you sure you want to delete the product:{" "}
                          {productToDelete.name}?
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
          ) : (
            <>
              <div className="flex flex-col mx-auto max-w-6xl p-6 space-y-4 sm:p-10 dark:bg-gray-900 dark:text-gray-100">
                <h2 className="text-xl font-semibold text-center">
                  No Rejected Orders
                </h2>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default RejectedOrder;
