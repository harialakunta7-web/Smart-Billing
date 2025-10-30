const express = require("express");
const router = express.Router();
const { getAllCustomers,getRepeatCustomers,getNewCustomers } = require("../controllers/customersController");

// GET /api/customers?storeId=1
router.get("/", getAllCustomers);
//repeat customers
router.get("/repeat", getRepeatCustomers);
//new customers
router.get("/new", getNewCustomers);

module.exports = router;
