import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const OrderPending = () => {
  const [quantityItem, setQuantity] = useState(1);
  const [approvalOrders, setApprovalOrders] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const navigate = useNavigate();
  const removeItem = async (did) => {
    const uid = localStorage.getItem("email");
    const cartItemRef = doc(db, "cart", `${uid}/items`, did);
    try {
      // First, delete the product from the cart
      await deleteDoc(cartItemRef);
      toast.success("Item successfully removed from cart");

      // Then, remove the corresponding order
      const schoolEmail = localStorage.getItem("email"); // Replace with your logic to get the school's email

      // Create a reference to the batch in the "approve" collection
      const batchRef = doc(db, "approve", schoolEmail);

      // Check if the batch with the school's email exists in the "approve" collection
      const batchSnapshot = await getDoc(batchRef);
      const existingBatch = batchSnapshot.exists()
        ? batchSnapshot.data()
        : null;

      // If the batch exists, remove the order from the batch
      if (existingBatch) {
        existingBatch.orders = existingBatch.orders.filter(
          (order) => order.did !== did
        );

        // Update the batch document
        await setDoc(batchRef, existingBatch);
      }

      // Refresh the cart and orders
    } catch (error) {
      console.error("Error removing item from cart: ", error);
    }
  };
  useEffect(() => {
    const unsubscribeApprovals = listenToApprovals();

    // Cleanup the listeners when the component unmounts
    return () => {
      unsubscribeApprovals();
    };
  }, [quantityItem]);

  const listenToApprovals = () => {
    const email = localStorage.getItem("email");
    const docRef = doc(db, "approve", email);

    // Add an "onSnapshot" listener to the document reference
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        // Retrieve the data from the document
        const existingBatch = docSnapshot.data();
        console.log(existingBatch);
        setApprovalOrders(existingBatch);

        // If `existingBatch` is an array, you can sort it by the `time` property
        if (Array.isArray(existingBatch)) {
          existingBatch.sort((a, b) => b.addedAt - a.addedAt);
        }

        // You can proceed to fetch school data for each approval here
      } else {
        console.log("Document does not exist");
      }
    });

    return unsubscribe; // Return the unsubscribe function
  };
  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    removeItem(orderToDelete.did);
    // Close the modal
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const cancelDelete = () => {
    // Close the modal without deleting
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId

    // Set the product to delete and open the modal
    setOrderToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleEdit = async (item) => {
    const uidEmail = localStorage.getItem("email");
    const cartRef = collection(db, "cart", `${uidEmail}/items`);

    // Check if an item with the same name and id already exists in the cart
    const querySnapshot = await getDocs(cartRef);
    const duplicateItem = querySnapshot.docs.find((doc) => {
      const cartItem = doc.data();
      return cartItem.pid === item.did && cartItem.name === item.name;
    });

    if (duplicateItem) {
      // Item with the same name and id already exists in the cart
      toast.error("Item already in cart");
      console.log("Item already in cart");
      // You can display an error message or handle it as needed
    } else {
      approvalOrders.orders.forEach((item) => {
        const newCartRe = {
          pid: item.did,
          image: item.image,
          deliveryDate: item.deliveryDate ? item.deliveryDate : "",
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          description: item.description,
          addedAt: new Date().toLocaleDateString(),
          addedById: uidEmail,
        };

        try {
          addDoc(cartRef, newCartRe);
        } catch (error) {
          console.log(error);
        }
      });
      // Add the item to the cart
      navigate("/cart");
    }
  };

  return (
    <>
      <Toaster />
      {approvalOrders?.orders?.length !== 0 ? (
        <>
          <div className="flex flex-col mx-auto max-w-6xl p-6 space-y-4 sm:p-10 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-semibold">Items Pending Approval</h2>

            <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
              <table className="w-full table-auto text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                  <tr>
                    <th className="py-3 px-6">Product Name</th>
                    <th className="py-3 px-6">Requested Delivery Date</th>
                    <th className="py-3 px-6">Quantity</th>
                    <th className="py-3 px-6">Unit Price</th>
                    <th className="py-3 px-6">Total</th>

                    <th className="py-3 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 divide-y">
                  {approvalOrders?.orders?.map((item, idx) => (
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
                          {item?.deliveryDate == "" || !item.deliveryDate ? (
                            "3 Business Days"
                          ) : (
                            <>
                              {new Date(item.deliveryDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                }
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${item.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${item.total.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="btn btn-xs hover:bg-cyan-400 hover:text-white"
                            >
                              <BiEdit /> Edit
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
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col mx-auto max-w-6xl p-6 space-y-4 sm:p-10 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-semibold text-center">
              No Pending Items
            </h2>
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
                  Are you sure you want to delete the product:{" "}
                  {orderToDelete.name}?
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

export default OrderPending;
