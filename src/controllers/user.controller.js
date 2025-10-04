import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Extract data from request body
  const { fullname, email, username, password } = req.body;
  // console.log("Received data:", { fullname, email, username, password });

  // Validate required fields
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  console.log("Checking for existing user with:", { username, email });
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("Existing user found:", existedUser);

  if (existedUser) {
    console.log("User already exists - throwing error");
    throw new ApiError(409, "User with email or username already exists");
  }

  console.log("No existing user found - proceeding with registration");

  // Handle file uploads
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload files to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create user in database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Get created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return success response
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "User has been registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find the user
  //password check
  //acess and refresh token
  //send cookie
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User has been logged in successfully"
      )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }
 try {
   const decodedToken = JsonWebTokenError.verify(incomingRefreshToken,
   process.env.REFRESH_TOKEN_SECRET
 
   )
 
   const user = await User.findById(decodedToken?._id)
 
   if(!user){
     throw new ApiError(404,"invalid refresh token")
   }
   if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"refresh token is exired or used")
   }
    
   const options = {
     httpOnly:true,
     secure:true
   }
 
   const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
   return res
   .ststus(200)
   .cookie("accessToken,newRefreshToken",options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
       200,
       {accessToken, refreshToken:newRefreshToken},
       "Access token refreshsed"
     )
   )
 } catch (error) {
   throw new ApiError(401,error.message || "invalid refresh token")
 }

}) 



export { 
  registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken };
