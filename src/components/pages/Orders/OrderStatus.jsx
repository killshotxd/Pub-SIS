import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../Firebase";
import toast, { Toaster } from "react-hot-toast";
import { BiLeftArrowAlt } from "react-icons/bi";
const OrderStatus = () => {
  const location = useLocation();
  const state = location.state;
  const [isModal, setIsModal] = useState(true);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  console.log(state);
  const navigate = useNavigate();
  const handleUpdateStatus = async () => {
    if (isModal) {
      setIsModal(false);
    } else {
      setIsModal(true);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    if (!status) {
      toast.error("Please Select a Status !");
      return;
    }
    try {
      const docRef = doc(
        db,
        `orders/${state.schoolInfo.email}/Orders/${state.id}`
      );

      // Update the 'status' field in the document
      await updateDoc(docRef, {
        status: status, // Replace 'NewStatusHere' with the new status value
      });
      try {
        const res = await fetch(
          "https://mail-api-l2xn.onrender.com/send-approval-mail",
          {
            method: "POST",
            body: JSON.stringify({
              status: status,
              orders: state.orders,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.error("Error sending confirmation emails:", error);
      }

      toast.success("Status updated successfully.");
      setLoading(false);
      setTimeout(() => {
        navigate("/confirmed-orders");
      }, 800);
      // Log a success message
      console.log("Status updated successfully.");
    } catch (error) {
      console.log(error);
    }
  };

  console.log(status);
  return (
    <>
      <Toaster />

      <div className="  flex justify-end">
        <button
          onClick={() => navigate("/confirmed-orders")}
          className="btn btn-neutral "
        >
          <BiLeftArrowAlt /> Go Back
        </button>
      </div>
      <div className="md:py-4 mx-auto bg-base-100 min-h-screen container md:px-10">
        <div className="items-center justify-start pb-4 flex w-full">
          <p className=" font-bold text-2xl">School Information</p>
        </div>

        <div className="items-center shadow mt-4  mb-4  justify-center flex-wrap divide-x-2 pb-4 gap-8 flex w-full">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img src={state?.schoolInfo?.avatar} />
            </div>
          </div>

          <div className=" pl-4">
            <p className="font-semibold">Name</p>
            <small>
              <p className="font-semibold">{state?.schoolInfo?.name}</p>
            </small>
            {/* <small>{state?.schoolInfo?.dob}</small> */}
          </div>

          <div className=" pl-4">
            <p className="font-semibold">Address</p>
            <small>
              <p className="font-semibold">{state?.schoolInfo?.address}</p>
            </small>
          </div>

          <div className=" pl-4">
            <p className="font-semibold">City</p>
            <small>{state?.schoolInfo?.city}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Contact</p>
            <small>{state?.schoolInfo?.contact}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Email</p>
            <small>{state?.schoolInfo?.email}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Zip Code</p>
            <small>{state?.schoolInfo?.zip_code}</small>
          </div>
          {/* <div className=" pl-4">
            <p className="font-semibold">Phone Number</p>
            <small>{studentDetail?.number}</small>
          </div> */}
        </div>

        <div className="items-center justify-start pb-4 mt-6 flex w-full">
          <p className=" font-bold text-2xl">Order Information</p>
        </div>
        <div className="items-center shadow    justify-center flex-wrap md:py-8   gap-8 flex w-full md:px-6">
          <div className=" w-full shadow-sm border rounded-lg overflow-x-auto">
            <table className="w-full table-auto text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="py-3 px-6">Sr No</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Quantity</th>
                  <th className="py-3 px-6">Unit</th>

                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Status</th>
                  {/* <th className="py-3 px-6">Action</th> */}
                </tr>
              </thead>
              <tbody className="text-gray-600 divide-y">
                {state?.orders?.map((item, idx) => (
                  <tr key={item.did}>
                    <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                    <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                      <img
                        src={item.image}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <span className="block text-gray-700 text-sm font-medium">
                          {item.name}
                        </span>
                        {/* <span className="block text-gray-700 text-xs">
                      {item.email}
                    </span> */}
                      </div>
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
                      {state?.status}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap"></td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col">
          <div className=" px-4 py-6 flex justify-end">
            <div className="flex items-center gap-4">
              <label
                htmlFor="my_modal_7"
                onClick={() => handleUpdateStatus()}
                className="btn btn-neutral "
                disabled={state.status === "Cancelled"}
              >
                Update Status
              </label>
              <button
                onClick={() => navigate("/invoice", { state: state })}
                className="btn btn-accent text-white "
              >
                Download Invoice
              </button>
            </div>

            <input type="checkbox" id="my_modal_7" className="modal-toggle" />
            <div className="modal">
              <div className="modal-box">
                <h3 className="text-lg font-bold">Update Status</h3>
                <div className="py-4">
                  <select
                    onChange={(e) => setStatus(e.target.value)}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled selected>
                      Select Status
                    </option>
                    <option value="On-Route">On-Route</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="py-4">
                  <button
                    disabled={loading}
                    onClick={() => handleUpdate()}
                    className="btn btn-accent text-white"
                  >
                    Update
                  </button>
                </div>
              </div>
              <label className="modal-backdrop" htmlFor="my_modal_7">
                Close
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderStatus;
