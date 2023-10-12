import { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { signInGoogle, currentUser } = UserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, []);

  const handleLogin = async () => {
    if (email && password) {
      const user = await signInGoogle(email, password);
      if (user) {
        // User login successful, you can redirect or show a success message here
        console.log("User logged in successfully!");

        navigate("/dashboard");
        toast.success("User logged in successfully!");
      } else {
        // Handle login error
        console.log("Login failed");
        toast.error("Enter correct email and password");
      }
    } else {
      toast.error("Enter email and password");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };
  return (
    <>
      <Toaster />
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(https://plus.unsplash.com/premium_photo-1679784204535-e623926075cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80)",
        }}
      >
        <div className="hero-overlay   bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className=" min-w-[20rem] max-w-lg">
            <h1 className="mb-5  text-4xl font-bold text-white">
              Login to School Inventory Management
            </h1>
            <p className="mb-5 text-white">Unlock the Doors to Success</p>
            <div className="card glass bg-transparent bg-opacity-10 justify-center m-auto flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
              <div className="card-body">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Email</span>
                  </label>
                  <input
                    type="text"
                    placeholder="email"
                    className="input input-bordered bg-transparent text-white"
                    value={email}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Password</span>
                  </label>
                  <input
                    type="text"
                    placeholder="password"
                    className="input input-bordered bg-transparent text-white"
                    value={password}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* <label className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label> */}
                </div>
                <div className="form-control mt-6">
                  <button className="btn btn-secondary" onClick={handleLogin}>
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Login now!</h1>
            <p className="py-6">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
          </div>
         
        </div>
      </div> */}
    </>
  );
};

export default Login;
