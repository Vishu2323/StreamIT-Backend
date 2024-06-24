import mongoose ,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema =new Schema(
{
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        index: true,
        trim:true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverimg:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type:String
    }
},{
    timestamps:true
}
)

userSchema.pre("save", async function(next){
    if(!this.isModified(password)) return next();
    this.password=bcrypt.hash(this.password,8)
    next()
})

userSchema.methods.isPasswordCorrect= async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function(){
  return  jwt.sign({
        _id:this.id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName
},
    process.env.ACCESS_TOKEN_KEY,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id:this.id,
},  process.env.REFRESH_TOKEN_KEY,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}


export const UserSchema =mongoose.model("User",userSchema)
