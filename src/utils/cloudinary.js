import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_SECRET_KEY
});

const  upload =async (localFilepath)=>{
    try {
        if(!localFilepath) return null;
       const response = await cloudinary.uploader.upload(localFilepath,{
            resource_type:"auto"
        })
        console.log("file uploaded on cloudinary", response.url)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilepath)
        return null;
    }
}

export {upload}