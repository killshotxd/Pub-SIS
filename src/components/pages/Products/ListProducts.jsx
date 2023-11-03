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
  const [sortedField, setSortedField] = useState(""); // Initially not sorting
  const [sortDirection, setSortDirection] = useState("asc"); // Initially ascending
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
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

  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId

    // Set the product to delete and open the modal
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // const handleNameSort = (sortDir) => {
  //   console.log(sortDir);
  //   // Sort the products based on the "name" field in ascending order
  //   if (sortDir === "asc") {
  //     filteredItems?.sort((a, b) => {
  //       const nameA = a.name.toLowerCase();
  //       const nameB = b.name.toLowerCase();
  //       return nameA.localeCompare(nameB);
  //     });
  //   } else {
  //     filteredItems?.sort((a, b) => {
  //       const nameA = a.name.toLowerCase();
  //       const nameB = b.name.toLowerCase();
  //       return nameB.localeCompare(nameA);
  //     });
  //   }
  // };

  const toggleSortDirection = (field) => {
    if (sortedField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortedField(field);
      setSortDirection("asc");
    }
  };

  const getSortedItems = () => {
    if (!products) {
      return [];
    }
    const sortedItems = [...products];

    if (sortedField === "name") {
      sortedItems.sort((a, b) => {
        const aValue = a[sortedField].toLowerCase();
        const bValue = b[sortedField].toLowerCase();
        const compareResult =
          sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);

        return compareResult;
      });
    }

    if (sortedField === "status") {
      // Toggle between Active and In-Active
      sortedItems.sort((a, b) => {
        const statusA = a.visibleCheck ? "In-Active" : "Active";
        const statusB = b.visibleCheck ? "In-Active" : "Active";
        return sortDirection === "asc"
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      });
    }

    return sortedItems;
  };

  const applySearchFilter = (items, query) => {
    return items?.filter((item) => {
      const { name, price, pNo } = item;
      const lowercaseQuery = query.toLowerCase();

      return (
        name.toLowerCase().includes(lowercaseQuery) ||
        price.toLowerCase().includes(lowercaseQuery) ||
        pNo.includes(lowercaseQuery)
      );
    });
  };
  const allItems = getSortedItems();
  const filteredItems = applySearchFilter(allItems, searchQuery);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredItems.slice(startIndex, endIndex);
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]); // Include searchQuery in the dependency array

  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    handleDelete(productToDelete.did);
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
      <div className="  flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by product no, name or price."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 md:mb-4 border rounded-md"
        />
        <button
          onClick={() => navigate("/add-product")}
          className="btn btn-neutral "
        >
          + Add Product
        </button>
      </div>

      <div className="mt-3  flex justify-end items-center gap-2">
        <button
          onClick={() => toggleSortDirection("name")}
          className="btn btn-info text-white"
        >
          Sort by name
        </button>
        <button
          onClick={() => toggleSortDirection("status")} // Add this line
          className="btn btn-warning text-white"
        >
          Sort by status
        </button>
        <button
          onClick={() => setSortedField("")}
          className="btn btn-error text-white"
        >
          Clear
        </button>
      </div>

      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Product No</th>
              <th
                className="py-3 px-6"
                onClick={() => toggleSortDirection("name")}
              >
                Name {sortedField === "name" && `(${sortDirection})`}
              </th>

              <th className="py-3 px-6">Price</th>
              <th
                className="py-3 px-6"
                onClick={() => toggleSortDirection("status")}
              >
                Status {sortedField === "status" && `(${sortDirection})`}
              </th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {itemsToDisplay?.map((item, idx) => (
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
                  {item.visibleCheck ? (
                    <>
                      <span className="badge  text-white badge-warning">
                        In-Active
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="badge  text-white badge-success">
                        Active
                      </span>
                    </>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteModal(item)}
                      className="btn btn-xs hover:bg-red-400 hover:text-white"
                    >
                      <BiTrash /> delete
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
                      <BiEdit /> edit
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
  );
};

export default ListProducts;
