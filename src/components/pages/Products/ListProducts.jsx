import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../Firebase";
import { BiEdit, BiTrash } from "react-icons/bi";

const ListProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(null);
  const itemsPerPage = 7;
  const [searchQuery, setSearchQuery] = useState("");
  //   FETCH Products FROM DB

  const fetchProducts = async () => {
    try {
      // Get a reference to the "Admin" collection
      const schoolsRef = collection(db, "Products");

      // Get all documents in the "Admin" collection
      const querySnapshot = await getDocs(schoolsRef);

      // Extract the data from each document

      const productsList = querySnapshot.docs.map((doc) => ({
        did: doc.id,
        ...doc.data(),
      }));
      productsList.sort((a, b) => b.time - a.time);
      const totalPages = Math.ceil(productsList?.length / itemsPerPage);

      // Generate an array of page numbers
      const generatedPages = [];
      for (let i = 1; i <= totalPages; i++) {
        generatedPages.push(i);
      }
      // Update the adminList array in reverse order so the newest data comes first
      // setAdminList(adminList.reverse());

      // Now "adminList" contains an array of all documents in the "Admin" collection
      console.log(productsList);
      setPages(generatedPages);
      setProducts(productsList);
      return productsList;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = products?.slice(startIndex, endIndex);
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleDelete = async (did) => {
    try {
      const docRef = doc(db, "Products", did);
      await deleteDoc(docRef);
      toast.success("Product Deleted Successfully !");
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredItems = itemsToDisplay?.filter((item) => {
    const { name, price, pNo } = item;
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      price.toLowerCase().includes(query) ||
      pNo.includes(query)
    );
  });
  return (
    <>
      <Toaster />
      <div className="  flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by product no, name or price."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 md:mb-4 border rounded-md"
        />
        <button
          onClick={() => navigate("/add-product")}
          className="btn btn-neutral "
        >
          + Add Product
        </button>
      </div>

      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Product No</th>
              <th className="py-3 px-6">Name</th>

              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {filteredItems?.map((item, idx) => (
              <tr key={item.did}>
                <td className="px-6 py-4 whitespace-nowrap">{item.pNo}</td>
                <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                  <img src={item.image} className="w-10 h-10 rounded-full" />
                  <div>
                    <span className="block text-gray-700 text-sm font-medium">
                      {item.name}
                    </span>
                    {/* <span className="block text-gray-700 text-xs">
                      {item.email}
                    </span> */}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">${item.price}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDelete(item.did)}
                      className="btn btn-xs hover:bg-red-400 hover:text-white"
                    >
                      <BiTrash />
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/edit-product/${item.did}`, {
                          state: item,
                          replace: true,
                        })
                      }
                      className="btn btn-xs  hover:bg-info hover:text-white"
                    >
                      <BiEdit />
                    </button>
                  </div>
                </td>
              </tr>
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
  );
};

export default ListProducts;
