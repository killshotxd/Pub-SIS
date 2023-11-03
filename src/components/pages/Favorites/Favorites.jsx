import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../Firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Favorites = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [favProduct, setFavProduct] = useState(null);
  const [products, setProduct] = useState(null);
  const getFav = async () => {
    const email = localStorage.getItem("email");
    try {
      const favRef = collection(db, "Favorites", `${email}/items`);
      const querySnapshot = await getDocs(favRef);
      const favItems = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      console.log(favItems);

      const productDataArray = [];

      for (const item of favItems) {
        const ItemRef = doc(db, "Products", item.did);
        const itemSnapshot = await getDoc(ItemRef);
        const productData = itemSnapshot.data();

        if (productData) {
          productDataArray.push(productData);
        }
      }

      setFavProduct(productDataArray);
    } catch (error) {
      console.log(error);
    }
  };
  const addToCart = async (product) => {
    console.log(product);

    const ItemRef = doc(db, "Products", `${product.did}`);
    const itemSnapshot = await getDoc(ItemRef);
    const productData = itemSnapshot.data();

    // if (productData.visibleCheck == true) {
    //   toast.error("This Product is not available right now !");
    //   return;
    // }
    try {
      const uid = localStorage.getItem("email");
      const cartRef = collection(db, "cart", `${uid}/items`);
      const querySnapshot = await getDocs(cartRef);
      const cartItems = querySnapshot.docs.map((doc) => doc.data());
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        (item) => item.id === product.id || item.name === product.name
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
      navigate("/cart");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFav();
  }, []);

  const filteredProducts = favProduct?.filter((product) => {
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.price.includes(searchQuery)
    );
  });

  filteredProducts?.sort((a, b) => b.time - a.time);

  const removeFav = async (res) => {
    const email = localStorage.getItem("email");
    try {
      const favRef = doc(db, "Favorites", `${email}/items/${res.id}`);

      await deleteDoc(favRef);
      toast.success("Product removed from Favorites !");

      getFav();
    } catch (error) {
      console.log(error);
    }
  };

  console.log(favProduct);

  return (
    <>
      <Toaster />
      <div className="py-4 px-2">
        <p className="text-4xl font-semibold">Favorites</p>
      </div>

      {filteredProducts?.length == 0 ? (
        <>
          <p className="text-center font-semibold text-3xl">
            You don't have any favorite product !
          </p>
        </>
      ) : (
        <>
          {" "}
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
                {!res?.visibleCheck ? (
                  <div key={i + 1} className="rounded-md border">
                    <img
                      src={res?.image}
                      alt={res?.name}
                      className="aspect-[16/9] w-full rounded-md md:aspect-auto md:h-[300px] lg:h-[200px]"
                    />
                    <div className="p-4">
                      <h1 className="inline-flex items-center gap-3 text-lg font-semibold">
                        {res?.name}{" "}
                        <span className="badge badge-info text-white">
                          ${res?.price}
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
                        onClick={() => removeFav(res)}
                        type="button"
                        className="mt-4 w-full rounded-sm bg-orange-600 px-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        Remove From Favorites
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
                ) : (
                  <>
                    <div
                      key={i + 1}
                      className="rounded-md border disabled-product"
                    >
                      <img
                        src={res?.image}
                        alt={res?.name}
                        className="aspect-[16/9] w-full rounded-md md:aspect-auto md:h-[300px] lg:h-[200px]"
                      />
                      <span className="badge text-center w-full badge-error badge-xs text-white">
                        Not Available
                      </span>
                      <div className="p-4">
                        <h1 className="inline-flex items-center gap-3 text-lg font-semibold">
                          {res?.name}{" "}
                          <span className="badge badge-info text-white">
                            ${res?.price}
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
                          onClick={() => removeFav(res)}
                          type="button"
                          className="mt-4 w-full rounded-sm bg-orange-600 px-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          Remove From Favorites
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/product-info/${res?.did}`, {
                              state: res,
                            })
                          }
                          type="button"
                          className="mt-4 w-full rounded-sm bg-info px-2 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-info focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default Favorites;
