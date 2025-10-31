const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(buffer, folder,resourceType="auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}

module.exports = uploadToCloudinary;
