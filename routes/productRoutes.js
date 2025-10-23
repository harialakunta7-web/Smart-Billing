

const express = require("express");
const router = express.Router();
const { addProduct,getAllProducts } = require("../controllers/productController");

router.post("/", addProduct);
// Get all products of a store
router.get("/:storeId", getAllProducts);

module.exports = router;
