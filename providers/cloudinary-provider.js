import { BaseProvider } from '@adminjs/upload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

class CloudinaryProvider extends BaseProvider {
  constructor(options) {
    super(options.bucket)
    cloudinary.config({
      cloud_name: options.cloudName,
      api_key: options.apiKey,
      api_secret: options.apiSecret,
    })
    this.cloudinary = cloudinary
  }
  async upload(file, key) {
    const response = await this.cloudinary.uploader.upload(file.path, {
      public_id: key,
      folder: this.bucket,
      overwrite: true,
    });
  
    fs.unlinkSync(file.path);
  
    console.log("✅ Cloudinary trả về:", response.secure_url);
    console.log("🔍 Public ID (key):", response.public_id);
    console.log("🔍 Version:", response.version);
  
    const uploadData = {
      key: response.secure_url, 
      path: response.public_id,
      version: response.version 
    };
  
    console.log("📌 Trả về từ `upload()`:", uploadData);
    return uploadData;
  }
  
  

  async delete(key) {
    // const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
    // const match = key.match(regex);
    // if (!match) {
    //   throw new Error("Could not parse public_id from URL");
    // }
    // const publicId = match[1];
    // await this.cloudinary.uploader.destroy(publicId);
  }

  path(key) {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    const imageUrl = cloudinary.url(key);
    console.log(939393, imageUrl);
    
    return `https://res.cloudinary.com/${this.cloudinary.config().cloud_name}/image/upload/v1740414291/${this.bucket}/${key}.jpg`;
  }
}

export default CloudinaryProvider
