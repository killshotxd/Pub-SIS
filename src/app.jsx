import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { UserAuth } from "./components/context/AuthContext";

import Login from "./components/pages/Login";
import { PrivateRoute } from "./components/routes/PrivateRoute";
import svg from "./assets/cart.svg";
import Dashboard from "./components/pages/Dashboard";
import Inventory from "./components/pages/Inventory";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "../Firebase";
import AddSchools from "./components/pages/Schools/AddSchools";
import ListSchools from "./components/pages/Schools/ListSchools";
import AddProduct from "./components/pages/Products/AddProduct";
import ListProducts from "./components/pages/Products/ListProducts";
import EditProduct from "./components/pages/Products/EditProduct";
import UpdateSchool from "./components/pages/Schools/UpdateSchool";
import SchoolProducts from "./components/pages/School-Products/SchoolProducts";
import ProductInfo from "./components/pages/School-Products/ProductInfo";
import Cart from "./components/pages/Cart/Cart";
import ListOrders from "./components/pages/Orders/ListOrders";
import OrderInfo from "./components/pages/Orders/OrderInfo";
import ConfirmedOrders from "./components/pages/Orders/ConfirmedOrders";
import BuyerOrderList from "./components/pages/Orders/BuyerOrderList";
import OrderStatus from "./components/pages/Orders/OrderStatus";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";
import Invoice from "./components/pages/Invoice/Invoice";
import { BiHeart } from "react-icons/bi";
import Favorites from "./components/pages/Favorites/Favorites";
import BuyerOrderStatus from "./components/pages/Orders/BuyerOrderStatus";
import BuyerInvoice from "./components/pages/Invoice/BuyerInvoice";
import BatchInvoice from "./components/pages/Invoice/BatchInvoice";
import OrderPending from "./components/pages/Orders/OrderPending";
import logo from "./assets/7.jpg";
import RejectedOrder from "./components/pages/Schools/RejectedOrder";
const App = () => {
  const { currentUser, logout } = UserAuth();
  const [userData, setUserData] = useState(null);
  const [routeState, setRouteState] = useState("");
  const location = useLocation();
  const [cartLength, setCartLength] = useState(0);
  const navigate = useNavigate();
  const [ml, setML] = useState(false);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
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
        if (schoolData?.deactivated) {
          navigate("/");
        }
        setUserData(schoolData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const uid = localStorage.getItem("email");
    const cartRef = collection(db, `cart/${uid}/items`);
    const q = query(cartRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cartList = querySnapshot.docs.map((doc) => ({
        did: doc.id,
        ...doc.data(),
      }));
      setCartLength(cartList.length);
    });

    return () => {
      unsubscribe(); // Unsubscribe when the component unmounts
    };
  }, []);
  useEffect(() => {
    getUser();
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, routeState]);
  useEffect(() => {
    setRouteState(location.pathname);
  }, [routeState, location.pathname]);

  const setMl = () => {
    if (window.innerWidth < 1023) {
      if (ml == false) {
        setML(true);
      } else {
        setML(false);
      }
    }
  };

  console.log(ml);
  return (
    <>
      {currentUser ? (
        <>
          <PrivateRoute>
            {userData?.deactivated ? (
              <>
                <div className="flex m-auto justify-center items-center min-h-screen">
                  <p className="text-center font-semibold text-2xl">
                    School has been deactivated contact admin !
                  </p>
                </div>
              </>
            ) : (
              <>
                {" "}
                <div className="bg-gray-100 dark:bg-gray-900">
                  <aside
                    className={
                      ml
                        ? "fixed top-0 z-10 ml-[0] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%] dark:bg-gray-800 dark:border-gray-700 overflow-y-auto no-scrollbar "
                        : "fixed top-0 z-10 ml-[-100%] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[17%] dark:bg-gray-800 dark:border-gray-700 overflow-y-auto no-scrollbar "
                    }
                  >
                    {/* <aside className="fixed top-0 z-10 ml-[-100%] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%] dark:bg-gray-800 dark:border-gray-700"> */}
                    <div>
                      <div className="-mx-6 px-6 py-4">
                        {window.innerWidth < 1023 && (
                          <h5
                            onClick={() => setMl()}
                            className=" text-2xl font-medium text-gray-600 lg:block dark:text-white"
                          >
                            <AiFillCloseCircle />
                          </h5>
                        )}
                      </div>
                      {/* LOGO */}
                      {/* <div className="-mx-6 px-6 py-4">
                    <a href="#" title="home">
                      <img
                        src="images/logo.svg"
                        className="w-32"
                        alt="tailus logo"
                      />
                    </a>
                  </div> */}

                      <div className="mt-8 text-center">
                        <img
                          className="flex justify-center m-auto"
                          src={logo}
                          alt=""
                          width={180}
                        />
                        {/* <h5 className="mt-4 hidden text-4xl font-bold text-red-600 lg:block dark:text-gray-300">
                          Done Right Food
                        </h5>
                        <span className="hidden text-black-600 font-bold lg:block text-2xl">
                          School Ordering Portal
                        </span> */}
                      </div>

                      <ul className="mt-8 space-y-2 tracking-wide">
                        <li>
                          <a
                            onClick={() => {
                              navigate("/dashboard");
                              setMl();
                            }}
                            aria-label="message"
                            className={
                              routeState === "/dashboard"
                                ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                            }
                          >
                            <svg
                              className="-ml-1 h-6 w-6"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                                className="dark:fill-slate-600 fill-current text-cyan-400"
                              ></path>
                              <path
                                d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                                className="fill-current text-cyan-200 group-hover:text-cyan-300"
                              ></path>
                              <path
                                d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                                className="fill-current group-hover:text-sky-300"
                              ></path>
                            </svg>
                            <span className="-mr-1 font-medium">Dashboard</span>
                          </a>
                        </li>
                        {userData && userData?.isAdmin ? (
                          <>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/list-schools");
                                  setMl();
                                }}
                                className={
                                  routeState == "/list-schools" ||
                                  routeState == "/add-schools"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    fillRule="evenodd"
                                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Schools
                                </span>
                              </a>
                            </li>

                            <li>
                              <a
                                onClick={() => {
                                  navigate("/list-product");
                                  setMl();
                                }}
                                className={
                                  routeState == "/list-product" ||
                                  routeState == "/add-product"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Products
                                </span>
                              </a>
                            </li>

                            <li>
                              <a
                                onClick={() => {
                                  navigate("/list-orders");
                                  setMl();
                                }}
                                className={
                                  routeState == "/list-orders"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Approvals
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/confirmed-orders");
                                  setMl();
                                }}
                                className={
                                  routeState == "/confirmed-orders"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Orders
                                </span>
                              </a>
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/products");
                                  setMl();
                                }}
                                className={
                                  routeState == "/products"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Products
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/fav");
                                  setMl();
                                }}
                                className={
                                  routeState == "/fav"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Favorites
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/cart");
                                  setMl();
                                }}
                                className={
                                  routeState == "/cart"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Cart
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/pending-orders");
                                  setMl();
                                }}
                                className={
                                  routeState == "/pending-orders"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Pending Items
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/buyer-orders");
                                  setMl();
                                }}
                                className={
                                  routeState == "/buyer-orders"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Orders
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/rejected-orders");
                                  setMl();
                                }}
                                className={
                                  routeState == "/rejected-orders"
                                    ? "relative flex cursor-pointer items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-3 text-white"
                                    : "group flex items-center space-x-4 cursor-pointer rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                                    fillRule="evenodd"
                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                  />
                                </svg>
                                <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                                  Rejected Items
                                </span>
                              </a>
                            </li>
                          </>
                        )}

                        {/* <li>
                      <a
                        href="#"
                        className="group flex items-center space-x-4 rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
                            d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                          />
                          <path
                            className="fill-current text-gray-300 group-hover:text-cyan-300"
                            d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                          />
                        </svg>
                        <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50">
                          Other data
                        </span>
                      </a>
                    </li> */}
                        {/* <li>
                      <a
                        href="#"
                        className="group flex items-center space-x-4 rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            className="fill-current text-gray-300 group-hover:text-cyan-300"
                            d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
                          />
                          <path
                            className="fill-current text-gray-600 group-hover:text-cyan-600 dark:group-hover:text-sky-400"
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="group-hover:text-gray-700 dark:group-hover:text-white">
                          Finance
                        </span>
                      </a>
                    </li> */}
                      </ul>
                    </div>

                    <div className="-mx-6 flex items-center justify-between border-t px-6 pt-4 dark:border-gray-700">
                      <button
                        onClick={() => {
                          handleLogout();
                          setMl();
                        }}
                        className="group flex items-center space-x-4 rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="group-hover:text-gray-700 dark:group-hover:text-white">
                          Logout
                        </span>
                      </button>
                    </div>
                  </aside>

                  <div className="ml-auto mb-6 lg:w-[75%] xl:w-[80%] 2xl:w-[83%] w-[100%]">
                    <div
                      className={
                        window.innerWidth < 768
                          ? " sticky z-50 top-0 h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 lg:py-2.5"
                          : "sticky  z-50 top-0 h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 lg:py-2.5"
                      }
                    >
                      <div className="flex items-center justify-between space-x-4 px-4 2xl:container h-full">
                        <h5
                          onClick={() => setMl()}
                          className="text-2xl lg:hidden font-medium text-gray-600  dark:text-white"
                        >
                          <AiOutlineMenu />
                        </h5>

                        <h4 className="md:text-2xl flex items-center gap-2 font-semibold text-black dark:text-white">
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img src={userData?.avatar} />
                            </div>
                          </div>{" "}
                          {userData?.name}
                        </h4>
                        {userData?.isAdmin ? (
                          ""
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => navigate("/fav")}
                                aria-label="fav"
                                className="h-10 w-10  dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800 flex items-center justify-center"
                              >
                                <BiHeart size={25} />
                              </button>
                              <button
                                onClick={() => navigate("/cart")}
                                aria-label="cart"
                                className="h-10 w-10  dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800 flex items-center justify-center"
                              >
                                <img width={25} src={svg} alt="cart" />
                                <span
                                  className={
                                    cartLength !== 0 &&
                                    "badge badge-xs badge-info text-white relative top-[-10px] right-[10px]"
                                  }
                                >
                                  {cartLength == 0 ? "" : cartLength}
                                </span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      {/* <div className="flex items-center justify-between space-x-4 px-6 2xl:container">
                    <h5
                      hidden
                      className="text-2xl font-medium text-gray-600 lg:block dark:text-white"
                    >
                      Dashboard
                    </h5>
                    <button className="-mr-2 h-16 w-12 border-r lg:hidden dark:border-gray-700 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="my-auto h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                    <div className="flex space-x-4">
                      <div hidden className="md:block">
                        <div className="relative flex items-center text-gray-400 focus-within:text-cyan-400">
                          <span className="absolute left-4 flex h-6 items-center border-r border-gray-300 pr-3 dark:border-gray-700">
                            <svg
                              xmlns="http://ww50w3.org/2000/svg"
                              className="w-4 fill-current"
                              viewBox="0 0 35.997 36.004"
                            >
                              <path
                                id="Icon_awesome-search"
                                data-name="search"
                                d="M35.508,31.127l-7.01-7.01a1.686,1.686,0,0,0-1.2-.492H26.156a14.618,14.618,0,1,0-2.531,2.531V27.3a1.686,1.686,0,0,0,.492,1.2l7.01,7.01a1.681,1.681,0,0,0,2.384,0l1.99-1.99a1.7,1.7,0,0,0,.007-2.391Zm-20.883-7.5a9,9,0,1,1,9-9A8.995,8.995,0,0,1,14.625,23.625Z"
                              ></path>
                            </svg>
                          </span>
                          <input
                            type="search"
                            name="leadingIcon"
                            id="leadingIcon"
                            placeholder="Search here"
                            className="outline-none w-full rounded-xl border border-gray-300 py-2.5 pl-14 pr-4 text-sm text-gray-600 transition focus:border-cyan-300 dark:bg-gray-900 dark:border-gray-700"
                          />
                        </div>
                      </div>
                      
                      <button
                        aria-label="search"
                        className="h-10 w-10 rounded-xl border bg-gray-100 active:bg-gray-200 md:hidden dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800"
                      >
                        <svg
                          xmlns="http://ww50w3.org/2000/svg"
                          className="mx-auto w-4 fill-current text-gray-600 dark:text-gray-300"
                          viewBox="0 0 35.997 36.004"
                        >
                          <path
                            id="Icon_awesome-search"
                            data-name="search"
                            d="M35.508,31.127l-7.01-7.01a1.686,1.686,0,0,0-1.2-.492H26.156a14.618,14.618,0,1,0-2.531,2.531V27.3a1.686,1.686,0,0,0,.492,1.2l7.01,7.01a1.681,1.681,0,0,0,2.384,0l1.99-1.99a1.7,1.7,0,0,0,.007-2.391Zm-20.883-7.5a9,9,0,1,1,9-9A8.995,8.995,0,0,1,14.625,23.625Z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        aria-label="chat"
                        className="h-10 w-10 rounded-xl border bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="m-auto h-5 w-5 text-gray-600 dark:text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </button>
                      <button
                        aria-label="notification"
                        className="h-10 w-10 rounded-xl border bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="m-auto h-5 w-5 text-gray-600 dark:text-gray-300"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                  </div> */}
                    </div>
                    <div className="px-6 pt-6 5xl:container bg-white">
                      <div className="h-[85vh]  rounded-xl   ">
                        <Routes>
                          <Route
                            path="/dashboard"
                            element={
                              <PrivateRoute>
                                <Dashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/inventory"
                            element={
                              <PrivateRoute>
                                <Inventory />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/add-schools"
                            element={
                              <PrivateRoute>
                                <AddSchools />
                              </PrivateRoute>
                            }
                          />

                          <Route
                            path="/list-schools"
                            element={
                              <PrivateRoute>
                                <ListSchools />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/edit-school/:id"
                            element={
                              <PrivateRoute>
                                <UpdateSchool />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/add-product"
                            element={
                              <PrivateRoute>
                                <AddProduct />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/list-product"
                            element={
                              <PrivateRoute>
                                <ListProducts />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/edit-product/:id"
                            element={
                              <PrivateRoute>
                                <EditProduct />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/products"
                            element={
                              <PrivateRoute>
                                <SchoolProducts />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/product-info/:id"
                            element={
                              <PrivateRoute>
                                <ProductInfo />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/cart"
                            element={
                              <PrivateRoute>
                                <Cart />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/list-orders"
                            element={
                              <PrivateRoute>
                                <ListOrders />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/order-info"
                            element={
                              <PrivateRoute>
                                <OrderInfo />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/confirmed-orders"
                            element={
                              <PrivateRoute>
                                <ConfirmedOrders />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/buyer-orders"
                            element={
                              <PrivateRoute>
                                <BuyerOrderList />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/order-status"
                            element={
                              <PrivateRoute>
                                <OrderStatus />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/invoice"
                            element={
                              <PrivateRoute>
                                <Invoice />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/fav"
                            element={
                              <PrivateRoute>
                                <Favorites />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/buyer-order-status"
                            element={
                              <PrivateRoute>
                                <BuyerOrderStatus />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/buyer-invoice"
                            element={
                              <PrivateRoute>
                                <BuyerInvoice />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/batch-invoice"
                            element={
                              <PrivateRoute>
                                <BatchInvoice />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/pending-orders"
                            element={
                              <PrivateRoute>
                                <OrderPending />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/rejected-orders"
                            element={
                              <PrivateRoute>
                                <RejectedOrder />
                              </PrivateRoute>
                            }
                          />
                        </Routes>

                        {/* {userData?.watermark !== "" ? (
                          <>
                            <div className="avatar sticky bottom-2 flex justify-end ">
                              <div className="w-24 rounded-full">
                                <img src={userData?.watermark} />
                              </div>
                            </div>
                          </>
                        ) : (
                          ""
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </PrivateRoute>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      )}
    </>
  );
};

export default App;
