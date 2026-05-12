import React from "react";

const FaceLogin = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Face Login</h2>

      <video
        id="video"
        autoPlay
        className="w-[300px] h-[250px] border rounded-md"
      />

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Scan Face
      </button>
    </div>
  );
};

export default FaceLogin;