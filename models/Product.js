import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category" 
  },
  publicId: { type: String },
  version: { type: String },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.imageUrl) {
    const publicIdMatch = this.imageUrl.match(/upload\/v\d+\/(.+)\.[a-zA-Z]+$/);
    const versionMatch = this.imageUrl.match(/\/v(\d+)\//);

    if (publicIdMatch) {
      this.publicId = publicIdMatch[1];
    }
    if (versionMatch) {
      this.version = versionMatch[1];
    }
  }
  next();
});

export default mongoose.model('Product', productSchema);
