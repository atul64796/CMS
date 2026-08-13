import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerUser } from "../../services/api";

// React Icons
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaLock,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("fullname", data.fullname);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("rollNumber", data.rollNumber);

      const res = await registerUser(formData);

      console.log(res.data);

      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Your account has been created.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-10">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-2 text-center text-gray-900">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Class Room Management
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FaUser size={14} />
              </span>

              <input
                type="text"
                placeholder="Enter Your Name"
                {...register("fullname", {
                  required: "Full name is required",
                })}
                className={`w-full pl-10 p-2.5 border rounded-xl outline-none transition-all ${
                  errors.fullname
                    ? "border-red-500 ring-1 ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>

            {errors.fullname && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullname.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FaEnvelope size={14} />
              </span>

              <input
                type="email"
                placeholder="email@example.com"
                {...register("email", {
                  required: "Email is required",
                })}
                className={`w-full pl-10 p-2.5 border rounded-xl outline-none transition-all ${
                  errors.email
                    ? "border-red-500 ring-1 ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Roll Number
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FaIdCard size={14} />
              </span>

              <input
                type="text"
                placeholder="Enter Roll No."
                {...register("rollNumber", {
                  required: "Roll number is required",
                })}
                className={`w-full pl-10 p-2.5 border rounded-xl outline-none transition-all ${
                  errors.rollNumber
                    ? "border-red-500 ring-1 ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>

            {errors.rollNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.rollNumber.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <FaLock size={14} />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Min 6 characters",
                  },
                })}
                className={`w-full px-10 p-2.5 border rounded-xl outline-none transition-all ${
                  errors.password
                    ? "border-red-500 ring-1 ring-red-500"
                    : "focus:ring-2 focus:ring-blue-500"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {showPassword ? (
                  <FaEyeSlash size={16} />
                ) : (
                  <FaEye size={16} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            disabled={isLoading}
            className={`flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-bold cursor-pointer hover:underline"
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;