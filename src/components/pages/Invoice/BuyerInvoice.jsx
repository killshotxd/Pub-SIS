import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toWords } from "number-to-words";
import logo from "../../../assets/invoiceLogo.jpg";
const BuyerInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [totalAmount, setTotalAmount] = useState();
  const invoiceDetails = location?.state;
  console.log(invoiceDetails);

  const orders = invoiceDetails?.orders;
  useEffect(() => {
    if (orders) {
      // Initialize a variable to store the total
      let total = 0;

      // Iterate through the orders and sum up the "total" value
      orders.forEach((order) => {
        total += parseFloat(order?.total); // Assuming the "total" values are in string format
      });
      setTotalAmount(total);
      // Now, the 'total' variable holds the sum of all the orders' totals
      console.log("Total Order Amount: $" + total);
    }
  }, []);
  let totalAmountInWords;
  if (typeof totalAmount === "number" && isFinite(totalAmount)) {
    totalAmountInWords = toWords(totalAmount);
  } else {
    totalAmountInWords = "Not a valid number";
  }
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  return (
    <>
      <div className="grid-cols-2 w-full drop-shadow-sm card">
        <div className="flex gap-3 justify-end mt-4 mb-4  px-6 ">
          <button
            onClick={() => navigate("/buyer-orders")}
            className="btn btn-neutral text-white"
          >
            Go BACK
          </button>
          <button onClick={handlePrint} className="btn btn-info text-white">
            Print Invoice
          </button>
        </div>
        <div ref={componentRef} className="md:p-4 min-h-screen  bg-white ">
          <div className=" border mx-auto bg-white px-6 py-4 rounded-lg ">
            {/* <!-- Section 1: Invoice Heading and Dates --> */}
            <section className="mb-8 border-b-2 pb-5">
              <div>
                <p className="text-center text-2xl font-bold">ORDER INVOICE</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl text-neutral font-bold mb-2 ">
                    Invoice No. <small>#{invoiceDetails?.id.slice(0, 6)}</small>
                  </h1>
                </div>
                <img src={logo} alt="logo" width={150} />
              </div>

              <div className="flex justify-between text-sm pt-3">
                <div>
                  <p>
                    Invoice Date :
                    <span className="ml-1 font-bold">
                      {new Date(
                        invoiceDetails.orderTimeStamp
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {/* <!-- Section 2: Billing Details --> */}
            <section className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-3">Billed To:</h4>
                  <p className="font-semibold">
                    {" "}
                    {invoiceDetails?.schoolInfo?.name}
                  </p>
                  <p className="font-semibold">
                    {" "}
                    {invoiceDetails?.schoolInfo?.email}
                  </p>

                  <p className="font-semibold">
                    {invoiceDetails?.schoolInfo?.address}
                  </p>

                  <p className="font-semibold">
                    {invoiceDetails?.schoolInfo?.contact}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-3">From:</h4>
                  <p className="font-semibold">
                    Done Right Food Services, Inc.
                  </p>
                  <p className="font-semibold">4256 Central Ave NE</p>
                  <p className="font-semibold">PO Box 21153</p>
                  <p className="font-semibold">Columbia Heights, MN 55421</p>
                  {/* <p className="font-semibold">+91-*******</p> */}
                </div>
              </div>
              <div className="mt-5"></div>
            </section>

            <hr />
            {/* <!-- Section 3: Description Table --> */}
            <section className="mb-8 mt-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral rounded-2xl text-white">
                    <th className="py-2 border-b">#</th>
                    <th className="py-2 border-b">Name</th>
                    <th className="py-2 border-b">Description</th>

                    <th className="py-2 border-b">Quantity</th>
                    <th className="py-2 border-b">Unit</th>

                    {/* <th className="py-2 border-b">Price</th> */}
                    <th className="py-2 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceDetails?.orders?.map((res, i) => (
                    <>
                      <tr key={i}>
                        <td className="py-2 text-center px-4 border-b">
                          <p>{i + 1}</p>
                        </td>
                        <td className="py-2 text-center px-4 border-b">
                          <p>{res?.name}</p>
                        </td>
                        <td className="py-2 text-center px-4 border-b">
                          <p>{res?.description}</p>
                        </td>

                        <td className="py-2 text-center  px-4 border-b">
                          {res?.quantity}
                        </td>
                        <td className="py-2 text-center  px-4 border-b">
                          ${parseFloat(res?.price).toLocaleString("en-US")}
                        </td>
                        <td className="py-2 text-center  px-4 border-b">
                          {res?.total ? (
                            <>${res?.total?.toLocaleString("en-US")}</>
                          ) : (
                            <>
                              $
                              {(
                                parseFloat(res?.price) *
                                parseFloat(res?.quantity)
                              )
                                .toFixed(2)
                                .toLocaleString("en-US")}
                            </>
                          )}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </section>

            {/* <!-- Section 4: Totals --> */}
            <section className="flex justify-end">
              <div className="w-1/2">
                {/* <div className="flex justify-between border-b p-1">
              <span className="text-[0.8rem] font-semibold">Discount:</span>
              <span className="text-[0.8rem] font-semibold">$0.00</span>
            </div> */}
                <div className=" bg-neutral text-white rounded-md flex justify-between border-b p-1">
                  <span className="text-[0.8rem] font-bold">Total:</span>
                  <span className="text-[0.8rem] font-bold ">
                    ${totalAmount?.toLocaleString("en-US")}
                  </span>
                </div>
                {/* <div className="flex justify-between p-1">
              <span className="text-[0.8rem] font-bold">Amount Due:</span>
              <span className="text-[0.8rem] font-bold">$1000.00</span>
            </div> */}
              </div>
            </section>

            {/* <div className="mt-4 border p-2">
              <div className="grid grid-cols-2">
                <div>
                  {" "}
                  <div>
                    <small>Amount chargeable (in words):</small>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {totalAmountInWords?.toUpperCase()} DOLLARS
                    </p>
                  </div>
                </div>
                <div className="flex justify-end flex-col items-end pr-6 gap-10">
                  <p>Signature</p>
                  DIGITAL SIGNATURE
                  <p>....................................</p>
                </div>
              </div>

              <div className="mt-16">
                <span className=" underline">Declaration</span>
                <p>
                  We declare that this invoice shows the actual price of the
                  goods/services described and that all particulars are true and
                  correct. Any sale product for warranty contact to service
                  center not shop keeper.
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerInvoice;
