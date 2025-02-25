import { BaseProvider } from "@adminjs/upload"
import { v2 as cloudinary } from "cloudinary"

export class CloudinaryProvider extends BaseProvider {
  constructor(options) {
    super(options)
    this.cloudName = options.cloudName
    this.apiKey = options.apiKey
    this.apiSecret = options.apiSecret

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    })
  }

  async upload(file, key) {
    console.log(999988889998889999);
    
    // `file.path` là đường dẫn tạm
    const result = await cloudinary.uploader.upload(file.path)
    return result.secure_url // Trả về public_id để lưu DB
  }

  async delete(key, bucket) {
    console.log(999988889998889999);
    await cloudinary.uploader.destroy(key) // key là public_id
  }

  async path(key, bucket) {
    console.log(999988889998889999);
    // Trả về link hoàn chỉnh
    return cloudinary.url(key)
  }
}