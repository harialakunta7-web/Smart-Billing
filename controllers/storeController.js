const pool = require("../db");
const generateApiKey = require("../utils/generateApikey");

// ----------------------
// Register Store (existing)
// ----------------------
// const registerStore = async (req, res) => {
//   const { storeName, ownerName, email, phone, gstNumber, address, logoUrl } = req.body;

//   try {
//     const query = `
//       SELECT * FROM stores 
//       WHERE (email = $1 AND email IS NOT NULL)
//          OR (phone = $2 AND phone IS NOT NULL)
//          OR (gst_number = $3 AND gst_number IS NOT NULL)
//       LIMIT 1
//     `;
//     const { rows } = await pool.query(query, [email, phone, gstNumber]);

//     if (rows.length > 0) {
//       return res.status(200).json({
//         status: "Store already existed",
//         storeId: rows[0].id,
//         apiKey: rows[0].api_key,
//       });
//     }

//     const apiKey = generateApiKey();
//     const insertQuery = `
//       INSERT INTO stores 
//       (store_name, owner_name, email, phone, gst_number, address, logo_url, api_key)
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//       RETURNING id, api_key
//     `;
//     const result = await pool.query(insertQuery, [
//       storeName || null,
//       ownerName || null,
//       email || null,
//       phone || null,
//       gstNumber || null,
//       address || null,
//       logoUrl || null,
//       apiKey,
//     ]);

//     res.status(201).json({
//       storeId: result.rows[0].id,
//       apiKey: result.rows[0].api_key,
//       message: "Store registered successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const registerStore = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, gstNumber, address, logoUrl } = req.body;

    // ✅ Phone validation: must be 10 digits only
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    if (!storeName || !ownerName || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if store already exists
    const existing = await pool.query("SELECT * FROM stores WHERE phone = $1 OR email = $2", [phone, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Store with this phone or email already exists" });
    }

    // Generate API key and insert
    const apiKey = require("crypto").randomBytes(16).toString("hex");
    const result = await pool.query(
      `INSERT INTO stores (store_name, owner_name, email, phone, gst_number, address, logo_url, api_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [storeName, ownerName, email, phone, gstNumber, address, logoUrl, apiKey]
    );

    res.status(201).json({ message: "Store registered successfully", store: result.rows[0] });
  } catch (error) {
    console.error("Error registering store:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// ----------------------
// Get All Stores (Admin Only)
// ----------------------
const getAllStores = async (req, res) => {
  try {
    const adminToken = req.headers.authorization;

    if (!adminToken || adminToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const result = await pool.query(`
      SELECT id AS "storeId", store_name AS "storeName", owner_name AS "ownerName",
             email, phone, gst_number AS "gstNumber"
      FROM stores
      ORDER BY id ASC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { registerStore, getAllStores };
