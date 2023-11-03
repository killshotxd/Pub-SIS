import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../Firebase";
import { useEffect, useRef, useState } from "react";
import { BiArrowToRight, BiEdit, BiSolidFileImage } from "react-icons/bi";
import toast, { Toaster } from "react-hot-toast";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [schools, setSchools] = useState(null);
  const [message, setMessage] = useState(null);
  const [notice, setNotice] = useState(null);
  const [newMes, setNewMes] = useState("");
  const [newNotice, setNewNotice] = useState("");
  const [link, setLink] = useState("");
  const [link2, setLink2] = useState("");
  const [link3, setLink3] = useState("");
  const [visibleCheck, setVisibleCheck] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState("");
  const imagePicker = useRef();
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [imageUrl, setImageUrl] = useState();
  const [profileImageUploadStarted, setProfileImageUploadStarted] =
    useState(false);
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
  const getUser = async () => {
    try {
      const uid = localStorage.getItem("uid");
      console.log(uid);
      const userRef = doc(db, "admin", uid);
      const userDocSnapshot = await getDoc(userRef);
      const userData = userDocSnapshot.data();
      if (userData) {
        console.log(userData);
        setUserData(userData);
      } else {
        const uid = localStorage.getItem("email");
        console.log(uid);
        const SchoolRef = doc(db, "Schools", uid);
        const userDocSnapshot = await getDoc(SchoolRef);
        const schoolData = userDocSnapshot.data();
        console.log(schoolData);
        setUserData(schoolData);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUser();
    getSchools();
  }, []);

  const getSchools = async () => {
    const SchoolRef = collection(db, "Schools");
    const userDocSnapshot = await getDocs(SchoolRef);
    const schoolData = userDocSnapshot.docs.map((doc) => doc.data());
    console.log(schoolData);
    setSchools(schoolData);
  };

  // Function to handle the select box change
  const handleSchoolSelectChange = (e) => {
    const selectedEmail = e.target.value;
    setSchoolEmail(selectedEmail);

    // Use the selectedEmail to find the corresponding school in the schools array
    const selectedSchool = schools.find(
      (school) => school.email === selectedEmail
    );

    // Update the message, notice, and link states with the selected school's data
    if (selectedSchool) {
      setNewMes(selectedSchool.message);
      setNewNotice(selectedSchool.notice);
      setLink(selectedSchool.link);
      setLink2(selectedSchool.link2);
      setLink3(selectedSchool.link3);
      setImageUrl(selectedSchool.watermark);
    } else {
      // Handle the case when no school is selected or not found
      setMessage(null);
      setNotice(null);
      setLink("");
      setLink2("");
      setLink3("");
      setImageUrl("");
    }
  };

  const handleUpdate = async () => {
    if (!link.startsWith("http")) {
      toast.error("Link should start with http !");
      return;
    }
    if (visibleCheck) {
      console.log(visibleCheck);
      let data = {
        message: newMes,
        notice: newNotice,
        watermark: imageUrl ? imageUrl : "N/A",
        link: link ? link : "N/A",
        link2: link2 ? link2 : "N/A",
        link3: link3 ? link3 : "N/A",
      };
      try {
        schools.forEach((element) => {
          const messageRef = doc(db, "Schools", element.email);
          setDoc(messageRef, data, { merge: true });
        });
        toast.success(
          "Welcome Message has been updated for all school successfully !"
        );
        getMessage();
        getSchools();
        setNewMes("");
        setImageUrl("");
        setLink("");
        setLink2("");
        setLink3("");
        setNewNotice("");
      } catch (error) {
        console.log(error);
      }
    } else {
      if (newMes == "" || newNotice == "") {
        toast.error("Please enter a message !");
        return;
      }
      let data = {
        message: newMes,
        notice: newNotice,
        watermark: imageUrl ? imageUrl : "N/A",
        link: link ? link : "N/A",
        link2: link2 ? link2 : "N/A",
        link3: link3 ? link3 : "N/A",
      };
      console.log(schoolEmail);
      try {
        const messageRef = doc(db, "Schools", schoolEmail);
        await setDoc(messageRef, data, { merge: true });
        toast.success("Welcome Message/Notice has been updated successfully !");
        setNewMes("");
        setNewNotice("");
        setImageUrl("");
        setLink("");
        setLink2("");
        setLink3("");
        getMessage();
        getSchools();
      } catch (error) {
        console.log(error);
      }
    }
    setTimeout(() => {
      getSchools();
    }, 700);
  };
  console.log(message);
  const getMessage = async () => {
    try {
      const messageRef = doc(db, "message", "mohdh7408@gmail.com");
      const querySnapshot = await getDoc(messageRef);

      // Extract the data from the single document
      if (querySnapshot.exists()) {
        const messageData = querySnapshot.data();
        console.log(messageData);
        setMessage(messageData);
      } else {
        console.log("Document not found.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMessage();
  }, []);
  const handleEdit = (res) => {
    console.log(res);
    setNewMes(res.message);
    setNewNotice(res.notice);
    setSchoolEmail(res.email);
    setImageUrl(res.watermark);
    setLink(res.link);
    setLink2(res.link2);
    setLink3(res.link3);
  };

  const handleCheckboxChange = (event) => {
    setVisibleCheck(event.target.checked);
  };

  // PAGINATION

  schools?.sort(
    (a, b) => new Date(b.orderTimeStamp) - new Date(a.orderTimeStamp)
  );
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the array to display only the items for the current page
  const currentItems = schools?.slice(indexOfFirstItem, indexOfLastItem);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(schools?.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
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
      <div className="py-6 px-4">
        {userData?.isAdmin ? (
          <>
            <h3 className="text-5xl font-semibold">
              Hello, Welcome to Inventory Management!
            </h3>

            <div className="mt-4">
              <h4 className="text-3xl font-semibold flex items-center gap-1">
                School Dashboard Manager
              </h4>
            </div>

            <div className="mt-4 flex items-center gap-5">
              <select
                disabled={visibleCheck}
                onChange={handleSchoolSelectChange}
                value={schoolEmail}
                className="select select-bordered w-full max-w-xs"
                name="schools"
                id="schools"
              >
                <option selected value="" disabled>
                  Select a school
                </option>
                {schools?.map((res) => (
                  <>
                    <option value={res.email} key={res?.email}>
                      {res?.name} ({res?.email})
                    </option>
                  </>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <label htmlFor="check">For All Schools - </label>
                <input
                  type="checkbox"
                  id="check"
                  checked={visibleCheck} // Bind the checkbox to the state
                  onChange={handleCheckboxChange}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter Message here...."
                  id="message"
                  value={newMes}
                  onChange={(e) => setNewMes(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter Notice/Announcement here...."
                  id="notice"
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Food Production Records Link"
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="School Menu Link"
                  id="link2"
                  value={link2}
                  onChange={(e) => setLink2(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="School Order Form"
                  id="link3"
                  value={link3}
                  onChange={(e) => setLink3(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                />
              </div>
            </div>
            <div className="w-full flex gap-2 items-center">
              <div
                onClick={handleImageClick}
                className=" cursor-pointer mt-4 btn-ghost shadow-lg w-1/3 p-6 rounded flex justify-center items-center text-xs gap-1"
              >
                <BiSolidFileImage size={30} /> Please upload a watermark
              </div>

              <figure>
                <input className="w-1/2 " type="image" src={imageUrl} alt="" />
              </figure>
            </div>

            <div className="mt-4 flex items-center justify-between w-full mx-auto">
              <button
                onClick={handleUpdate}
                className="btn btn-info text-white"
              >
                Update Message
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-full">
              <div>
                <h3 className="md:text-5xl text-3xl font-semibold">
                  {userData?.message}
                </h3>
                <h5 className="md:text-3xl text-xl font-semibold mt-4">
                  {userData?.notice}
                </h5>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={userData?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="btn mt-3 btn-info text-white">
                      Food Production Records
                    </button>
                  </a>
                  <a
                    href={userData?.link2}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="btn mt-3 btn-info text-white">
                      School Menu
                    </button>
                  </a>
                  <a
                    href={userData?.link3}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="btn mt-3 btn-info text-white">
                      School Order Form
                    </button>
                  </a>
                </div>
              </div>
              <div className="mt-4">
                <img
                  style={{ width: "100vw", height: "50vh" }}
                  src={userData?.watermark}
                  alt="watermark"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
