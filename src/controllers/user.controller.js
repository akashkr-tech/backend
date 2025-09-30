// import { asyncHandler } from "../utils/asyncHandler.js";
// import{ApiError} from "../utils/ApiError.js"
// import{User} from "../models/user.model.js"
// import{uploadOnCloudinary} from "../utils/cloudinary.js"
// import { ApiResponse } from "../utils/ApiResponse.js";


// const registerUser = asyncHandler(async (req, res) => {
//     // res.status(200).json({
//     //     message: "ok"
//     // })

//     const{fullName, email, password,username} = req.body
//     console.log("email:", email);
//     if(
//         [fullName, email, password].some((field)=> field?.trim() ==="")
//     ){
//       throw new ApiError(400,"All fields are required")
//     }

//     const existedUser = await User.findOne({
//         $or:[{username},{email}]
//     })

//     if(existedUser){
//         throw new ApiError(409,"User with email or username is already existed")
//     }

//     const avatarLocalPath = req.files?.avatar[0]?.path;
//     const CoverImageLocalPath = req.files?.coverImage[0]?.path;

//     if(!avatarLocalPath){
//         throw new ApiError(400,"Avatar file is required") 
//     }
//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     const coverImage = await uploadOnCloudinary(CoverImageLocalPath)
    
//     if(!avatar){
//         throw new ApiError(409,"User with email or username is already existed")
//     }
//     const user = await User.create({
//         fullName,
//         avatar:avatar.url,
//         coverImage:coverImage?.url || "",
//         email,
//         password,
//         username:username.toLowerCase()

//     })

//     const createdUser = await User.findById(user._id).select("-password -refreshToken ")
//   if(!createdUser){
//     throw new ApiError(500,"Something went wrong while registering the user")

//   }

//   return res.status(201).json(
//     new ApiResponse(201,createdUser,"User has been registered successfully")
//   )
// })


// export { registerUser }


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // Extract data from request body
    const { fullname, email, username, password } = req.body
    // console.log("Received data:", { fullname, email, username, password });
    
    // Validate required fields
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if user already exists
    console.log("Checking for existing user with:", { username, email });
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    
    console.log("Existing user found:", existedUser);

    if (existedUser) {
        console.log("User already exists - throwing error");
        throw new ApiError(409, "User with email or username already exists")
    }

    console.log("No existing user found - proceeding with registration");

    // Handle file uploads
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath ;
    if(req.files &&  Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Upload files to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }

    // Create user in database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // Get created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User has been registered successfully")
    )
})

export { registerUser }