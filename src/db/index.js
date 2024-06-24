import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB= async()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.DB_URL}/${process.env.PORT}`)
        console.log(`Database connected || DB_HOST: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log(`MongoDB connection failed ${error}`);
        process.exit(1);
    }
}
export default connectDB; 