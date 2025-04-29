import cloudinary from "../config/cloudinary.config.js";
import fs from "fs";


export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}

export const deleteFromCloudinary = async (imageUrl) => {
    try {
        // Extract public ID from URL
        const urlParts = imageUrl.split('/');
        const fileNameWithExt = urlParts[urlParts.length - 1];
        const publicId = fileNameWithExt.split('.')[0]; // Remove extension

        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok'; 
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

