const cloudinary = require("cloudinary").v2;

const deleteFromCloudinary = async (publicId, resourceType) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(` Deleted from Cloudinary: ${publicId}`);
  } catch (err) {
    console.error(`Error deleting ${publicId}:`, err.message);
  }
};

module.exports = deleteFromCloudinary;
