import { toWords } from "number-to-words";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import logo from "../../../assets/invoiceLogo.jpg";
const BatchInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [totalAmount, setTotalAmount] = useState();
  const invoiceDetails = location?.state;
  console.log(invoiceDetails);

  // let totalAmountInWords;
  // if (typeof totalAmount === "number" && isFinite(totalAmount)) {
  //   totalAmountInWords = toWords(totalAmount);
  // } else {
  //   totalAmountInWords = "Not a valid number";
  // }

  const schoolSums = []; // Array to store sums for each school

  invoiceDetails[0].forEach((invoice) => {
    const schoolName = invoice.schoolInfo.name; // Replace with the actual field name
    const total = invoice.orders.reduce(
      (acc, order) => acc + (order.total || 0),
      0
    );

    // Find the index of the school in the array
    const schoolIndex = schoolSums.findIndex(
      (school) => school.name === schoolName
    );

    if (schoolIndex !== -1) {
      // If the school exists in the array, add the total
      schoolSums[schoolIndex].total += total;
    } else {
      // If the school doesn't exist, add it to the array
      schoolSums.push({ name: schoolName, total });
    }
  });

  console.log(schoolSums);
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  return (
    <>
      <div className="grid-cols-2 w-full drop-shadow-sm card">
        <div className="flex gap-3 justify-end mt-4 mb-4  px-6 ">
          <button
            onClick={() => navigate("/confirmed-orders")}
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
              <div className="flex items-center justify-between mt-4">
                <div>
                  <h1 className="text-2xl text-neutral font-bold mb-2 ">
                    Batch Invoice{" "}
                    {invoiceDetails[1]?.date.fromDate ? (
                      <>
                        #({invoiceDetails[1]?.date.fromDate} -{" "}
                        {invoiceDetails[1]?.date.fromToDate})
                      </>
                    ) : (
                      ""
                    )}
                  </h1>
                </div>
                <img src={logo} alt="logo" width={150} />
              </div>

              <div className="flex justify-between text-sm pt-3">
                <div>
                  {/* <p>
                    Invoice Date :
                    <span className="ml-1 font-bold">
                      {invoiceDetails?.orderTimeStamp.slice(0, 10)}
                    </span>
                  </p> */}
                </div>
              </div>
            </section>

            {/* <!-- Section 2: Billing Details --> */}
            {/* <section className="mb-8">
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
                  <p className="font-semibold">Shine Computers & Sparest</p>
                  <p className="font-semibold">www.onlinescs.in</p>
                  <p className="font-semibold">GSTIN/UIN: 92371553627326</p>
                  <p className="font-semibold">
                    Bankati Chak, 87-A, Raiganj Rd, near Choti Maszid, Raiganj,
                    Gorakhpur, Uttar Pradesh 273001
                  </p>
                  <p className="font-semibold">+91-9140427414</p>
                </div>
              </div>
              <div className="mt-5"></div>
            </section> */}

            <hr />
            {/* <!-- Section 3: Description Table --> */}

            {invoiceDetails[0]?.map((res1) => (
              <>
                <section key={res1.id} className="mb-8 mt-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral rounded-2xl text-white">
                        <th className="py-2 border-b">Order Id </th>
                        <th className="py-2 border-b">School Name </th>
                        <th className="py-2 border-b">Order Date</th>
                        <th className="py-2 border-b">Name</th>
                        <th className="py-2 border-b">Description</th>

                        <th className="py-2 border-b">Quantity</th>
                        <th className="py-2 border-b">Unit</th>

                        {/* <th className="py-2 border-b">Price</th> */}
                        <th className="py-2 border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res1?.orders?.map((res, i) => (
                        <>
                          <tr key={i}>
                            <td className="py-2 text-center px-4 border-b">
                              <p>#{res1?.id.slice(0, 6)}</p>
                            </td>
                            <td className="py-2 text-center px-4 border-b">
                              <p>{res1?.schoolInfo.name}</p>
                            </td>
                            <td className="py-2 text-center px-4 border-b">
                              <p>
                                {new Date(
                                  res1.orderTimeStamp
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </p>
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
                                    parseInt(res?.price) *
                                    parseInt(res?.quantity)
                                  ).toLocaleString("en-US")}
                                </>
                              )}
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </section>

                <div className=" bg-neutral text-white px-2 mt-3 flex justify-between border-b p-1 gap-3">
                  <p className="text-[0.8rem] font-bold">Order Total</p>
                  <p className="text-[0.8rem] font-bold ">
                    $
                    {Number(
                      res1?.orders
                        ?.reduce((acc, order) => acc + (order.total || 0), 0)
                        .toFixed(2)
                    )}
                    {/* ${totalAmount?.toLocaleString("en-US")} */}
                  </p>
                </div>
              </>
            ))}

            {/* <!-- Section 4: Totals --> */}
            <section className="flex justify-end">
              <div className="w-full">
                {/* <div className="flex justify-between border-b p-1">
                <span className="text-[0.8rem] font-semibold">Discount:</span>
                <span className="text-[0.8rem] font-semibold">$0.00</span>
              </div> */}
                {schoolSums?.map((res) => (
                  <>
                    <div className=" bg-neutral text-white px-2 mt-3 flex justify-between border-b p-1 gap-3">
                      <p className="text-[0.8rem] font-bold">
                        TOTAL - {res?.name}:
                      </p>
                      <p className="text-[0.8rem] font-bold ">
                        ${res?.total.toFixed(2)}
                        {/* ${totalAmount?.toLocaleString("en-US")} */}
                      </p>
                    </div>
                  </>
                ))}
                {/* <div className="flex justify-between p-1">
                <span className="text-[0.8rem] font-bold">Amount Due:</span>
                <span className="text-[0.8rem] font-bold">$1000.00</span>
              </div> */}
              </div>
            </section>

            {/* <!-- Section 4: Totals --> */}
            <section className="flex justify-end">
              <div className="w-1/2">
                {/* <div className="flex justify-between border-b p-1">
                <span className="text-[0.8rem] font-semibold">Discount:</span>
                <span className="text-[0.8rem] font-semibold">$0.00</span>
              </div> */}

                <div className=" bg-neutral text-white px-2 mt-3 flex justify-between border-b p-1 gap-3">
                  <p className="text-[0.8rem] font-bold">Final Total</p>
                  <p className="text-[0.8rem] font-bold ">
                    $
                    {Number(
                      schoolSums
                        ?.reduce((acc, order) => acc + (order.total || 0), 0)
                        .toFixed(2)
                    )}
                    {/* ${totalAmount?.toLocaleString("en-US")} */}
                  </p>
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

export default BatchInvoice;
