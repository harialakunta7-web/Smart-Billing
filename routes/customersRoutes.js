const express = require("express");
const router = express.Router();
const { getAllCustomers,getRepeatCustomers } = require("../controllers/customersController");

// GET /api/customers?storeId=1
router.get("/", getAllCustomers);
//repeat customers
router.get("/repeat", getRepeatCustomers);

module.exports = router;
