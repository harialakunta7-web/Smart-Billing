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



// ✅ Get count of repeat customers (who have made multiple purchases)
const getRepeatCustomers = async (req, res) => {
  const { storeId } = req.query;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    const result = await pool.query(
      `SELECT COUNT(*) AS repeat_customers
       FROM (
         SELECT customer_id
         FROM invoices
         WHERE store_id = $1
         GROUP BY customer_id
         HAVING COUNT(*) > 1
       ) AS repeat_customers;`,
      [storeId]
    );

    const count = parseInt(result.rows[0].repeat_customers) || 0;

    res.status(200).json({
      storeId: Number(storeId),
      repeatCustomers: count,
      message: "Repeat customer count retrieved successfully"
    });

  } catch (error) {
    console.error("❌ Error fetching repeat customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = { getAllCustomers ,getRepeatCustomers};
