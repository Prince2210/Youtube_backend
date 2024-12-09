import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  if (!req.files?.avatar) {
    throw new ApiError(400, "Please upload User Avatar");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadFileToCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Unable to upload Avatar");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -resfreshToken"
  );
  if (!createdUser) {
    await deleteFileFromCloudinary(avatar.public_id);
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    throw new ApiError(400, "Please Enter username or password!");
  }
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new ApiError(
      404,
      `User doesnot exists with this username!: ${username}`
    );
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, `Password is incorrect`);
  }
  const generateAccessToken = await user.generateAccessToken();
  const generateRefreshToken = await user.generateRefreshToken();
  user.refreshToken = generateRefreshToken;
  await user.save({ validateBeforeSave: false });
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", generateAccessToken, options)
    .cookie("refreshToken", generateRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: generateAccessToken,
          refreshToken: generateRefreshToken,
        },
        `${loggedInUser.username} retrive sucessfully!`
      )
    );
});
const getAllUser = asyncHandler(async (_, res) => {
  const users = await User.find().select("-password -refreshToken -__v");
  return res
    .status(200)
    .json(new ApiResponse(200, { count: users.length, user: users }));
});
const upadateProfile = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;
  if (!(email || fullName)) {
    throw new ApiError(400, "Please Provide Email or Full Name");
  }
  let save;
  if (email && fullName) {
    save = { email: email, fullName: fullName };
  } else if (email) {
    save = { email: email };
  } else if (fullName) {
    save = { fullName: fullName };
  }
  const user = await User.findByIdAndUpdate(req.user._id, save, {
    new: true,
  }).select("-password -refreshToken -__v");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const upadateCover = asyncHandler(async (req, res) => {
  if (!req.files?.coverImage) {
    throw new ApiError(400, "Please upload User coverImage");
  }
  const coverImagePath = req.files?.coverImage[0]?.path;

  if (!coverImagePath) {
    throw new ApiError(400, "coverImage file is required");
  }
  const coverImage = await uploadFileToCloudinary(coverImagePath);
  if (!coverImage) {
    throw new ApiError(400, "Unable to upload coverImage");
  }
  const createdUser = await User.findByIdAndUpdate(
    req.user._id,
    { coverImage: coverImage.url },
    {
      new: true,
    }
  ).select("-password -resfreshToken  -__v");
  if (!createdUser) {
    await deleteFileFromCloudinary(coverImage.public_id);
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "coverImage upadted successfully"));
});
const upadateAvatar = asyncHandler(async (req, res) => {
  if (!req.files?.avatar) {
    throw new ApiError(400, "Please upload User avatarImage");
  }
  const avatarImagePath = req.files?.avatar[0]?.path;

  if (!avatarImagePath) {
    throw new ApiError(400, "avatarImage file is required");
  }
  const avatarImage = await uploadFileToCloudinary(avatarImagePath);
  if (!avatarImage) {
    throw new ApiError(400, "Unable to upload avatarImage");
  }
  const createdUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarImage.url },
    {
      new: true,
    }
  ).select("-password -resfreshToken  -__v");
  if (!createdUser) {
    await deleteFileFromCloudinary(avatarImage.public_id);
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "avatarImage upadted successfully")
    );
});
const updatePasswordWord = asyncHandler(async (req, res) => {
  const { password, newPassWord } = req.body;
  if (!password) throw new ApiError(400, "Please Provide Old Password!");
  if (!newPassWord) throw new ApiError(400, "Please Provide New Password!");
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Input Password is correct!");
  user.password = newPassWord;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const getSingleUser = asyncHandler(async (req, res) => {
  console.log(req.params);
});
const getUserChannelProfile = asyncHandler(async (req, res) => {});

export {
  registerUser,
  loginUser,
  getAllUser,
  upadateProfile,
  upadateCover,
  upadateAvatar,
  updatePasswordWord,
  getSingleUser,
  getUserChannelProfile,
};
