import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BiLeftArrowAlt, BiSolidFileImage } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../../../Firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { UserAuth } from "../../context/AuthContext";
const AddSchools = () => {
  const { signUpGoogle } = UserAuth();
  //IMAGE UPLOAD TO FIREBASE STATES
  const imagePicker = useRef();
  const [progress, setProgress] = useState(0);
  const [schoolMails, setSchoolMails] = useState([]);
  const [batchEmail, setBatchEmail] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://firebasestorage.googleapis.com/v0/b/school-inventory-management.appspot.com/o/Default%2Fdownload%20(1).png?alt=media&token=30cc7f78-7bb7-4508-964a-080efbb84e19&_gl=1*bxdxdz*_ga*ODM0NzE4MTczLjE2OTQyNzM5NjQ.*_ga_CW55HF8NVT*MTY5NzgwNjY0NS4xMzEuMS4xNjk3ODA2OTk4LjE4LjAuMA.."
  );
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
  const [password, setPassword] = useState("");
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

  // FN FOR SAVING SCHOOL TO DB

  const handleSchool = async () => {
    if (
      name == "" ||
      email == " " ||
      imageUrl == "" ||
      phone == "" ||
      address == "" ||
      password == ""
    ) {
      toast.error("Please fill required details !");
      return;
    }
    try {
      const schoolRef = doc(db, "Schools", email);
      let schoolDetails = {
        name: name,
        email: email,
        avatar: imageUrl,
        contact: phone,
        address: address,
        password: password,
        city: city,
        zip_code: zip,
        isAdmin: false,
        schoolMails: [...schoolMails, email],
        message: `Welcome, ${name}`,
        time: serverTimestamp(),
      };

      console.log(schoolDetails);

      try {
        await signUpGoogle(email, password);
      } catch (error) {
        console.log(error);
      }

      await setDoc(schoolRef, schoolDetails, { merge: true });

      toast.success("School Added successfully!");

      setName("");
      setEmail("");
      setPassword("");
      setImageUrl("");
      setPhone("");
      setCity("");
      setAddress("");
      setZip("");
      navigate("/list-schools");
    } catch (error) {
      console.log(error);
    }
  };

  const addEmail = () => {
    if (batchEmail) {
      // Check if the email is not empty
      setSchoolMails([...schoolMails, batchEmail]);
      setBatchEmail(""); // Clear the input field
    }
  };
  const removeEmail = (index) => {
    const updatedEmails = [...schoolMails];
    updatedEmails.splice(index, 1);
    setSchoolMails(updatedEmails);
  };

  console.log(schoolMails);
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
              value={name}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Use a regex to remove any characters that are not letters or spaces
                const sanitizedValue = inputValue.replace(/[^a-zA-Z\s]/g, "");
                setName(sanitizedValue);
              }}
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="number">School Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                // Limit the phone number to a maximum of 15 characters
                if (e.target.value.length <= 15) {
                  setPhone(e.target.value);
                }
              }}
              id="number"
              placeholder="School Phone Number"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="name">School Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="School Email"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div>
          <label htmlFor="password">School Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => {
              const inputValue = e.target.value;
              setPassword(inputValue);

              // Perform password validation
              const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
              const isValidPassword = passwordRegex.test(inputValue);

              // You can handle the validation result here and provide user feedback
              if (isValidPassword) {
                // Password is valid
              } else {
                // Password is invalid
              }
            }}
            id="password"
            placeholder="School Password"
            className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
          />
        </div>
      </div>
      {/* INPUT FIELDS */}
      <div className="mt-12">
        <div className="grid md:grid-cols-3  sm:grid-cols-2 gap-8">
          <div>
            <label htmlFor="address">School Address</label>
            <textarea
              name=""
              value={address}
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
              value={city}
              placeholder="School City"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="zip_code">School Zip Code</label>
            <input
              type="number"
              onChange={(e) => setZip(e.target.value)}
              id="zip_code"
              value={zip}
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
              <input className="w-1/2 " type="image" src={imageUrl} alt="" />
            </figure>
          </div>
        </div>

        <div>
          <label htmlFor="batchEmail">Add other school emails</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={batchEmail}
              onChange={(e) => setBatchEmail(e.target.value)}
              id="batchEmail"
              placeholder="Enter School Email"
              className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <button className="btn btn-info text-white" onClick={addEmail}>
              Add Email
            </button>
          </div>

          <div>
            <h3 className="font-semibold">School Batch Emails :</h3>
            <ul>
              {schoolMails.map((email, index) => (
                <li key={index}>
                  {index + 1} - {email}{" "}
                  <button
                    className="btn btn-xs btn-error text-white"
                    onClick={() => removeEmail(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* INPUT FIELDS */}

      <div className="mt-8 pb-8 flex justify-center">
        <button onClick={handleSchool} className="btn btn-info text-white w-64">
          Add School
        </button>
      </div>
    </>
  );
};

export default AddSchools;
