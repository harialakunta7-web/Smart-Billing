// const pool = require("../db");

// // 🟢 Get all customers for a store
// const getAllCustomers = async (req, res) => {
//   const { storeId } = req.query;

//   try {
//     // 1️⃣ Validate input
//     if (!storeId) {
//       return res.status(400).json({ error: "storeId is required" });
//     }

//     // 2️⃣ Fetch customers for that store
//     const result = await pool.query(
//       `SELECT 
//          id AS customer_id,
//          customer_code,
//          customer_name,
//          phone,
//          store_id,
//          created_at
//        FROM customers
//        WHERE store_id = $1
//        ORDER BY created_at DESC`,
//       [storeId]
//     );

//     // 3️⃣ Return response
//     res.status(200).json({
//       totalCustomers: result.rows.length,
//       customers: result.rows,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching customers:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



// // ✅ Get count of repeat customers (who have made multiple purchases)
// const getRepeatCustomers = async (req, res) => {
//   const { storeId } = req.query;

//   try {
//     if (!storeId) {
//       return res.status(400).json({ error: "storeId is required" });
//     }

//     const result = await pool.query(
//       `SELECT COUNT(*) AS repeat_customers
//        FROM (
//          SELECT customer_id
//          FROM invoices
//          WHERE store_id = $1
//          GROUP BY customer_id
//          HAVING COUNT(*) > 1
//        ) AS repeat_customers;`,
//       [storeId]
//     );

//     const count = parseInt(result.rows[0].repeat_customers) || 0;

//     res.status(200).json({
//       storeId: Number(storeId),
//       repeatCustomers: count,
//       message: "Repeat customer count retrieved successfully"
//     });

//   } catch (error) {
//     console.error("❌ Error fetching repeat customers:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // ✅ Get New Customers (Last 30 Days)
// const getNewCustomers = async (req, res) => {
//   const { storeId } = req.query;

//   try {
//     if (!storeId) {
//       return res.status(400).json({ error: "Missing storeId" });
//     }

//     const query = `
//       SELECT COUNT(*) AS new_customers
//       FROM customers
//       WHERE store_id = $1
//       AND created_at >= NOW() - INTERVAL '30 days'
//     `;

//     const result = await pool.query(query, [storeId]);
//     const count = parseInt(result.rows[0].new_customers, 10) || 0;

//     res.status(200).json({
//       storeId,
//       newCustomers: count,
//       message: "New customer count (last 30 days) fetched successfully"
//     });
//   } catch (error) {
//     console.error("❌ Error fetching new customers:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };





// module.exports = { getAllCustomers ,getRepeatCustomers, getNewCustomers };


const pool = require("../db");

// Get All Customers for a store
const getAllCustomers = async (req, res) => {
  const { storeId } = req.query;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // ✅ Step 1: Validate store exists
    const storeCheck = await pool.query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: "Invalid storeId. Store not found." });
    }

    // ✅ Step 2: Get all customers for the store
    const result = await pool.query(
      `SELECT id AS customerId, customer_code, customer_name, phone, created_at
       FROM customers
       WHERE store_id = $1
       ORDER BY created_at DESC`,
      [storeId]
    );

    res.status(200).json({
      storeId,
      totalCustomers: result.rows.length,
      customers: result.rows,
      message: "Customers fetched successfully"
    });

  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get Repeat Customers (customers with multiple purchases)
const getRepeatCustomers = async (req, res) => {
  const { storeId } = req.query;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // ✅ Step 1: Validate store exists
    const storeCheck = await pool.query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: "Invalid storeId. Store not found." });
    }

    // ✅ Step 2: Count customers who have more than 1 invoice
    const result = await pool.query(
      `SELECT COUNT(DISTINCT customer_id) AS repeat_customers
       FROM invoices
       WHERE store_id = $1
       AND customer_id IN (
         SELECT customer_id
         FROM invoices
         WHERE store_id = $1
         GROUP BY customer_id
         HAVING COUNT(*) > 1
       )`,
      [storeId]
    );

    res.status(200).json({
      storeId,
      repeatCustomers: Number(result.rows[0].repeat_customers),
      message: "Repeat customers fetched successfully"
    });

  } catch (error) {
    console.error("❌ Error fetching repeat customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Get New Customers (Last 30 Days)
const getNewCustomers = async (req, res) => {
  const { storeId } = req.query;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // ✅ Step 1: Validate store exists
    const storeCheck = await pool.query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: "Invalid storeId. Store not found." });
    }

    // ✅ Step 2: Count new customers (last 30 days)
    const result = await pool.query(
      `SELECT COUNT(*) AS new_customers
       FROM customers
       WHERE store_id = $1
       AND created_at >= NOW() - INTERVAL '30 days'`,
      [storeId]
    );

    res.status(200).json({
      storeId,
      newCustomers: Number(result.rows[0].new_customers),
      message: "New customers (last 30 days) fetched successfully",
    });

  } catch (error) {
    console.error("❌ Error fetching new customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get Average Invoice Value
const getAverageInvoiceValue = async (req, res) => {
  const { storeId } = req.query;

  try {
    // 1️⃣ Validate input
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // 2️⃣ Check if store exists
    const storeCheck = await pool.query("SELECT id FROM stores WHERE id = $1", [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: "Invalid storeId. Store not found." });
    }

    // 3️⃣ Calculate average invoice value
    const avgResult = await pool.query(
      "SELECT COALESCE(ROUND(AVG(total), 2), 0) AS avg_invoice_value FROM invoices WHERE store_id = $1",
      [storeId]
    );

    const avgValue = avgResult.rows[0].avg_invoice_value;

    // 4️⃣ Send response
    res.json({
      storeId,
      avgInvoiceValue: parseFloat(avgValue),
      message: "Average invoice value fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching average invoice value:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Customer Spending Trends (Monthly/Daily)
const getCustomerSpendingTrends = async (req, res) => {
  const { storeId, range = "monthly" } = req.query;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // ✅ Validate store exists
    const storeCheck = await pool.query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: `Store ID ${storeId} not found` });
    }

    let query;
    if (range === "daily") {
      query = `
        SELECT
          TO_CHAR(created_at, 'YYYY-MM-DD') AS label,
          SUM(total) AS value
        FROM invoices
        WHERE store_id = $1
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD'), DATE_TRUNC('day', created_at)
        ORDER BY DATE_TRUNC('day', created_at);
      `;
    } else {
      query = `
        SELECT
          TO_CHAR(created_at, 'Mon') AS label,
          SUM(total) AS value
        FROM invoices
        WHERE store_id = $1
        GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at);
      `;
    }

    const result = await pool.query(query, [storeId]);

    const labels = result.rows.map((r) => r.label);
    const values = result.rows.map((r) => parseFloat(r.value));

    res.json({
      storeId,
      range,
      labels,
      values,
      message: "Customer spending trends fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching spending trends:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Top Customers by Spending

const getTopCustomers = async (req, res) => {
  const { storeId, limit = 5 } = req.query;

  try {
    if (!storeId) {
      return res.status(400).json({ error: "storeId is required" });
    }

    // ✅ Validate store existence
    const storeCheck = await pool.query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: `Store ID ${storeId} not found` });
    }

    const query = `
      SELECT
        c.id AS customer_id,
        c.name AS name,
        SUM(i.total) AS total_spent,
        COUNT(i.id) AS orders,
        MAX(i.created_at) AS last_purchase
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.store_id = $1
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC
      LIMIT $2;
    `;

    const result = await pool.query(query, [storeId, limit]);

    const formatted = result.rows.map((row) => ({
      customerId: row.customer_id,
      name: row.name,
      totalSpent: parseFloat(row.total_spent),
      orders: parseInt(row.orders),
      lastPurchase: row.last_purchase,
    }));

    res.json({
      storeId,
      topCustomers: formatted,
      message: `Top ${limit} customers fetched successfully`,
    });
  } catch (error) {
    console.error("❌ Error fetching top customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { getAllCustomers, getRepeatCustomers, getNewCustomers, getAverageInvoiceValue , getCustomerSpendingTrends, getTopCustomers};
