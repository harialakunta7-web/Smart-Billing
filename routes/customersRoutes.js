const express = require("express");
const router = express.Router();
const { getAllCustomers,getRepeatCustomers,getNewCustomers,getAverageInvoiceValue ,getCustomerSpendingTrends} = require("../controllers/customersController");

// GET /api/customers?storeId=1
router.get("/customers", getAllCustomers);
//repeat customers
router.get("/customers/repeat", getRepeatCustomers);
//new customers
router.get("/customers/new", getNewCustomers);
//average invoice value
router.get("/invoice/average-value", getAverageInvoiceValue);
// customets trends daily, weekly, monthly can be added here in future
router.get("/customers/spending-trends", getCustomerSpendingTrends);

module.exports = router;
