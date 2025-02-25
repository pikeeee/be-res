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

  // Upload file và trả về secure_url (đã chứa version)
  // async upload(file, key) {
  //   // Upload file lên Cloudinary
  //   const response = await this.cloudinary.uploader.upload(file.path, {
  //     public_id: key,
  //     folder: this.bucket,
  //     overwrite: true,
  //   });
  
  //   fs.unlinkSync(file.path);
  
  //   console.log("✅ Cloudinary trả về:", response.secure_url);
  //   console.log("🔍 Version của file:", response.version);
  
  //   // Ghi đè key để lưu vào database
  //   return {
  //     key: response.secure_url, // Lưu full URL vào DB
  //     version: response.version // Lưu version riêng (nếu bạn muốn)
  //   };
  // }
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
      key: response.secure_url, // Lưu URL đầy đủ vào `imageUrl`
      path: response.public_id, // Lưu `publicId`
      version: response.version // Lưu `version`
    };
  
    console.log("📌 Trả về từ `upload()`:", uploadData);
    return uploadData;
  }
  
  

  // Xoá file: sử dụng regex đơn giản để tách public_id từ secure_url
  async delete(key) {
    // const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
    // const match = key.match(regex);
    // if (!match) {
    //   throw new Error("Could not parse public_id from URL");
    // }
    // const publicId = match[1];
    // await this.cloudinary.uploader.destroy(publicId);
  }

  // Trả về URL hiển thị: nếu key đã là URL thì trả về luôn key
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
