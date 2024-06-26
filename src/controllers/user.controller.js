import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import User from "../models/user.model.js"
import {upload} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"OK"
    })

    const{fullName, email, userName, password}=req.body
    console.log("email:", email);
    if([fullName, email, userName, password].some((field)=>
        field?.trim()==="") 
    ){
        throw new ApiError(400,"All field is required")
    }
   const existedUser= User.findOne({
        $or:[{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with this details already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is Required")
    }

    const avatar= await upload(avatarLocalPath)
    const coverImage= await upload(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is Required")
    }

    const user = await User.create(
        {
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            userName:userName.toLowerCase()

         })
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Error in registering the user")
   }

   return res.status((201).json(
    new ApiResponse (200,"User registered successfully")
   ))


})


export{registerUser}