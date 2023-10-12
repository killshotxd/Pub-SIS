import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../Firebase";
import { BiEdit, BiTrash } from "react-icons/bi";
import toast, { Toaster } from "react-hot-toast";

const ListSchools = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(null);
  const itemsPerPage = 7;
  const [searchQuery, setSearchQuery] = useState("");
  //   FETCH SCHOOLS FROM DB

  const fetchSchools = async () => {
    try {
      // Get a reference to the "Admin" collection
      const schoolsRef = collection(db, "Schools");

      // Get all documents in the "Admin" collection
      const querySnapshot = await getDocs(schoolsRef);

      // Extract the data from each document

      const schoolsList = querySnapshot.docs.map((doc) => ({
        did: doc.id,
        ...doc.data(),
      }));
      schoolsList.sort((a, b) => b.time - a.time);

      const totalPages = Math.ceil(schoolsList?.length / itemsPerPage);

      // Generate an array of page numbers
      const generatedPages = [];
      for (let i = 1; i <= totalPages; i++) {
        generatedPages.push(i);
      }
      // Update the adminList array in reverse order so the newest data comes first
      // setAdminList(adminList.reverse());

      // Now "adminList" contains an array of all documents in the "Admin" collection
      console.log(schoolsList);
      setPages(generatedPages);
      setSchools(schoolsList);
      return schoolsList;
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
  const itemsToDisplay = schools?.slice(startIndex, endIndex);
  useEffect(() => {
    fetchSchools();
  }, [currentPage]);

  const handleDelete = async (did) => {
    try {
      const docRef = doc(db, "Schools", did);
      await deleteDoc(docRef);
      toast.success("School Deleted Successfully !");
      fetchSchools();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredItems = itemsToDisplay?.filter((item) => {
    const { name, city, contact, email } = item;
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query) ||
      contact.includes(query) ||
      email.toLowerCase().includes(query)
    );
  });
  return (
    <>
      <Toaster />
      <div className="  flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name, city, phone number, or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 md:mb-4 border rounded-md"
        />
        <button
          onClick={() => navigate("/add-schools")}
          className="btn btn-neutral "
        >
          + Add School
        </button>
      </div>

      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Sr No</th>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Phone number</th>

              <th className="py-3 px-6">City</th>
              <th className="py-3 px-6">Zip</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {filteredItems?.map((item, idx) => (
              <tr key={item.did}>
                <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                <td className="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                  <img src={item.avatar} className="w-10 h-10 rounded-full" />
                  <div>
                    <span className="block text-gray-700 text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="block text-gray-700 text-xs">
                      {item.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.contact}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.city}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.zip_code}</td>
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
                        navigate(`/edit-school/${item.did}`, { state: item })
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

export default ListSchools;
