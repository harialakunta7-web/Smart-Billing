const express = require("express");
const router = express.Router();
const { registerStore, getAllStores } = require("../controllers/storeController");

// Register Store
router.post("/register", registerStore);

// Get All Stores (Admin Only)
router.get("/", getAllStores);

module.exports = router;
