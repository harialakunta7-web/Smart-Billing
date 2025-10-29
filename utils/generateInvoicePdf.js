import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export const generateInvoicePDF = async (invoice, items, res) => {
  try {
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename=invoice_${invoice.id}.pdf');
    doc.pipe(res);

    // === HEADER ===
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("Smart Billing System", { align: "center" })
      .moveDown(1.2);

    const headerY = doc.y;
    doc.moveTo(50, headerY).lineTo(550, headerY).strokeColor("#999").stroke();
    doc.moveDown(0.8);

    doc.font("Helvetica").fontSize(12);
    const pad = 40;

    doc.text('Invoice ID: ${invoice.id || "N/A"}', pad, doc.y);
    doc.text('Store ID: ${invoice.store_id || "N/A"}', pad, doc.y + 5);
    doc.text('Customer Name: ${invoice.customer_name || "N/A"}', pad, doc.y + 10);
    doc.text('Phone: ${invoice.phone || "N/A"}', pad, doc.y + 15);
    doc.text('Date: ${new Date(invoice.created_at || Date.now()).toLocaleString()}', pad, doc.y + 20);
    doc.moveDown(2);

    // === TABLE HEADER ===
    doc.font("Helvetica-Bold").fontSize(16).text("Items", { underline: true, align: "center" });
    doc.moveDown(0.5);

    const colWidths = [70, 150, 50, 70, 70, 70];
    const startX = 50;
    let y = doc.y + 10;
    const headers = ["Product ID", "Description", "Qty", "Price", "Discount", "Total"];

    doc.font("Helvetica-Bold").fontSize(11);
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, y, { width: colWidths[i], align: "left" });
      x += colWidths[i];
    });

    y += 18;
    doc.moveTo(50, y).lineTo(540, y).strokeColor("#000").stroke();

    // === TABLE BODY ===
    let grandTotal = 0;
    let totalOriginal = 0;
    let totalSaved = 0;
    doc.font("Helvetica").fontSize(10);

    items.forEach((item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      const discount = Number(item.discount || 2);
      const description = String(item.description || "N/A");

      const originalTotal = qty * price;
      const discountedTotal = originalTotal * (1 - discount / 100);
      totalOriginal += originalTotal;
      grandTotal += discountedTotal;
      totalSaved += originalTotal - discountedTotal;

      x = startX;

      const columns = [
        item.product_id?.toString() || "N/A",
        description,
        qty.toString(),
        '₹${price.toFixed(2)}',
        '${discount}%',
        '₹${discountedTotal.toFixed(2)}',
      ];

      const descHeight = doc.heightOfString(description, {
        width: colWidths[1],
        align: "left",
      });

      const rowHeight = Math.max(descHeight + 10, 20);

      // Add page break if near bottom
      if (y + rowHeight > doc.page.height - 150) {
        doc.addPage();
        y = 80;
        doc.moveTo(50, y).lineTo(540, y).strokeColor("#000").stroke();
      }

      columns.forEach((text, i) => {
        const options = { width: colWidths[i], align: "left" };
        doc.text(text, x, y + 5, options);
        x += colWidths[i];
      });

      y += rowHeight;
      doc.moveTo(50, y).lineTo(540, y).strokeColor("#ccc").stroke();
    });

    // === SAVINGS SUMMARY ===
    doc.moveDown(1.5);
    if (totalSaved > 0) {
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("green")
        .text('You saved ₹${totalSaved.toFixed(2)} on this purchase!', { align: "left" })
        .fillColor("black");
    }

    // === GRAND TOTAL ===
    doc.moveDown(2);
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text('Grand Total: ₹${grandTotal.toFixed(2)}', { align: "center" });

    // === UPI QR CODE ===
    const upiId = "6309769305@axl";
    const payeeName = "Hari";
    const amount = grandTotal.toFixed(2);
    const upiLink = 'upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR';

    const qrDataUrl = await QRCode.toDataURL(upiLink);

    const qrY = doc.y + 40;
    if (qrY + 160 > doc.page.height) doc.addPage();

    doc.image(qrDataUrl, 240, qrY, { width: 120, height: 120 });
    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Scan to Pay via UPI", 0, qrY + 130, { align: "center", width: doc.page.width });

    // === FOOTER ===
    const footerY = doc.page.height - 50;
    doc.moveTo(50, footerY - 10).lineTo(550, footerY - 10).strokeColor("#aaa").stroke();

    doc
      .font("Helvetica-Oblique")
      .fontSize(12)
      .text("Thank you for your purchase!", 0, footerY, { align: "center", width: doc.page.width });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF", error: err.message });
    }
  }
};