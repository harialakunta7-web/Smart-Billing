const express = require("express");
const router = express.Router();
const { createInvoice,getInvoiceById,getInvoicesByStore,getInvoicePDF } = require("../controllers/invoiceController");



// When mounted at /api in server.js, use plain /invoices here
router.post("/invoices", createInvoice);
router.get("/invoices/:invoiceId", getInvoiceById);
router.get("/invoices/stores/:storeId", getInvoicesByStore);
router.get("/invoices/pdf/:invoiceId", getInvoicePDF);
// router.patch("/invoices/:invoiceId/status", updateInvoiceStatus);
module.exports = router;