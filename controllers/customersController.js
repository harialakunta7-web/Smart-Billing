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



module.exports = { getAllCustomers, getRepeatCustomers, getNewCustomers, getAverageInvoiceValue };
