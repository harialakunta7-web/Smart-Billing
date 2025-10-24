// const pool = require("../db");
// const jwt = require("jsonwebtoken");

// const verifyPhone = async (req, res) => {
//  // console.log("📞 /verify-phone endpoint hit", req.method, req.body);

//   const { phone } = req.body;

//   if (!/^\d{10}$/.test(phone)) {
//     return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
//   }

//   try {
//     const result = await pool.query("SELECT * FROM stores WHERE phone = $1", [phone]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Store not found. Please register first." });
//     }

//     // For demo, fixed OTP
//     res.status(200).json({ message: "OTP sent successfully", otp: "123456" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const login = async (req, res) => {
//  // console.log("🔑 /login endpoint hit", req.method, req.body);

//   const { phone, otp } = req.body;

//   if (!/^\d{10}$/.test(phone)) {
//     return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
//   }
//   if (otp !== "123456") {
//     return res.status(401).json({ error: "Invalid OTP" });
//   }

//   try {
//     const result = await pool.query("SELECT * FROM stores WHERE phone = $1", [phone]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Store not registered" });
//     }

//     const store = result.rows[0];
//     const token = jwt.sign(
//       { storeId: store.id, storeName: store.store_name },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       storeId: store.id,
//       storeName: store.store_name
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// module.exports = { verifyPhone, login };

const pool = require("../db");
const jwt = require("jsonwebtoken");

// ✅ Verify Phone API
const verifyPhone = async (req, res) => {
  try {
    // Check if backend is actually receiving JSON
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Missing request body" });
    }

    const { phone } = req.body;

    // Validate input
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    console.log("📞 /verify-phone:", phone);

    // Check if store exists
    const result = await pool.query("SELECT * FROM stores WHERE phone = $1", [phone]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store not found. Please register first.",
      });
    }

    // ✅ Demo: Send static OTP for now
    const otp = "123456";
    console.log(`✅ OTP sent to ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // You can remove this line in production
    });
  } catch (error) {
    console.error("❌ Error in verifyPhone:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Login API
const login = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Missing request body" });
    }

    const { phone, otp } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    if (!otp || otp !== "123456") {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    console.log("🔑 /login:", phone);

    const result = await pool.query("SELECT * FROM stores WHERE phone = $1", [phone]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store not registered",
      });
    }

    const store = result.rows[0];

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { storeId: store.id, storeName: store.store_name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`✅ Login successful for store: ${store.store_name}`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      storeId: store.id,
      storeName: store.store_name,
    });
  } catch (error) {
    console.error("❌ Error in login:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { verifyPhone, login };
