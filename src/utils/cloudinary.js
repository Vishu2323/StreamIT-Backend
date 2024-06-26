import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
});

const  upload =async (localFilepath)=>{
    try {
        if(!localFilepath) return null;
       const response = await cloudinary.uploader.upload(localFilepath,{
            resource_type:"auto"
        })
        // console.log("file uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilepath)
        return response;

    } catch (error) {
        console.log("something wrong ",error)
        fs.unlinkSync(localFilepath)
        return null;
    }
}

export {upload}