import { doc } from "firebase/firestore";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../../Firebase";
import toast, { Toaster } from "react-hot-toast";
import { BiLeftArrowAlt } from "react-icons/bi";

const BuyerOrderStatus = () => {
  const location = useLocation();
  const state = location.state;
  const [isModal, setIsModal] = useState(true);
  const [status, setStatus] = useState("");
  console.log(state);
  const navigate = useNavigate();
  const handleUpdateStatus = async () => {
    if (isModal) {
      setIsModal(false);
    } else {
      setIsModal(true);
    }
  };

  console.log(status);
  return (
    <>
      <Toaster />

      <div className="  flex justify-end">
        <button
          onClick={() => navigate("/buyer-orders")}
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
                      ${item.price}
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
              <button
                onClick={() => navigate("/buyer-invoice", { state: state })}
                className="btn btn-accent text-white "
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerOrderStatus;
