

const pool = require("../db"); // database connection

// Add Product
const addProduct = async (req, res) => {
  try {
    // ✅ Step 1: Check Authorization header
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({ error: "Unauthorized - Missing API key" });
    }

    // ✅ Step 2: Find store by API key
    const storeResult = await pool.query("SELECT id FROM stores WHERE api_key = $1", [apiKey]);
    if (storeResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const storeIdFromKey = storeResult.rows[0].id;

    // ✅ Step 3: Extract product data from request body
    const { storeId, name, sku, price, quantity, category, unit } = req.body;

    // ✅ Step 4: Validate input fields
    if (!storeId || !name || !sku || !price || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (storeId !== storeIdFromKey) {
      return res.status(403).json({ error: "You cannot add product to another store" });
    }

    if (isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
      return res.status(400).json({ error: "Invalid price or quantity" });
    }

    // ✅ Step 5: Check if product with same SKU already exists for this store
    const existingProduct = await pool.query(
      "SELECT id FROM products WHERE store_id = $1 AND sku = $2",
      [storeId, sku]
    );
    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ error: "Product with this SKU already exists" });
    }

    // ✅ Step 6: Insert new product
    const result = await pool.query(
      `INSERT INTO products (store_id, name, sku, price, quantity, category, unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [storeId, name, sku, price, quantity, category || null, unit || null]
    );

    // ✅ Step 7: Send response
    res.status(201).json({
      productId: result.rows[0].id,
      message: "Product added successfully"
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addProduct };
