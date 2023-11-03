import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../../../Firebase";
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
import { useNavigate } from "react-router-dom";

import { BsPlus } from "react-icons/bs";
import { BiLeftArrowAlt, BiMinus, BiTrash } from "react-icons/bi";
import toast, { Toaster } from "react-hot-toast";

const Cart = () => {
  const [products, setProducts] = useState();
  const [quantityItem, setQuantity] = useState(1);
  const [inputQuantity, setInputQuantity] = useState([]);
  const [approvalOrders, setApprovalOrders] = useState(null);
  const uid = localStorage.getItem("email");
  const [sendOrder, setSendOrder] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const getCartItem = () => {
    const cartItemRef = collection(db, "cart", `${uid}/items`);

    const unsubscribe = onSnapshot(cartItemRef, (querySnapshot) => {
      const products = querySnapshot.docs.map((doc) => ({
        did: doc.id,
        ...doc.data(),
      }));

      localStorage.setItem("prLen", products.length);

      setProducts(products);
      console.log(products);
    });

    return unsubscribe; // Return the unsubscribe function to stop listening to changes
  };

  const removeItem = async (did) => {
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
      getCartItem();
    } catch (error) {
      console.error("Error removing item from cart: ", error);
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribeCart = getCartItem();
    const unsubscribeApprovals = listenToApprovals();

    // Cleanup the listeners when the component unmounts
    return () => {
      unsubscribeCart();
      unsubscribeApprovals();
    };
  }, [quantityItem]);

  const increaseQnt = async (product) => {
    const did = product.did;

    let newQnt = product.quantity + 1;
    setInputQuantity({ [product.did]: newQnt });
    const data = {
      quantity: newQnt,
      total: parseFloat(newQnt) * parseFloat(product.price).toFixed(2),
    };
    const cartItemRef = doc(db, "cart", `${uid}/items`, did);
    try {
      await updateDoc(cartItemRef, data);
      toast.success("Item successfully added", { id: "Item Added" });
      getCartItem();
    } catch (error) {
      console.error("Error removing item from cart: ", error);
    }
  };

  const decreaseQnt = async (product) => {
    const did = product.did;

    const cartItemRef = doc(db, "cart", `${uid}/items`, did);
    if (product.quantity > 1) {
      let newQnt = product.quantity - 1;
      setInputQuantity({ [product.did]: newQnt });
      const data = {
        quantity: newQnt,
        total: parseFloat(newQnt) * parseFloat(product.price).toFixed(2),
      };
      try {
        await updateDoc(cartItemRef, data);
        toast.success("Item successfully removed", { id: "Item Removed" });
        getCartItem();
      } catch (error) {
        console.error("Error removing item from cart: ", error);
      }
    }
    if (product.quantity <= 1) {
      const data = {
        quantity: product.quantity,
      };
      try {
        removeItem(product.did);

        getCartItem();
      } catch (error) {
        console.error("Error removing item from cart: ", error);
      }
    }
  };

  const handleInputQuantityChange = async (event, product) => {
    console.log(product);
    // Parse the input value to an integer
    if (event.target.value == "" || event.target.value == 0) {
      const newQuantity = 1;

      const cartItemRef = doc(db, "cart", `${uid}/items`, product.did);
      // Update the input quantity state
      setInputQuantity({ [product.did]: newQuantity });

      const data = {
        quantity: newQuantity,
        total: parseFloat(newQuantity) * parseFloat(product.price).toFixed(2),
      };
      try {
        await updateDoc(cartItemRef, data);
        toast.success("Item Quantity Updated !", { id: "Item Input Update" });
        getCartItem();
      } catch (error) {
        console.error("Error removing item from cart: ", error);
      }
    } else {
      const newQuantity = parseFloat(event.target.value, 10);
      const cartItemRef = doc(db, "cart", `${uid}/items`, product.did);
      // Update the input quantity state
      setInputQuantity({ [product.did]: newQuantity });

      const data = {
        quantity: newQuantity,
        total: parseFloat(newQuantity) * parseFloat(product.price),
      };
      try {
        await updateDoc(cartItemRef, data);
        // toast.success("Item successfully removed");
        getCartItem();
      } catch (error) {
        console.error("Error removing item from cart: ", error);
      }
    }
  };

  const totalAmount = products?.reduce((accumulator, product) => {
    return (
      accumulator +
      parseFloat(product.price).toFixed(2) * parseFloat(product.quantity)
    );
  }, 0);

  const handleOrder = async () => {
    setSendOrder(true);
    let emailSent = false;
    try {
      let batchRefs = {}; // Define batchRefs to store batch references for different schools

      // Filter out products with zero quantities or no DID
      const validProducts = products.filter(
        (product) => product.quantity > 0 && product.did
      );

      // Loop through each product in the cart and create/update orders
      for (const product of validProducts) {
        // Get the school's email associated with this product
        const schoolEmail = product.addedById; // Replace with the actual field name

        // Create a reference to the batch in the "approve" collection for this school
        if (!batchRefs[schoolEmail]) {
          batchRefs[schoolEmail] = doc(db, "approve", schoolEmail);
        }

        // Check if the batch with the school's email exists in the "approve" collection
        const batchSnapshot = await getDoc(batchRefs[schoolEmail]);
        const existingBatch = batchSnapshot.exists()
          ? batchSnapshot.data()
          : null;
        console.log(existingBatch);

        // Check if the new product is different from an existing order in the batch
        const isOrderChanged = existingBatch
          ? !existingBatch.orders.some(
              (order) =>
                order.id === product.id &&
                order.name === product.name &&
                order.total === product.total &&
                order.deliveryDate === product.deliveryDate
            )
          : true;
        console.log(isOrderChanged);

        if (isOrderChanged) {
          if (existingBatch) {
            // Find the index of the order within the batch, if it exists
            const orderIndex = existingBatch.orders.findIndex(
              (order) => order.id === product.id && order.name === product.name
            );

            if (orderIndex !== -1) {
              // Update the existing order within the batch
              existingBatch.orders[orderIndex] = product;
            } else {
              // Add the new order to the batch
              existingBatch.orders.push(product);
            }

            // Update the batch document
            await setDoc(batchRefs[schoolEmail], existingBatch);
            products.forEach((element) => {
              const cartItemRef = doc(db, "cart", `${uid}/items`, element.did);
              deleteDoc(cartItemRef);
            });
            navigate("/pending-orders");
          } else {
            // Create a new batch with the product as the first order

            await setDoc(batchRefs[schoolEmail], {
              orders: [product],
            });

            products.forEach((element) => {
              const cartItemRef = doc(db, "cart", `${uid}/items`, element.did);
              deleteDoc(cartItemRef);
            });
          }
          toast.success("Order Sent Successfully!", { id: "Updated" });
          navigate("/pending-orders");
          emailSent = true;
        } else if (!existingBatch) {
          // Only send a new order if it doesn't exist in the batch

          await setDoc(batchRefs[schoolEmail], {
            orders: [product],
          });

          products.forEach((element) => {
            const cartItemRef = doc(db, "cart", `${uid}/items`, element.did);
            deleteDoc(cartItemRef);
          });
          toast.success("Orders Sent for Approval!", { id: "Sent" });
          navigate("/pending-orders");
          emailSent = true;
        } else {
          products.forEach((element) => {
            const cartItemRef = doc(db, "cart", `${uid}/items`, element.did);
            deleteDoc(cartItemRef);
          });
          navigate("/pending-orders");
          toast.error("Already sent for approval!", { id: "Already" });
        }
      }

      setSendOrder(false);
      if (emailSent) {
        console.log("Email Sent");
        const res = await fetch(
          "https://mail-api-l2xn.onrender.com/place-order",
          {
            method: "POST",
            body: JSON.stringify({
              products,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        console.log(data);
      }
    } catch (error) {
      console.error("Error handling orders: ", error);
    }
  };

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

  console.log(approvalOrders);
  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId

    // Set the product to delete and open the modal
    setOrderToDelete(product);
    setDeleteModalOpen(true);
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

  const minDate = new Date();
  const day = minDate.getDay();
  if (day == 5) {
    minDate.setDate(minDate.getDate() + 5);
  } else {
    minDate.setDate(minDate.getDate() + 3); // Minimum 3 days later
  } // Sunday (0) and Saturday (6)

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday (0) and Saturday (6)
  };

  const isWeekday = (date) => {
    return !isWeekend(date);
  };
  function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}-${day}-${year}`;
  }
  const handleDateChange = (date) => {
    console.log(date);

    const newDate = formatDateToISO(date);
    setSelectedDate(date);
    setDeliveryDate(newDate);
    console.log(products);

    products.forEach((item) => {
      console.log(item);
      setTimeout(() => {
        const cartItemRef = doc(db, "cart", `${uid}/items`, item.did);
        const data = {
          custDate: date,
          deliveryDate: newDate,
        };
        try {
          updateDoc(cartItemRef, data);
          toast.success("Delivery Date Request Updated Successfully", {
            id: "DateDelivery",
          });
          getCartItem();
        } catch (error) {
          console.error("Error removing item from cart: ", error);
        }
      }, 500);
    });
  };

  console.log(selectedDate);
  console.log(deliveryDate);
  console.log(products);

  return (
    <>
      <Toaster />

      {products?.length == 0 ? (
        <>
          <div className="flex flex-col mx-auto max-w-3xl p-6 space-y-4 sm:p-10 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="text-xl text-center font-semibold">
              Your cart is empty add some products !
            </h2>

            <div className="flex md:justify-end space-x-4">
              <button
                disabled={sendOrder}
                onClick={() => {
                  navigate("/products");
                }}
                type="button"
                className="btn btn-neutral"
              >
                <BiLeftArrowAlt /> Back
              </button>
            </div>
          </div>

          <hr />
        </>
      ) : (
        <>
          <div className="flex flex-col mx-auto max-w-3xl p-6 space-y-4 sm:p-10 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-semibold">Your cart</h2>
            <ul className="flex flex-col divide-y divide-gray-700">
              {products?.map((product) => (
                <li
                  key={product.name}
                  className="flex flex-col py-6 sm:flex-row sm:justify-between"
                >
                  <div className="flex w-full space-x-2 sm:space-x-4">
                    <img
                      className="flex-shrink-0 object-contain w-20 h-20 dark:border-transparent rounded outline-none sm:w-32 sm:h-32 dark:bg-gray-500"
                      src={product.image}
                      alt={product.name}
                    />
                    <div className="flex flex-col justify-between w-full pb-4">
                      <div className="flex justify-between w-full pb-2 space-x-2">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold leading-snug sm:pr-8">
                            {product.name} x {product.quantity}
                          </h3>
                          {/* <p className="text-sm dark:text-gray-400">
                        {product.color}
                      </p> */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                increaseQnt(product);
                              }}
                              className="btn btn-xs"
                            >
                              <BsPlus />
                            </button>
                            <input
                              className="input w-12 input-bordered input-xs"
                              type="text"
                              value={
                                inputQuantity[product.did] || product.quantity
                              }
                              onFocus={inputQuantity[product.did]}
                              onChange={(e) =>
                                handleInputQuantityChange(e, product)
                              }
                            />
                            <button
                              onClick={() => {
                                decreaseQnt(product);
                              }}
                              className="btn btn-xs"
                            >
                              <BiMinus />
                            </button>
                          </div>

                          <div className="flex gap-2 items-center">
                            <p>Pick a delivery date :</p>{" "}
                            <DatePicker
                              selected={selectedDate}
                              value={
                                deliveryDate
                                  ? deliveryDate
                                  : product.deliveryDate
                              }
                              minDate={minDate}
                              filterDate={isWeekday}
                              onChange={(date) => {
                                handleDateChange(date);
                              }}
                              dateFormat="MM-dd-yyyy"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            $
                            {(product.price * product.quantity)
                              .toFixed(2)
                              .toLocaleString("en-US")}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-sm divide-x">
                        <button
                          onClick={() => {
                            removeItem(product.did);
                          }}
                          type="button"
                          className="flex items-center px-2 py-1 pl-0 space-x-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="w-4 h-4 fill-current"
                          >
                            <path d="M96,472a23.82,23.82,0,0,0,23.579,24H392.421A23.82,23.82,0,0,0,416,472V152H96Zm32-288H384V464H128Z"></path>
                            <rect
                              width="32"
                              height="200"
                              x="168"
                              y="216"
                            ></rect>
                            <rect
                              width="32"
                              height="200"
                              x="240"
                              y="216"
                            ></rect>
                            <rect
                              width="32"
                              height="200"
                              x="312"
                              y="216"
                            ></rect>
                            <path d="M328,88V40c0-13.458-9.488-24-21.6-24H205.6C193.488,16,184,26.542,184,40V88H64v32H448V88ZM216,48h80V88H216Z"></path>
                          </svg>
                          <span>Remove</span>
                        </button>
                        {/* <button
                      type="button"
                      className="flex items-center px-2 py-1 space-x-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="w-4 h-4 fill-current"
                      >
                        <path d="M453.122,79.012a128,128,0,0,0-181.087.068l-15.511,15.7L241.142,79.114l-.1-.1a128,128,0,0,0-181.02,0l-6.91,6.91a128,128,0,0,0,0,181.019L235.485,449.314l20.595,21.578.491-.492.533.533L276.4,450.574,460.032,266.94a128.147,128.147,0,0,0,0-181.019ZM437.4,244.313,256.571,425.146,75.738,244.313a96,96,0,0,1,0-135.764l6.911-6.91a96,96,0,0,1,135.713-.051l38.093,38.787,38.274-38.736a96,96,0,0,1,135.765,0l6.91,6.909A96.11,96.11,0,0,1,437.4,244.313Z"></path>
                      </svg>
                      <span>Add to favorites</span>
                    </button> */}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-1 text-right">
              <p>
                Total amount:
                <span className="font-semibold">
                  {" "}
                  ${totalAmount?.toFixed(2).toLocaleString("en-US")}
                </span>
              </p>
            </div>
            <div className="flex md:justify-end space-x-4">
              <button
                onClick={() => {
                  navigate("/products");
                }}
                type="button"
                className="btn btn-neutral"
              >
                <BiLeftArrowAlt /> Back
              </button>
              <button
                onClick={() => {
                  handleOrder();
                }}
                type="button"
                disabled={sendOrder}
                className="px-6 py-2 border rounded-md dark:bg-violet-400 dark:text-gray-900 dark:border-violet-400"
              >
                <span className="sr-only not-sr-only">Order Now</span>
              </button>
            </div>
          </div>

          <hr />
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

export default Cart;
