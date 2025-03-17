import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { AdminJS, ComponentLoader } from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import bcrypt from "bcryptjs";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from './routes/productRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"
import checkoutController from "./controllers/checkoutController.js";
import stripeWebhook from "./controllers/stripeWebhook.js";
import Admin from "./models/Admin.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Table from "./models/Table.js";
import Category from "./models/Category.js";
import Chat from "./models/Chat.js";
import Order from "./models/Order.js";
import Menu from "./models/Menu.js";
import uploadFeature from "@adminjs/upload";
import { fileURLToPath } from "url";
import path from "path";
import CloudinaryProvider from "./providers/cloudinary-provider.js";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

AdminJS.registerAdapter(AdminJSMongoose);

const componentLoader = new ComponentLoader();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const uploadEditPath = path.join(
  __dirname,
  "node_modules",
  "@adminjs",
  "upload",
  "build",
  "features",
  "upload-file",
  "components",
  "UploadEditComponent.js"
);

const uploadListPath = path.join(
  __dirname,
  "node_modules",
  "@adminjs",
  "upload",
  "build",
  "features",
  "upload-file",
  "components",
  "UploadListComponent.js"
);

const uploadShowPath = path.join(
  __dirname,
  "node_modules",
  "@adminjs",
  "upload",
  "build",
  "features",
  "upload-file",
  "components",
  "UploadShowComponent.js"
);

const normalizePath = (filePath) => {
  return process.platform === "win32" ? filePath.replace(/^\/+/, "") : filePath;
};

const imageListComponent = componentLoader.add(
  "ImageList", 
  path.join(__dirname, "adminjs-components", "ImageList.jsx")
);

const Components = {
  UploadEdit: componentLoader.add(
    "UploadEdit",
    normalizePath(uploadEditPath)
  ),
  UploadList: componentLoader.add(
    "UploadList",
    normalizePath(uploadListPath)
  ),
  UploadShow: componentLoader.add(
    "UploadShow",
    normalizePath(uploadShowPath)
  ),
};

const dashboardComponent = componentLoader.add(
  "DashboardComponent",
  path.join(__dirname, "adminjs-components", "DashboardComponent.jsx")
);

const adminJsInstance = new AdminJS({
  componentLoader,
  rootPath: "/admin",
  resources: [
    { resource: Admin, options: { navigation: "Admins" } },
    { resource: User, options: { navigation: "Users" } },
    {
      resource: Product,
      options: {
        navigation: "Products",
      },
      features: [
        uploadFeature({
          componentLoader,
          provider: new CloudinaryProvider({
            bucket: "products",
            cloudName: process.env.CLOUD_NAME,
            apiKey: process.env.CLOUD_API_KEY,
            apiSecret: process.env.CLOUD_API_SECRET,
          }),
          properties: {
            file: "uploadImage",   
            key: "imageUrl",      
            imageUrl: {
              isVisible: {
                list: false, 
                show: false,
                edit: false,
                filter: false,
              },
              components: {
                list: imageListComponent,
              },
            },
          },
        }),
      ],
    },
    { resource: Menu, options: { navigation: "Menus" } },
    { resource: Category, options: { navigation: "Categories" } },
    { resource: Table, options: { navigation: "Tables" } },
    { resource: Chat, options: { navigation: "Chats" } },
    { resource: Order, options: { navigation: "Orders" } },
  ],
  branding: {
    companyName: "Restaurant Manager",
    logo: "https://cdn.xtmobile.vn/vnt_upload/news/03_2024/22/top-bo-phim-hoat-hinh-anime-hay-xtmobile.jpg",
  },

  dashboard: {
    handler: async (request, response, context) => {
      const { tab = 'users', range = 'week' } = request.query || {}
  
      let startDate = new Date()
      let groupStage = {}
  
      if (range === 'week') {
        startDate = new Date(Date.now() - 7 * 86400000)
        if (tab === 'users' || tab === 'products') {
          groupStage = {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        } else { 
          groupStage = {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
          }
        }
      } else if (range === 'month') {
        startDate.setMonth(startDate.getMonth() - 1)
        if (tab === 'users' || tab === 'products') {
          groupStage = {
            _id: {
              year: { $isoWeekYear: "$createdAt" },
              isoWeek: { $isoWeek: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        } else {
          groupStage = {
            _id: {
              year: { $isoWeekYear: "$date" },
              isoWeek: { $isoWeek: "$date" }
            },
            count: { $sum: 1 }
          }
        }
      } else if (range === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1)
        if (tab === 'users' || tab === 'products') {
          groupStage = {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        } else {
          groupStage = {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            count: { $sum: 1 }
          }
        }
      }
  
      let totalCount = 0
      let chartData = []
  
      if (tab === 'users') {
        totalCount = await User.countDocuments()
        const pipeline = [
          { $match: { createdAt: { $gte: startDate } } },
          { $group: groupStage },
          { $sort: { "_id": 1 } },
        ]
        const agg = await User.aggregate(pipeline)
        if (range === 'month') {
          chartData = agg.map((item) => ({
            date: `Year ${item._id.year}, Week ${item._id.isoWeek}`,
            count: item.count,
          }))
        } else {
          chartData = agg.map((item) => ({
            date: item._id,
            count: item.count,
          }))
        }
      } else if (tab === 'orders') {
        totalCount = await Order.countDocuments()
        const pipeline = [
          { $match: { date: { $gte: startDate } } },
          { $group: groupStage },
          { $sort: { "_id": 1 } },
        ]
        const agg = await Order.aggregate(pipeline)
        if (range === 'month') {
          chartData = agg.map((item) => ({
            date: `Year ${item._id.year}, Week ${item._id.isoWeek}`,
            count: item.count,
          }))
        } else {
          chartData = agg.map((item) => ({
            date: item._id,
            count: item.count,
          }))
        }
      } else if (tab === 'products') {
        totalCount = await Product.countDocuments()
        const pipeline = [
          { $match: { createdAt: { $gte: startDate } } },
          { $group: groupStage },
          { $sort: { "_id": 1 } },
        ]
        const agg = await Product.aggregate(pipeline)
        if (range === 'month') {
          chartData = agg.map((item) => ({
            date: `Year ${item._id.year}, Week ${item._id.isoWeek}`,
            count: item.count,
          }))
        } else {
          chartData = agg.map((item) => ({
            date: item._id,
            count: item.count,
          }))
        }
      }
  
      return {
        tab,        
        range,     
        totalCount, 
        chartData,
      }
    },
    component: dashboardComponent,
  },
  
});

adminJsInstance.watch()

if (process.env.NODE_ENV === "development") {
  adminJsInstance.watch();
}

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJsInstance,
  {
    authenticate: async (email, password) => {
      const existingAdmin = await Admin.findOne({ email });
      if (!existingAdmin) return null;
      const isMatch = await bcrypt.compare(password, existingAdmin.passwordHash);
      if (!isMatch) return null;
      return { email: existingAdmin.email };
    },
    cookiePassword: "super-secret-cookie",
  },
  null,
  {
    resave: false,
    saveUninitialized: false,
  }
);

app.use("/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);
app.use(adminJsInstance.options.rootPath, adminRouter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/admin/display-image", async (req, res) => {
  const imageUrl = "https://res.cloudinary.com/dmaqmt8mw/image/upload/v1740428027/products/67bcd2f92c1ea73073a256f6/hinh-anime-2.jpg.jpg";
  res.render("display-image", { imageUrl });
});

app.use("/api/admin", adminRoutes);
app.use('/api/products', productRoutes);  
app.use('/api/product', productRoutes);  
app.use('/api/users', userRoutes);  
app.use('/api/user', userRoutes);  
app.use('/api/carts', cartRoutes);  
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);  
app.use('/api/order', orderRoutes);
app.post("/api/checkout", checkoutController.createCheckoutSession);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});