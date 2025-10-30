const pool = require("../db");

// 🟩 Get total customers
exports.getTotalCustomers = async (req, res) => {
  const { storeId } = req.params;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const result = await pool.query(
      "SELECT COUNT(*) AS total_customers FROM customers WHERE store_id = $1",
      [storeId]
    );

    res.status(200).json({
      storeId,
      totalCustomers: Number(result.rows[0].total_customers),
    });
  } catch (error) {
    console.error("Error fetching total customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
