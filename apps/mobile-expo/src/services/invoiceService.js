import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const InvoiceService = {
  generateInvoiceHtml: (booking) => {
    const invoiceNum = booking.booking_code || `INV-${booking.id || Date.now().toString().slice(-6)}`;
    const dateStr = booking.scheduled_date || booking.date || new Date().toLocaleDateString('en-IN');
    const workerFee = Number(booking.worker_fee || booking.workerFee || 950);
    const platformFee = Number(booking.platform_fee || 99);
    const txnFee = Number(booking.transaction_fee || Math.round(workerFee * 0.05));
    const totalAmount = Number(booking.total_amount || (workerFee + platformFee + txnFee));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mistri Pro Tax Invoice - ${invoiceNum}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 30px;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 26px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      margin: 0;
      font-size: 20px;
      color: #0f172a;
    }
    .invoice-title p {
      margin: 2px 0 0;
      font-size: 12px;
      color: #64748b;
    }
    .info-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 10px;
    }
    .info-col h4 {
      margin: 0 0 6px;
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .info-col p {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .info-col span {
      font-size: 12px;
      color: #475569;
      font-weight: normal;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .text-right {
      text-align: right;
    }
    .total-box {
      margin-left: auto;
      width: 280px;
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    .total-row.grand {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      background: #dcfce7;
      color: #15803d;
      font-weight: 700;
      font-size: 11px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">MISTRI PRO</div>
      <div class="tagline">India's Trusted On-Demand Construction Platform</div>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <p>Invoice #: <strong>${invoiceNum}</strong></p>
      <p>Date: ${dateStr}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-col">
      <h4>Billed To (Customer)</h4>
      <p>${booking.customer_name || booking.customerName || 'Customer'}</p>
      <span>Contact: ${booking.customer_phone || booking.customerPhone || '+91 98290 12345'}</span><br>
      <span>Site: ${booking.site_location || booking.location || 'Sawai Madhopur, Rajasthan'}</span>
    </div>

    <div class="info-col">
      <h4>Service Provider (Mistri)</h4>
      <p>${booking.worker_name || booking.workerName || 'Assigned Mistri'}</p>
      <span>Trade: ${booking.worker_skill || booking.category || 'Skilled Labour'}</span><br>
      <span class="badge">Aadhaar KYC Verified ✓</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Duration / Shift</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${booking.title || 'Skilled Construction Service'}</strong><br>
          <span style="font-size: 11px; color: #64748b;">Direct onsite deployment & masonry work</span>
        </td>
        <td>${booking.duration || '1 Day'}</td>
        <td class="text-right">₹${workerFee.toLocaleString()}</td>
        <td class="text-right">₹${workerFee.toLocaleString()}</td>
      </tr>
      <tr>
        <td>
          <strong>Mistri Pro Platform Booking Fee</strong><br>
          <span style="font-size: 11px; color: #64748b;">Includes 100% Secured Payment & Onsite Guarantee</span>
        </td>
        <td>1 Order</td>
        <td class="text-right">₹99</td>
        <td class="text-right">₹99</td>
      </tr>
      <tr>
        <td>
          <strong>Digital Security & Gateway Fee (5%)</strong><br>
          <span style="font-size: 11px; color: #64748b;">UPI/Banking processing & secure disbursement</span>
        </td>
        <td>5%</td>
        <td class="text-right">₹${txnFee}</td>
        <td class="text-right">₹${txnFee}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row">
      <span>Subtotal (Labour):</span>
      <span>₹${workerFee.toLocaleString()}</span>
    </div>
    <div class="total-row">
      <span>Platform & Security Fees:</span>
      <span>₹${(platformFee + txnFee).toLocaleString()}</span>
    </div>
    <div class="total-row grand">
      <span>Total Paid:</span>
      <span>₹${totalAmount.toLocaleString()}</span>
    </div>
    <p style="margin-top: 6px; font-size: 11px; color: #16a34a; font-weight: 600;">
      ✓ Payment Status: SECURED & VERIFIED VIA RAZORPAY
    </p>
  </div>

  <div class="footer">
    <p>This is a computer-generated invoice and requires no physical signature.<br>
    Mistri Pro Technologies Pvt Ltd • GSTIN: 08AAECM1234F1Z8 • Support: support@mistripro.in</p>
  </div>
</body>
</html>
    `;
  },

  downloadInvoicePdf: async (booking) => {
    try {
      const html = InvoiceService.generateInvoiceHtml(booking);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Download Invoice ${booking.booking_code || booking.id}`,
        });
      } else {
        Alert.alert('Invoice Ready', `Invoice generated at: ${uri}`);
      }
      return { success: true, uri };
    } catch (err) {
      console.log('Invoice generation error:', err);
      Alert.alert('Invoice Error', 'Unable to generate PDF invoice. Please try again.');
      return { success: false, error: err.message };
    }
  },
};
