const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/customersController");

// GET /api/customers?storeId=1
router.get("/", getAllCustomers);

module.exports = router;
