import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import toast, { Toaster } from "react-hot-toast";
import { db, storage } from "../../../../Firebase";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiLeftArrowAlt, BiSolidFileImage } from "react-icons/bi";
import { doc, setDoc } from "firebase/firestore";

const UpdateSchool = () => {
  const location = useLocation();
  const state = location.state;
  console.log(state);
  const imagePicker = useRef();
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [profileImageUploadStarted, setProfileImageUploadStarted] =
    useState(false);
  //IMAGE UPLOAD TO FIREBASE STATES

  const navigate = useNavigate();

  //STATES FOR INPUT
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  //STATES FOR INPUT

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
          toast.success("Image Uploaded Successfully !");
          //   toast.success("Image Uploaded Successfully!");
        });
      }
    );
  };
  const handleUpdate = async (did) => {
    try {
      console.log(did);
      const productRef = doc(db, "Schools", did);
      let school = {
        name: name ? name : state.name,
        phone: phone ? phone : state.contact,
        address: address ? address : state.address,
        city: city ? city : state.city,
        zip: zip ? zip : state.zip_code,
        avatar: imageUrl ? imageUrl : state?.avatar,
      };

      await setDoc(productRef, school, { merge: true });
      toast.success("School Updated Successfully !");

      navigate("/list-schools");
    } catch (error) {
      console.log(error);
    }
  };

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
          onClick={() => navigate("/list-schools")}
          className="btn btn-neutral "
        >
          <BiLeftArrowAlt /> Go Back
        </button>
      </div>

      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div className="grid md:grid-cols-3  sm:grid-cols-2 gap-8">
          <div>
            <label htmlFor="name">School Name</label>
            <input
              type="text"
              placeholder="School Name"
              id="name"
              value={name ? name : state.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="number">School Phone Number</label>
            <input
              type="text"
              value={phone ? phone : state.contact}
              onChange={(e) => setPhone(e.target.value)}
              id="number"
              placeholder="School Phone Number"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="name">School Email</label>
            <input
              type="text"
              value={email ? email : state.email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              readOnly
              placeholder="School Email"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}

      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div className="grid md:grid-cols-3  sm:grid-cols-2 gap-8">
          <div>
            <label htmlFor="address">School Address</label>
            <textarea
              name=""
              value={address ? address : state.address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              id="address"
              cols="0"
              placeholder="School Address"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label htmlFor="city">School City</label>
            <input
              type="text"
              onChange={(e) => setCity(e.target.value)}
              id="city"
              value={city ? city : state.city}
              placeholder="School City"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="zip_code">School Zip Code</label>
            <input
              type="text"
              onChange={(e) => setZip(e.target.value)}
              id="zip_code"
              value={zip ? zip : state.zip_code}
              placeholder="School Zip Code"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}

      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div className="grid md:grid-cols-3   gap-8">
          <div>
            <label htmlFor="address">School Avatar</label>
            <div
              onClick={handleImageClick}
              className=" cursor-pointer btn-ghost shadow-lg w-full p-6 rounded flex justify-center items-center text-xs gap-1"
            >
              <BiSolidFileImage size={30} /> Please upload an Avatar
            </div>
          </div>

          <div className="w-full customImgDiv flex justify-center m-auto mt-4  p-2 items-center px-2 max-w-xs">
            <figure>
              <input
                className="w-1/2 "
                type="image"
                src={imageUrl ? imageUrl : state.avatar}
                alt=""
              />
            </figure>
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}

      <div className="mt-12 flex justify-center pb-8">
        <button
          onClick={() => handleUpdate(state.did)}
          className="btn btn-info text-white w-64"
        >
          Update School
        </button>
      </div>
    </>
  );
};

export default UpdateSchool;
