const express = require("express");
const router = express.Router();
const { getAllCustomers,getRepeatCustomers,getNewCustomers,getAverageInvoiceValue } = require("../controllers/customersController");

// GET /api/customers?storeId=1
router.get("/customers", getAllCustomers);
//repeat customers
router.get("/customers/repeat", getRepeatCustomers);
//new customers
router.get("/customers/new", getNewCustomers);
//average invoice value
router.get("/invoice/average-value", getAverageInvoiceValue);

module.exports = router;
