import {
  BiCheckCircle,
  BiCross,
  BiLeftArrowAlt,
  BiMinus,
  BiPlus,
} from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { MdCancel, MdOutlineConfirmationNumber } from "react-icons/md";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../Firebase";
import toast, { Toaster } from "react-hot-toast";
const OrderInfo = () => {
  const location = useLocation();
  const schoolMails = localStorage.getItem("schoolMails");
  const state = location.state;
  const [isConfirmationInProgress, setIsConfirmationInProgress] =
    useState(false);
  console.log(state);
  const navigate = useNavigate();
  const [realtimeOrder, setRealtimeOrder] = useState(null);
  const [updateDate, setUpdateDate] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [stateOrder, setStateOrder] = useState({
    status: "Confirmed", // Orders data for the specific school
    selectedOrders: [],
    schoolMails: state.schoolData.schoolMails, // Store selected orders for confirmation
  });
  console.log(schoolMails);
  // FETCH ALL ORDERS APPROVALS

  const getOrder = (state) => {
    const orderRef = doc(db, "approve", state.did);

    // Add an "onSnapshot" listener to the document reference
    const unsubscribe = onSnapshot(orderRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const orderData = docSnapshot.data();
        // Handle the data here
        setRealtimeOrder(orderData);
        console.log("Received updated order data:", orderData);
      } else {
        console.log("Document does not exist");
      }
    });

    // You can return the unsubscribe function if needed to stop listening to updates
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = getOrder(state);
  }, [state]);
  // To start listening to real-time updates, call the function with your state

  // To stop listening, call the unsubscribe function
  // unsubscribe();

  // FETCH ALL ORDERS APPROVALS
  useEffect(() => {
    if (realtimeOrder?.orders.length === 0) {
      navigate("/list-orders");
    }
  }, [realtimeOrder]);
  const handleOrderConfirmation = async () => {
    if (stateOrder.selectedOrders.length === 0 || isConfirmationInProgress) {
      return; // Do nothing if there are no selected orders or if confirmation is already in progress
    }

    try {
      setIsConfirmationInProgress(true);
      const schoolId = state.schoolData.email;

      // Create a reference to the "orders" collection for the school
      const ordersRef = collection(db, "orders", schoolId, "Orders");

      // Create a reference to the "approve" collection for the school
      const approveRef = doc(db, "approve", schoolId);

      // Fetch the approval data
      const approveSnapshot = await getDoc(approveRef);
      const approvalData = approveSnapshot.exists()
        ? approveSnapshot.data()
        : null;

      if (approvalData && approvalData.orders) {
        // Check if all selected orders match the approval data
        const matchingOrders = stateOrder.selectedOrders.filter(
          (selectedOrder) =>
            approvalData.orders.some(
              (approvalOrder) =>
                approvalOrder.did === selectedOrder.did &&
                approvalOrder.total === selectedOrder.total
            )
        );

        if (matchingOrders.length === stateOrder.selectedOrders.length) {
          // All selected orders match the approval data, proceed with confirmation

          // Add a new document for each confirmed order
          await addDoc(ordersRef, {
            orders: stateOrder.selectedOrders,
            status: "Confirmed",
            orderTimeStamp: new Date().toISOString(),

            updated: realtimeOrder?.updated ? "True" : "False",
          });

          // Remove selected orders from the existing batch
          approvalData.orders = approvalData.orders.filter(
            (approvalOrder) =>
              !stateOrder.selectedOrders.some(
                (selectedOrder) => selectedOrder.did === approvalOrder.did
              )
          );

          // Update the batch document
          await setDoc(approveRef, approvalData);

          // Delete selected orders from the cart
          stateOrder.selectedOrders.forEach(async (element) => {
            const cartRef = doc(db, "cart", schoolId, "items", element.did);
            await deleteDoc(cartRef);
          });

          // Clear the selected orders
          setStateOrder({
            ...stateOrder,
            selectedOrders: [],
          });

          // Display a success message
          toast.success("Orders Confirmed and Approve Request Deleted!");
          // Send confirmation emails
          try {
            const res = fetch(
              "https://mail-api-l2xn.onrender.com/send-approval-mail",
              {
                method: "POST",
                body: JSON.stringify({
                  ...stateOrder,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            const data = res.json();
            console.log(data);
          } catch (error) {
            console.error("Error sending confirmation emails:", error);
          }
          setIsConfirmationInProgress(false);

          // Navigate to the confirmed orders page
          setTimeout(() => {
            navigate("/confirmed-orders");
          }, 500);
        } else {
          // Not all selected orders match the approval data, display an error message
          toast.error("Approval for this order has been changed.");
          setTimeout(() => {
            navigate("/list-orders");
          }, 700);

          setIsConfirmationInProgress(false);
        }
      } else {
        // Approval data is missing or doesn't exist, display an error message
        toast.error("Approval Product does not exist.");
        setIsConfirmationInProgress(false);
      }
    } catch (error) {
      console.error("Error confirming orders:", error);
      setIsConfirmationInProgress(false);
    }
  };

  const handleOrderSelection = (item) => {
    // Toggle selection for the specified order
    const updatedSelectedOrders = [...stateOrder.selectedOrders];

    const orderIndex = updatedSelectedOrders.findIndex(
      (order) => order.did === item.did
    );

    if (orderIndex !== -1) {
      updatedSelectedOrders.splice(orderIndex, 1);
    } else {
      // Add the order with the current timestamp
      updatedSelectedOrders.push({
        ...item,
        // Add timestamp here
      });
    }

    setStateOrder({
      ...stateOrder,
      selectedOrders: updatedSelectedOrders,
    });
  };

  console.log(stateOrder);
  //   const handleConfirmOrders = () => {
  //     // Confirm selected orders
  //     stateOrder.selectedOrders.forEach((did) => {
  //       handleOrderConfirmation(did);
  //     });
  //   };

  const handleIncreaseQuantity = async (item) => {
    const orderRef = doc(db, "approve", state.did);

    try {
      const orderSnapshot = await getDoc(orderRef);

      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();

        // Find the item in the orders array
        const itemIndex = orderData.orders.findIndex(
          (order) => order.did === item.did
        );

        if (itemIndex !== -1) {
          orderData.orders[itemIndex].quantity += 1;
          orderData.orders[itemIndex].total =
            orderData.orders[itemIndex].quantity * parseFloat(item.price);

          // Update the Firestore document
          await updateDoc(orderRef, {
            orders: orderData.orders,
            updated: true,
          });
          toast.success("Quantity increased successfully.");
          console.log("Quantity increased successfully.");
        }
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };
  const handleDecreaseQuantity = async (item) => {
    const orderRef = doc(db, "approve", state.did);

    try {
      const orderSnapshot = await getDoc(orderRef);

      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();

        // Find the item in the orders array
        const itemIndex = orderData.orders.findIndex(
          (order) => order.did === item.did
        );

        if (itemIndex !== -1 && orderData.orders[itemIndex].quantity > 1) {
          orderData.orders[itemIndex].quantity -= 1;
          orderData.orders[itemIndex].total =
            orderData.orders[itemIndex].quantity * parseFloat(item.price);

          // Update the Firestore document
          await updateDoc(orderRef, {
            orders: orderData.orders,
            updated: true,
          });
          toast.success("Quantity decreased successfully.");
          console.log("Quantity decreased successfully.");
        }
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleUpdateDeliveryDate = async () => {
    if (updateDate == "") {
      toast.error("Pick a date to update !", { id: "UEU" });
      return;
    }
    const orderRef = doc(db, "approve", state.did);

    try {
      const orderSnapshot = await getDoc(orderRef);

      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();

        // Update the delivery date field
        orderData.orders.forEach((element) => {
          element.deliveryDate = updateDate;
          console.log(orderData.deliveryDate);

          // Update the Firestore document with the new delivery date
        });
        setDoc(
          orderRef,
          { ...orderData, deliveryDateUpdated: true },
          { merge: true }
        );
        toast.success("Delivery Date Updated Successfully!");
        console.log("Delivery Date Updated Successfully!");
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error updating delivery date:", error);
    }
  };

  const removeItem = async (did) => {
    // const cartItemRef = doc(db, "cart", uid, "items", did);

    try {
      // FIRST SEND TO REJECT ORDER COLLECTION THEN PERFORM DELETE FROM APPROVAL
      const rejectCollection = collection(db, "rejected/orders", state.did);
      let data = {
        ...orderToDelete,
        rejectedAt: new Date().toLocaleDateString(),
      };
      await addDoc(rejectCollection, data);

      console.log("Success");

      // Create a reference to the batch in the "approve" collection
      const batchRef = doc(db, "approve", state.did);

      // Check if the batch with the school's email exists in the "approve" collection
      const batchSnapshot = await getDoc(batchRef);
      const existingBatch = batchSnapshot.exists()
        ? batchSnapshot.data()
        : null;
      console.log(existingBatch);
      // If the batch exists, remove the order from the batch
      if (existingBatch) {
        existingBatch.orders = existingBatch.orders.filter(
          (order) => order.did !== did
        );

        // Update the batch document
        await setDoc(batchRef, existingBatch);
        console.log("Success");
      }

      // Refresh the cart and orders
    } catch (error) {
      console.error("Error removing item from cart: ", error);
    }
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

  console.log("Order TO dELETE", orderToDelete);

  return (
    <>
      <Toaster />
      <div className="  flex justify-end">
        <button
          onClick={() => navigate("/list-orders")}
          className="btn btn-neutral "
        >
          <BiLeftArrowAlt /> Go Back
        </button>
      </div>

      <div className="  flex justify-end mt-3 items-center gap-2">
        <input
          type="date"
          onChange={(date) => setUpdateDate(date.target.value)}
        />
        <button
          onClick={handleUpdateDeliveryDate}
          className="btn btn-warning text-white"
        >
          Change Delivery Date Requested{" "}
        </button>{" "}
      </div>
      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Product Name</th>
              <th className="py-3 px-6">Delivery Date Requested</th>
              <th className="py-3 px-6">Quantity</th>
              <th className="py-3 px-6">Unit Price</th>
              <th className="py-3 px-6">Total</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {realtimeOrder?.orders?.map((item, idx) => (
              <>
                <tr key={idx + 1}>
                  <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                    <img src={item?.image} className="w-10 h-10 rounded-full" />
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
                      {/* <span className="block text-gray-700 text-xs">
                      {item.email}
                    </span> */}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.deliveryDate ? (
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
                    ) : (
                      "N/A"
                    )}{" "}
                    {realtimeOrder.deliveryDateUpdated == true ? (
                      <>
                        <span className="badge badge-xs badge-info text-white">
                          Updated
                        </span>
                      </>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-xs"
                        onClick={() => handleDecreaseQuantity(item)}
                      >
                        <BiMinus />
                      </button>{" "}
                      {item.quantity}{" "}
                      <button
                        className="btn btn-xs"
                        onClick={() => handleIncreaseQuantity(item)}
                      >
                        <BiPlus />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {" "}
                    ${parseFloat(item.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${parseFloat(item.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        className={`${
                          stateOrder.selectedOrders.some(
                            (order) => order.did === item.did
                          )
                            ? "btn btn-xs bg-success text-white"
                            : "btn btn-xs hover:bg-success hover:text-white"
                        }`}
                        onClick={() => handleOrderSelection(item)}
                      >
                        <BiCheckCircle />{" "}
                        {`${
                          stateOrder.selectedOrders.some(
                            (order) => order.did === item.did
                          )
                            ? "selected"
                            : "select"
                        }`}
                      </button>

                      <button
                        onClick={() => handleDeleteModal(item)}
                        className="btn btn-xs hover:bg-red-400 hover:text-white"
                      >
                        <MdCancel /> reject
                      </button>
                    </div>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
      <div className="  flex justify-end mt-4">
        <button
          onClick={handleOrderConfirmation}
          disabled={
            stateOrder.selectedOrders.length === 0 || isConfirmationInProgress
          }
          className="btn btn-neutral "
        >
          {isConfirmationInProgress ? (
            "Confirming..."
          ) : (
            <>
              <MdOutlineConfirmationNumber /> Confirm{" "}
            </>
          )}{" "}
        </button>
      </div>

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
                  Reject Item
                </h3>
                <p>
                  Are you sure you want to reject the item: {orderToDelete.name}
                  ?
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

export default OrderInfo;
