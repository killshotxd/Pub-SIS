import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../Firebase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const SchoolProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(null);
  const itemsPerPage = 7;
  const [searchQuery, setSearchQuery] = useState("");
  //   FETCH Products FROM DB

  const fetchProducts = async () => {
    try {
      const currentUserEmail = localStorage.getItem("email"); // Get the current user's email from local storage

      // Get a reference to the "Products" collection
      const productsRef = collection(db, "Products");

      // Get all documents in the "Products" collection
      const querySnapshot = await getDocs(productsRef);

      // Extract the data from each document and filter based on the current user's email
      const productsList = querySnapshot.docs
        .map((doc) => ({
          did: doc.id,
          ...doc.data(),
        }))
        .filter((product) => {
          // Check if 'visibleFor' contains the current user's email in 'value'
          return product?.visibleFor?.some(
            (emailObj) => emailObj.value === currentUserEmail
          );
        }); // Filter based on visibility

      const totalPages = Math.ceil(productsList?.length / itemsPerPage);

      // Generate an array of page numbers
      const generatedPages = [];
      for (let i = 1; i <= totalPages; i++) {
        generatedPages.push(i);
      }

      // Now "filteredProducts" contains an array of products that match the search query
      console.log(productsList);
      setPages(generatedPages);
      setProducts(productsList);
      return productsList;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };
  // Filter products based on the search query
  const filteredProducts = products?.filter((product) => {
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.price.includes(searchQuery)
    );
  });

  filteredProducts?.sort((a, b) => b.time - a.time);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = products?.slice(startIndex, endIndex);
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);
  const addToCart = async (product) => {
    try {
      const uid = localStorage.getItem("email");
      const cartRef = collection(db, "cart", `${uid}/items`);
      const querySnapshot = await getDocs(cartRef);
      const cartItems = querySnapshot.docs.map((doc) => doc.data());
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        (item) => item.id === product.id && item.name === product.name
      );
      if (existingItem) {
        toast.error("Item already exists in cart!");
        return;
      }
      const totalPrice = parseInt(product.price);

      const cartData = {
        image: product.image,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: totalPrice,
        description: product.description,
        addedAt: serverTimestamp(),
        addedById: uid,
      };

      await addDoc(collection(db, "cart", `${uid}/items`), cartData);
      toast.success("Item added to cart!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="py-4 px-2">
        <p className="text-4xl font-semibold">Our Products</p>
      </div>

      <div className="py-6">
        <input
          type="text"
          placeholder="Search by Product Name, Description or Price"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
        />
      </div>
      <div className="mx-auto grid w-full max-w-7xl items-center space-y-4 px-2 py-10 md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-4">
        {filteredProducts?.map((res, i) => (
          <>
            {!res?.visibleCheck && (
              <div key={i} className="rounded-md border">
                <img
                  src={res.image}
                  alt={res.name}
                  className="aspect-[16/9] w-full rounded-md md:aspect-auto md:h-[300px] lg:h-[200px]"
                />
                <div className="p-4">
                  <h1 className="inline-flex items-center gap-3 text-lg font-semibold">
                    {res.name}{" "}
                    <span className="badge badge-info text-white">
                      ${res.price}
                    </span>
                  </h1>
                  <p className="mt-3 text-sm text-gray-600">
                    {res.description}
                  </p>

                  <button
                    onClick={() => addToCart(res)}
                    type="button"
                    className="mt-4 w-full rounded-sm bg-black px-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/product-info/${res?.did}`, { state: res })
                    }
                    type="button"
                    className="mt-4 w-full rounded-sm bg-info px-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-info focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    View Product
                  </button>
                </div>
              </div>
            )}
          </>
        ))}
      </div>
    </>
  );
};

export default SchoolProducts;
