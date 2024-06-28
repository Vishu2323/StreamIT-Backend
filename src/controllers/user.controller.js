import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {upload} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken=async(userid)=>{
    try {
       const user= await User.findById(userid)
        const RefreshToken= user.generateRefreshToken()
        const AccessToken =user.generateAccessToken()

        user.refreshToken=RefreshToken;
       await user.save({validateBeforeSave : false})

       return{AccessToken,RefreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Error in generating Acc. and Ref. Token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"OK"
    // })

    const{fullName, email, userName, password}=req.body
    // console.log("email:", email);
    if([fullName, email, userName, password].some((field)=>
        field?.trim()==="") 
    ){
        throw new ApiError(400,"All field is required")
    }
   const existedUser= await User.findOne({
        $or:[{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with this details already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
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

   return res.status(201).json(
    new ApiResponse (200,createdUser,"User registered successfully")
   )


})

const loginUser = asyncHandler(async (req, res)=>{
    const{userName, email, password}= req.body;

    if(!userName && !email){
        throw new ApiError(400,"Username or Email is required")
    }

    const user = await User.findOne({
        $or:[{userName}, {email}]
    })
    if(!user){
        throw new ApiError(404,"User not Found !!")
    }

   const isPassValid= await user.isPasswordCorrect(password)
    if(!isPassValid){
    throw new ApiError(404,"Password is Invalid  !!")
    }

   const {AccessToken,RefreshToken}= await generateAccessAndRefreshToken(user._id)
         
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("AccessToken",AccessToken,options)
        .cookie("RefreshToken",RefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser , AccessToken , RefreshToken
                },"User LoggedIn Successfully"

        )
        )
    
})

const logoutUser = asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
        
    )
    const options={
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("AccessToken",options)
    .cookie("RefreshToken",options)
    .json(new ApiResponse(200,{},"User Logout Successfully"))
})


  


export{registerUser, loginUser, logoutUser}