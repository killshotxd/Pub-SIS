import { BiCheckCircle, BiLeftArrowAlt } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../Firebase";
import toast, { Toaster } from "react-hot-toast";
const OrderInfo = () => {
  const location = useLocation();
  const state = location.state;
  console.log(state);
  const navigate = useNavigate();
  const [stateOrder, setStateOrder] = useState({
    status: "Confirmed", // Orders data for the specific school
    selectedOrders: [], // Store selected orders for confirmation
  });

  const handleOrderConfirmation = async () => {
    if (stateOrder.selectedOrders.length === 0) {
      toast.error("Please select some products!");
      return;
    }
    try {
      const schoolId = state.schoolData.email;

      // Create a reference to the "orders" collection for the school
      const ordersRef = collection(db, "orders", schoolId, "Orders");

      // Create an array of promises to add confirmed orders

      // Add a new document for each confirmed order
      await addDoc(ordersRef, {
        orders: stateOrder.selectedOrders,
        status: "Confirmed",
        orderTimeStamp: new Date().toISOString(),
      });

      // Delete the corresponding approve request from the school's batch
      const approveRef = doc(db, "approve", schoolId);
      const approveSnapshot = await getDoc(approveRef);
      const existingBatch = approveSnapshot.exists()
        ? approveSnapshot.data()
        : null;

      if (existingBatch) {
        // Remove selected orders from the existing batch
        existingBatch.orders = existingBatch.orders.filter(
          (order) =>
            !stateOrder.selectedOrders.some(
              (selectedOrder) => selectedOrder.did === order.did
            )
        );

        // Update the batch document
        await setDoc(approveRef, existingBatch);
        try {
          const res = await fetch(
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

          const data = await res.json();

          console.log(data);
        } catch (error) {
          console.log(error);
        }

        stateOrder.selectedOrders.forEach((element) => {
          const cartRef = doc(db, "cart", schoolId, "items", element.did);
          deleteDoc(cartRef);
        });
      }

      // Clear the selected orders
      setStateOrder({
        ...stateOrder,
        selectedOrders: [],
      });

      // Display a success message
      toast.success("Orders Confirmed and Approve Request Deleted!");

      setTimeout(() => {
        navigate("/confirmed-orders");
      }, 500);
    } catch (error) {
      console.error("Error confirming orders:", error);
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
      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Product Name</th>
              {/* <th className="py-3 px-6">Date</th> */}
              <th className="py-3 px-6">Quantity</th>
              <th className="py-3 px-6">Unit Price</th>
              <th className="py-3 px-6">Total</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {state?.orders?.map((item, idx) => (
              <>
                <tr key={item.did}>
                  <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                    <img src={item?.image} className="w-10 h-10 rounded-full" />
                    <div>
                      <span className="block text-gray-700 text-sm font-medium">
                        {item?.name}
                      </span>
                      {/* <span className="block text-gray-700 text-xs">
                      {item.email}
                    </span> */}
                    </div>
                  </td>

                  {/* <td className="px-6 py-4 whitespace-nowrap">{item.price}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${parseInt(item.price) * parseInt(item.quantity)}
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
                        <BiCheckCircle />
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
          disabled={stateOrder.selectedOrders.size === 0}
          className="btn btn-neutral "
        >
          <MdOutlineConfirmationNumber /> Confirm
        </button>
      </div>
    </>
  );
};

export default OrderInfo;
