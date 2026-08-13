import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import User from '../models/users.Schema.js';

import createActivityLog from '../utils/activityLog.js';

// Helper to determine cookie security settings dynamically
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction, // Requires HTTPS in production (Vercel <-> Render)
    sameSite: isProduction ? "none" : "lax", // Allows cross-site cookie transmission
  };
};

// Generate JWT tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating token');
  }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, rollNumber } = req.body;

  if ([fullname, email, password, rollNumber].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  const existedUser = await User.findOne({
    $or: [{ rollNumber }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, 'User with rollNumber or email already exists');
  }

  const user = await User.create({
    fullname,
    email,
    password,
    rollNumber,
    avatar: "",
  });

  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser) throw new ApiError(400, 'User registration failed');

  await createActivityLog(
    { user, ip: req.ip },
    'REGISTER',
    `User registered with email ${email}`
  );

  return res.status(201).json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rollNumber } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "MISSING_FIELDS");
  }

  const finduser = await User.findOne({
    $or: [{ rollNumber }, { email }],
  });

  if (!finduser) {
    throw new ApiError(401, "USER_NOT_FOUND");
  }

  if (finduser.isBanned) {
    throw new ApiError(403, "ACCOUNT_BANNED");
  }

  if (finduser.accountStatus === "deactivated") {
    throw new ApiError(403, "ACCOUNT_DEACTIVATED");
  }

  if (!finduser.isVerified) {
    throw new ApiError(403, "ACCOUNT_NOT_VERIFIED");
  }

  const isPasswordValid = await finduser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "INVALID_PASSWORD");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(finduser._id);

  const loggedinUser = await User.findById(finduser._id).select("-password -refreshToken");

  await createActivityLog(
    { user: finduser, ip: req.ip },
    "LOGIN",
    `User logged in: ${finduser.email}`
  );

  const options = getCookieOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedinUser },
        "LOGIN_SUCCESS"
      )
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  await createActivityLog(
    req,
    "LOGOUT",
    `User logged out: ${req.user.email}`
  );

  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = getCookieOptions();

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

// Update User Password
const updatePassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, 'User not found');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Invalid old password');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, 'Your password was updated successfully'));
});

// Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, 'Fullname and email are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullname, email },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(new ApiResponse(200, user, 'Updated account details successfully'));
});

// Update Avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file not found');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Error uploading avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.secure_url },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(new ApiResponse(200, user, 'Avatar updated successfully'));
});

const getStudents = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "student" }).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, users, "Students fetched successfully")
  );
});

const getTeachers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "teacher" }).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, users, "Teachers fetched successfully")
  );
});

const toggleUserBan = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isBanned = !user.isBanned;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      `User ${user.isBanned ? "banned" : "unbanned"} successfully`
    )
  );
});

const toggleAccountStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.accountStatus = user.accountStatus === "active" ? "deactivated" : "active";
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      `Account ${user.accountStatus} successfully`
    )
  );
});

const verifyUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isVerified = true;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user, "User verified successfully")
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updatePassword,
  updateAccountDetails,
  updateAvatar,
  getStudents,
  getTeachers,
  toggleUserBan,
  toggleAccountStatus,
  verifyUserByAdmin,
};