import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast, { Toaster } from "react-hot-toast";
import { BiLeftArrowAlt, BiSolidFileImage } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage } from "../../../../Firebase";
import { useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { MultiSelect } from "react-multi-select-component";

const EditProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  console.log(state);
  const [pNo, setPNo] = useState();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [description, setDescription] = useState("");
  const [schools, setSchools] = useState([]);
  // Initialize the selected options based on 'visibleFor'
  const [selected, setSelected] = useState(state?.visibleFor);
  //IMAGE UPLOAD TO FIREBASE STATES
  const imagePicker = useRef();
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [visibleCheck, setVisibleCheck] = useState(state.visibleCheck);
  const [profileImageUploadStarted, setProfileImageUploadStarted] =
    useState(false);

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

      // Now "adminList" contains an array of all documents in the "Admin" collection
      console.log(schoolsList);
      setSchools(schoolsList);

      return schoolsList;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);
  //IMAGE UPLOAD TO FIREBASE STATES
  const handleMultiSelectChange = (selectedOptions) => {
    console.log(selectedOptions);
    // Extract and store selected school emails in an array

    setSelected(selectedOptions);
  };
  //IMAGE UPLOAD TO FIREBASE STATES

  // FN FOR UPLOADING IMAGE TO FIREBASE
  const handleImageClick = () => {
    imagePicker.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;
    setProfileImageUploadStarted(true);
    uploadImage(
      file,
      (progress) => {
        setProgress(Math.round(progress));
      },
      (url) => {
        setImageUrl(url);

        uploadImage(url);

        setProfileImageUploadStarted(false);
        setProgress(0);
      },
      (err) => {
        console.log("Error->", err);
        setProfileImageUploadStarted(false);
      }
    );
  };

  // UPLOAD TO FIREBASE STORAGE
  const uploadImage = (file, progressCallback, urlCallback, errorCallback) => {
    if (!file) {
      errorCallback("File not found");
      return;
    }
    const fileType = file.type;
    const userEmail = localStorage.getItem("email");
    const storageRef = ref(storage, `${userEmail}/${fileType}/${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressCallback(progress);
      },
      (error) => {
        errorCallback(error.message);
      },
      () => {
        getDownloadURL(storageRef).then((url) => {
          urlCallback(url);
          toast.success("Image Updated Successfully !");
          //   toast.success("Image Uploaded Successfully!");
        });
      }
    );
  };

  // FN FOR SAVING Products TO DB

  const handleUpdateProduct = async (did) => {
    try {
      console.log(did);
      const productRef = doc(db, "Products", did);
      let product = {
        name: name ? name : state.name,
        pNo: pNo ? pNo : state.pNo,
        price: price ? price : state.price,
        description: description ? description : state.description,
        visibleFor: selected ? selected : state.visibleFor,
        visibleCheck: visibleCheck,
        image: imageUrl ? imageUrl : state?.image,
      };

      await setDoc(productRef, product, { merge: true });
      toast.success("Product Updated Successfully !");

      navigate("/list-product");
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckboxChange = (event) => {
    setVisibleCheck(event.target.checked);
  };
  console.log(visibleCheck);
  return (
    <>
      <Toaster />
      <input
        type="file"
        hidden
        accept="image/*"
        ref={imagePicker}
        onChange={handleImageChange}
      />
      <div className="  flex justify-end">
        <button
          onClick={() => navigate("/list-product")}
          className="btn btn-neutral "
        >
          <BiLeftArrowAlt /> Go Back
        </button>
      </div>

      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div className="grid md:grid-cols-4  sm:grid-cols-2 gap-8">
          <div>
            <label htmlFor="pnumber">Product Number</label>
            <input
              type="number"
              value={pNo ? pNo : state.pNo}
              onChange={(e) => setPNo(e.target.value)}
              id="pnumber"
              placeholder="Product Number"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              placeholder="Product Name"
              id="name"
              value={name ? name : state.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="number">Product Price</label>
            <input
              type="number"
              value={price ? price : state.price}
              onChange={(e) => setPrice(e.target.value)}
              id="number"
              placeholder="Product Price"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="check">Inactive</label>
            <input
              type="checkbox"
              id="check"
              checked={visibleCheck} // Bind the checkbox to the state
              onChange={handleCheckboxChange} // Handle checkbox changes
              className="w-full  pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}

      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div className="grid md:grid-cols-2   gap-8">
          <div>
            <label htmlFor="desc">Product Description</label>
            <input
              type="text"
              value={description ? description : state?.description}
              onChange={(e) => setDescription(e.target.value)}
              id="desc"
              placeholder="Product Description"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div className="max-w-[90vw]">
            <label className="font-semibold">Visible For : </label>
            <MultiSelect
              options={schools.map((school) => ({
                label: school.name, // Display name
                value: school.email, // Unique identifier (email in this case)
              }))}
              value={selected}
              onChange={handleMultiSelectChange}
              labelledBy="Select"
              hasSelectAll={true} // Remove select all option if not needed
            />
          </div>
          <div>
            <label htmlFor="address">Product Image</label>
            <div
              onClick={handleImageClick}
              className=" cursor-pointer btn-ghost shadow-lg w-full p-6 rounded flex justify-center items-center text-xs gap-1"
            >
              <BiSolidFileImage size={30} /> Please upload an Image
            </div>
          </div>

          <div className="w-full customImgDiv flex justify-center m-auto mt-4  p-2 items-center px-2 max-w-xs">
            <figure>
              <input
                className="w-1/2 "
                type="image"
                src={imageUrl ? imageUrl : state.image}
                alt=""
              />
            </figure>
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => handleUpdateProduct(state.did)}
          className="btn btn-info text-white w-64"
        >
          Update Product
        </button>
      </div>
    </>
  );
};

export default EditProduct;
