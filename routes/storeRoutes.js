const express = require("express");
const router = express.Router();
const { registerStore, getAllStores,getStoreById } = require("../controllers/storeController");

// Register Store
router.post("/register", registerStore);

// Get All Stores (Admin Only)
router.get("/", getAllStores);

// Get Store by ID
router.get("/:storeId", getStoreById);
module.exports = router;
