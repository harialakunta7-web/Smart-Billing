const pool = require("../db");

// 🟢 Get all customers for a store
const getAllCustomers = async (req, res) => {
  const { storeId } = req.query;

  try {
    // 1️⃣ Validate input
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // 2️⃣ Fetch customers for that store
    const result = await pool.query(
      `SELECT 
         id AS customer_id,
         customer_code,
         customer_name,
         phone,
         store_id,
         created_at
       FROM customers
       WHERE store_id = $1
       ORDER BY created_at DESC`,
      [storeId]
    );

    // 3️⃣ Return response
    res.status(200).json({
      totalCustomers: result.rows.length,
      customers: result.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllCustomers };
