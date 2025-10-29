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
module.exports = {  createInvoice };