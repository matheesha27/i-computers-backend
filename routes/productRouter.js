import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router()

productRouter.get("/", getAllProducts)

productRouter.get("/:productId", getProductById)

productRouter.post("/", createProduct)

productRouter.put("/:productId", updateProduct)

productRouter.delete("/:productId", deleteProduct)

export default productRouter;