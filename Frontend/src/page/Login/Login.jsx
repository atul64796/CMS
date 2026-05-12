import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginUser } from '../../services/api';
import { useAuth } from "../../context/AuthContext"; // ✅ added

import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅ added
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

 const onSubmit = async (data) => {
  setIsLoading(true);

  try {
    const res = await loginUser(data);
    const user = res.data.data.user;

    // ✅ Success
    Swal.fire({
      icon: "success",
      title: "Login Successful",
      text: "Welcome back!",
      timer: 1500,
      showConfirmButton: false,
    });

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    navigate("/dashboard");

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    const message = error.response?.data?.message;

    switch (message) {

      case "MISSING_FIELDS":
        Swal.fire("Missing Fields", "Please fill all fields.", "warning");
        break;

      case "USER_NOT_FOUND":
        Swal.fire("User Not Found", "Please register first.", "error");
        break;

      case "ACCOUNT_BANNED":
        Swal.fire("Account Banned", "Contact admin.", "warning");
        break;

      case "ACCOUNT_DEACTIVATED":
        Swal.fire("Account Deactivated", "Your account is disabled.", "warning");
        break;

      case "ACCOUNT_NOT_VERIFIED":
        Swal.fire("Not Verified", "Wait for admin approval.", "info");
        break;

      case "INVALID_PASSWORD":
        Swal.fire("Wrong Password", "Please check your password.", "error");
        break;

      default:
        Swal.fire("Error", "Something went wrong!", "error");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className='flex justify-center items-center h-screen bg-gray-50'>
      <div className='p-8 bg-white shadow-xl w-full max-w-md rounded-2xl border border-gray-100'>
        <h2 className='text-3xl font-extrabold mb-2 text-center text-gray-900'>Welcome Back</h2>
        <p className='text-center text-gray-500 mb-8'>Please enter your details to sign in</p>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder='example@mail.com' 
              {...register("email", { 
                required: "Email is required",
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                  message: "Invalid email address" 
                }
              })}
              className={`w-full p-3 border rounded-xl ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
            />
            {errors.email && <p className='text-red-500 text-xs mt-1 ml-1'>{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder='••••••••' 
                {...register("password", { required: "Password is required" })} 
                className={`w-full p-3 border rounded-xl ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && <p className='text-red-500 text-xs mt-1 ml-1'>{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded-xl ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          New here? <a href="/register" className="text-blue-600 font-bold hover:underline">Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;