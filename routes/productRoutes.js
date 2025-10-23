

const express = require("express");
const router = express.Router();
const { addProduct,getAllProducts,getProductDetails } = require("../controllers/productController");

router.post("/products", addProduct);
// Get all products of a store
router.get("/products/:storeId", getAllProducts);

// Get product details by productId
router.get("/products/item/:productId", getProductDetails);


module.exports = router;
