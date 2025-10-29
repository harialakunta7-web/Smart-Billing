const pool = require("../db");

// Create a new invoice
const createInvoice = async (req, res) => {
  const { storeId, customerName, phone, items,paymentMethod } = req.body;

  try {
    // 1️⃣ Validate required fields
    if (!storeId || !customerName || !items || items.length === 0 || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2️⃣ Start a transaction
    await pool.query("BEGIN");
    let total = 0;
    for (const item of items) {
      const { productId, qty } = item;

      // Fetch product price from DB to prevent price tampering
      const productResult = await pool.query(
        "SELECT price FROM products WHERE id = $1 AND store_id = $2",
        [productId, storeId]
      );

      if (productResult.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: 'Product with ID ${productId} not found '});
      }

      const price = Number(productResult.rows[0].price);
      total += price * qty; // Add to total
      item.price = price;   // Save actual price for insertion
    }

    // 3️⃣ Insert invoice
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (store_id, customer_name, phone, total, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       RETURNING id`,
      [storeId, customerName, phone || null, total, paymentMethod]
    );

    const invoiceId = invoiceResult.rows[0].id;

    // 4️⃣ Insert invoice items + update stock
    for (const item of items) {
      const { productId, qty, price } = item;

      if (!productId || !qty || !price) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid item data" });
      }

      // Check product and stock
      const productResult = await pool.query(
        "SELECT quantity FROM products WHERE id = $1 AND store_id = $2",
        [productId, storeId]
      );

      if (productResult.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ error:' Product ${productId} not found for store ${storeId} '});
      }

      const availableQty = productResult.rows[0].quantity;
      if (availableQty < qty) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ error: 'Insufficient stock for product ${productId} '});
      }

      // Insert item (use qty column — matches models/invoiceModel.js)
      await pool.query(
        `INSERT INTO invoice_items (invoice_id, product_id, qty, price)
         VALUES ($1, $2, $3, $4)`,
        [invoiceId, productId, qty, price]
      );

      // Update product stock
      await pool.query(
        "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
        [qty, productId]
      );
    }

    // 5️⃣ Commit
    await pool.query("COMMIT");

    // 6️⃣ Send response
    res.status(201).json({
      invoiceId,
      total,
      status: "completed",
      message: "Invoice created successfully"
    });

  } catch (error) {
    console.error("❌ Error creating invoice:", error);
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Invoice by ID (No storeId required)
const getInvoiceById = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    // 1️⃣ Validate input
    if (!invoiceId) {
      return res.status(400).json({ error: "Missing invoiceId" });
    }

    // 2️⃣ Fetch invoice details
    const invoiceResult = await pool.query(
      `SELECT id AS invoiceId, store_id AS storeId, customer_name, phone,
              total, payment_method, status, created_at AS createdAt
       FROM invoices
       WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoiceResult.rows[0];

    // 3️⃣ Fetch invoice items with product details
    const itemsResult = await pool.query(
      `SELECT ii.product_id AS productId, p.name AS productName,
              ii.qty, ii.price, (ii.qty * ii.price) AS subtotal
       FROM invoice_items ii
       JOIN products p ON ii.product_id = p.id
       WHERE ii.invoice_id = $1`,
      [invoiceId]
    );

    invoice.items = itemsResult.rows;

    // 4️⃣ Return response
    res.status(200).json({
      success: true,
      invoice,
    });

  } catch (error) {
    console.error("❌ Error fetching invoice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// ✅ Get all invoices for a specific store
const getInvoicesByStore = async (req, res) => {
  const { storeId } = req.params;

  try {
    // 1️⃣ Validate input
    if (!storeId) {
      return res.status(400).json({ error: "Missing storeId" });
    }

    // 2️⃣ Fetch all invoices for the store
    const result = await pool.query(
      `SELECT id AS invoiceId,
              customer_name AS customerName,
              total,
              created_at AS date
       FROM invoices
       WHERE store_id = $1
       ORDER BY created_at DESC`,
      [storeId]
    );

    // 3️⃣ Return response
    res.status(200).json({
      success: true,
      count: result.rows.length,
      invoices: result.rows,
    });

  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {  createInvoice, getInvoiceById , getInvoicesByStore };