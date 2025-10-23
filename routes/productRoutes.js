

const express = require("express");
const router = express.Router();
const { addProduct,getAllProducts,getProductDetails,updateProduct } = require("../controllers/productController");

router.post("/products", addProduct);
// Get all products of a store
router.get("/products/:storeId", getAllProducts);

// Get product details by productId
router.get("/products/item/:productId", getProductDetails);

// Update product details by productId
router.put("/products/:productId", updateProduct);



module.exports = router;
