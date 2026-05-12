import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import User from '../models/users.Schema.js';
import jwt from 'jsonwebtoken';

import createActivityLog from '../utils/activityLog.js';

//Generate jwt tokens

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

// register user

const registerUser = asyncHandler(async (req, res) => {
  //get user data from req.body
  const { fullname, email, password, rollNumber } = req.body;

  console.log('Request body:', req.body);
  console.log('Files:', req.file);

  //check it empty or not
  if ([fullname, email, password, rollNumber].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  //check if user already exist or not
  const existedUser = await User.findOne({
    $or: [{ rollNumber }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, 'User with rollNumber and email Already existed');
  }

  console.log(req.file);

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'avatar file is required');
  }

  //upload them to cloudinary,avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar upload failed');
  }

  const user = await User.create({
    fullname,
    email,
    password,
    rollNumber,
    avatar: avatar.url,
  });

  //generate refresh token and
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser) throw new ApiError(400, 'User registration failed!..');

 await createActivityLog(req, 'REGISTER', `User registered with email ${email}`);

  //return  final response user created sucessfully in json format
  return res.status(201).json(new ApiResponse(200, createdUser, 'User registered successfully'));

   
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rollNumber } = req.body;

  console.log(req.body);

  // ✅ check required fields
  if (!email || !password) {
    throw new ApiError(400, "MISSING_FIELDS");
  }

  // ✅ find user (WITH password)
  const finduser = await User.findOne({
    $or: [{ rollNumber }, { email }],
  });

  // ❌ user not found
  if (!finduser) {
    throw new ApiError(401, "USER_NOT_FOUND");
  }

  // ❌ banned
  if (finduser.isBanned) {
    throw new ApiError(403, "ACCOUNT_BANNED");
  }

  // ❌ deactivated
  if (finduser.accountStatus === "deactivated") {
    throw new ApiError(403, "ACCOUNT_DEACTIVATED");
  }

  // ❌ not verified
  if (!finduser.isVerified) {
    throw new ApiError(403, "ACCOUNT_NOT_VERIFIED");
  }

  // ✅ check password (NOW WORKS)
  const isPasswordValid = await finduser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "INVALID_PASSWORD");
  }

  // ✅ generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(finduser._id);

  // ✅ remove sensitive data AFTER check
  const loggedinUser = await User.findById(finduser._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  // ✅ response
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
        },
        "LOGIN_SUCCESS"
      )
    );

  // ✅ activity log
  await createActivityLog(
    { user: finduser, ip: req.ip },
    "LOGIN",
    `User logged in: ${finduser.email}`
  );
});

//logout User
const logoutUser = asyncHandler(async (req, res) => {

  // ✅ log first
  await createActivityLog(
    req,
    "LOGOUT",
    `User logged out: ${req.user.email}`
  );


  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  };
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'user logged out sucessfully'));

 
});

//get users
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'User fetched Sucessfully'));
});

//update user Password

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

  res.status(200).json(new ApiResponse(200, {}, 'Your Password is Updated Sucessfully'));
});

// update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, 'fullname and email');
  }

  const user = await User.findOneAndUpdate(
    req.user,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, user, 'Update Account Deatils Sucessfully'));
});

//update avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  console.log(req.file);

  if (!avatarLocalPath) {
    throw new ApiError(400, 'avatar not find');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'There was an Error while uploading avatar ');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.secure_url,
      },
    },
    { new: true }
  ).select('-password');

  res.status(200).json(new ApiResponse(200, user, 'Your avatar is updated successfully'));
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

  user.isBanned = !user.isBanned; //toggle
  await user.save();
  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      `User ${user.isBanned? "banned" : "unbanned"} successfully`
      )
  );
});


const toggleAccountStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.accountStatus = user.accountStatus === "active" ? "deactivated" : "active" //toggle
  
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
 verifyUserByAdmin
};
