// Invoice generation utilities for customer-facing order invoices
import { VPPA_LOGO_DATA_URI } from './vppa-logo';

const COMPANY = {
  name: 'VPPA FASHIONS',
  address: 'No.161/1, Ground Floor, 100 Feet Rd, 3rd Block, Sir M Vishveswaraya Layout, Ullal, Bengaluru, Karnataka 560110',
  phone: '+91 90716 91999',
  email: 'vppafashions@gmail.com',
  gstin: '29DLFPG6129H1ZY',
  logo: VPPA_LOGO_DATA_URI,
};

const DEFAULT_GST_RATE = 5; // 5% total (2.5% CGST + 2.5% SGST)
const DEFAULT_CGST_RATE = 2.5;
const DEFAULT_SGST_RATE = 2.5;
const DEFAULT_HSN_CODE = '60062200';

function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise';
  }
  return result + ' Only';
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

interface OrderForInvoice {
  $id: string;
  $createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: string;
  total: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  notes: string;
}

interface HsnTaxEntry {
  hsn: string;
  cgstRate: number;
  sgstRate: number;
  taxable: number;
  cgst: number;
  sgst: number;
}

export function generateInvoiceHTML(order: OrderForInvoice): string {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(order.items);
  } catch {
    items = [];
  }

  const orderDate = new Date(order.$createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const invoiceNumber = `INV-${order.$id.slice(0, 8).toUpperCase()}`;
  const orderNumber = `#${order.$id.slice(0, 8).toUpperCase()}`;

  // Fetch HSN codes from the product data or use defaults
  // Each item may have hsnCode from the product; we'll look it up
  const formatRs = (amount: number) => `Rs. ${amount.toFixed(2)}`;

  // Build per-item tax calculations and HSN summary
  const hsnMap = new Map<string, HsnTaxEntry>();
  let totalTaxableAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  const itemRows = items.map((item) => {
    const lineTotal = item.price * item.quantity;
    // Use per-item HSN code if available, otherwise default
    const itemHsn = (item as OrderItem & { hsnCode?: string }).hsnCode || DEFAULT_HSN_CODE;
    const itemCgstRate = DEFAULT_CGST_RATE;
    const itemSgstRate = DEFAULT_SGST_RATE;
    const itemGstRate = itemCgstRate + itemSgstRate;

    const lineTaxable = Math.round((lineTotal / (1 + itemGstRate / 100)) * 100) / 100;
    const lineTax = Math.round((lineTotal - lineTaxable) * 100) / 100;
    const lineCgst = Math.round((lineTax / 2) * 100) / 100;
    const lineSgst = Math.round((lineTax - lineCgst) * 100) / 100;

    totalTaxableAmount += lineTaxable;
    totalCgst += lineCgst;
    totalSgst += lineSgst;

    // Accumulate HSN summary
    const existing = hsnMap.get(itemHsn);
    if (existing) {
      existing.taxable += lineTaxable;
      existing.cgst += lineCgst;
      existing.sgst += lineSgst;
    } else {
      hsnMap.set(itemHsn, { hsn: itemHsn, cgstRate: itemCgstRate, sgstRate: itemSgstRate, taxable: lineTaxable, cgst: lineCgst, sgst: lineSgst });
    }

    return `
      <tr>
        <td style="border:1px solid #000;padding:4px 6px">${item.name}${item.size ? ` (${item.size})` : ''}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center">${item.quantity}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:right">${formatRs(item.price)}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:right">${formatRs(lineTaxable)}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center">${itemHsn}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center">${itemGstRate}%</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:right">${formatRs(lineCgst)}<br/><span style="font-size:9px;color:#666">@${itemCgstRate}%</span></td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:right">${formatRs(lineSgst)}<br/><span style="font-size:9px;color:#666">@${itemSgstRate}%</span></td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:right">${formatRs(lineTotal)}</td>
      </tr>
    `;
  }).join('');

  const subtotal = order.total;
  const taxableAmount = totalTaxableAmount;
  const cgstAmount = totalCgst;
  const sgstAmount = totalSgst;
  const totalTax = cgstAmount + sgstAmount;

  // Extract billing info from notes
  const noteParts = order.notes ? order.notes.split(' | ').filter(Boolean) : [];
  const gstinLine = noteParts.find(p => p.startsWith('GSTIN:'));
  const companyLine = noteParts.find(p => p.startsWith('Company:'));

  return `<!DOCTYPE html>
<html>
<head>
  <title>Tax Invoice ${invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 210mm;
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      background: #fff;
    }
    body { padding: 15mm 12mm; }
    table { width:100%; border-collapse:collapse; }
    td, th { border:1px solid #000; padding:4px 6px; vertical-align:top; }
    .bold { font-weight:bold; }
    .text-right { text-align:right; }
    .text-center { text-align:center; }
    @media print {
      html, body { width: auto; padding: 0; }
      .no-print { display:none !important; }
    }
    @media screen {
      body {
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;border:1px solid #000;padding:10px">
    <div style="display:flex;align-items:center;gap:20px">
      <div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center">
        <img src="${COMPANY.logo}" alt="VPPA" style="width:60px;height:60px;object-fit:contain" />
      </div>
      <h1 style="font-size:18px;font-weight:bold">TAX INVOICE</h1>
    </div>
    <span style="font-weight:bold;font-size:14px">ORIGINAL</span>
  </div>

  <!-- Company + Invoice meta -->
  <table>
    <tbody>
      <tr>
        <td rowspan="4" style="width:50%;vertical-align:top">
          <strong>${COMPANY.name}</strong><br/>
          ${COMPANY.address}<br/>
          Tel: ${COMPANY.phone}<br/>
          Email: ${COMPANY.email}<br/>
          GSTIN: ${COMPANY.gstin}
        </td>
        <td><strong>Invoice No:</strong> ${invoiceNumber}</td>
        <td><strong>Invoice Date:</strong> ${orderDate}</td>
      </tr>
      <tr>
        <td><strong>Order No:</strong> ${orderNumber}</td>
        <td><strong>Order Date:</strong> ${orderDate}</td>
      </tr>
      <tr>
        <td><strong>Payment Ref:</strong> ${order.razorpayPaymentId || '-'}</td>
        <td><strong>Place of Supply:</strong> India</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Razorpay Order:</strong> ${order.razorpayOrderId || '-'}</td>
      </tr>
    </tbody>
  </table>

  <!-- Billed To / Ship To -->
  <table>
    <tbody>
      <tr>
        <td style="width:50%;vertical-align:top;padding:6px">
          <strong>Billed To</strong><br/><br/>
          <strong>${order.customerName}</strong><br/>
          ${order.address}<br/>
          ${order.phone ? 'Tel: ' + order.phone + '<br/>' : ''}
          ${order.email ? 'Email: ' + order.email + '<br/>' : ''}
          ${gstinLine ? gstinLine + '<br/>' : ''}
          ${companyLine ? companyLine : ''}
        </td>
        <td style="width:50%;vertical-align:top;padding:6px">
          <strong>Ship To</strong><br/><br/>
          <strong>${order.customerName}</strong><br/>
          ${order.address}<br/>
          ${order.phone ? 'Tel: ' + order.phone : ''}
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Items Table -->
  <table style="font-size:11px">
    <thead>
      <tr style="background:#f0f0f0">
        <th style="text-align:left">Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Taxable Val</th>
        <th style="text-align:center">HSN</th>
        <th style="text-align:center">GST</th>
        <th style="text-align:right">CGST</th>
        <th style="text-align:right">SGST</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr style="font-weight:bold">
        <td>Total</td>
        <td></td>
        <td style="text-align:right">${formatRs(subtotal)}</td>
        <td style="text-align:right">${formatRs(taxableAmount)}</td>
        <td></td>
        <td></td>
        <td style="text-align:right">${formatRs(cgstAmount)}</td>
        <td style="text-align:right">${formatRs(sgstAmount)}</td>
        <td style="text-align:right">${formatRs(subtotal)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Amount in Words -->
  <div style="border:1px solid #000;border-top:none;padding:6px;font-size:11px">
    <strong>Amount in words:</strong> ${numberToWords(subtotal)}
  </div>

  <!-- Tax Summary + Totals -->
  <table style="font-size:11px">
    <tbody>
      <tr>
        <td style="width:50%;vertical-align:top;padding:0">
          <table style="width:100%;border-collapse:collapse;font-size:10px">
            <thead>
              <tr>
                <th style="border:1px solid #000;padding:3px;text-align:center">HSN/SAC</th>
                <th colspan="2" style="border:1px solid #000;padding:3px;text-align:center">Central Tax</th>
                <th colspan="2" style="border:1px solid #000;padding:3px;text-align:center">State Tax</th>
              </tr>
              <tr>
                <th style="border:1px solid #000;padding:3px"></th>
                <th style="border:1px solid #000;padding:3px;text-align:center">Rate</th>
                <th style="border:1px solid #000;padding:3px;text-align:center">Amount</th>
                <th style="border:1px solid #000;padding:3px;text-align:center">Rate</th>
                <th style="border:1px solid #000;padding:3px;text-align:center">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from(hsnMap.values()).map(entry => `
              <tr>
                <td style="border:1px solid #000;padding:3px;text-align:center">${entry.hsn}</td>
                <td style="border:1px solid #000;padding:3px;text-align:center">${entry.cgstRate}%</td>
                <td style="border:1px solid #000;padding:3px;text-align:center">${entry.cgst.toFixed(2)}</td>
                <td style="border:1px solid #000;padding:3px;text-align:center">${entry.sgstRate}%</td>
                <td style="border:1px solid #000;padding:3px;text-align:center">${entry.sgst.toFixed(2)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </td>
        <td style="width:50%;vertical-align:top;padding:6px">
          <table style="width:100%;border-collapse:collapse;font-size:11px">
            <tr><td>Subtotal</td><td style="text-align:right">${formatRs(taxableAmount)}</td></tr>
            ${Array.from(hsnMap.values()).map(entry => `
            <tr><td>CGST @ ${entry.cgstRate}% (${entry.hsn})</td><td style="text-align:right">${formatRs(entry.cgst)}</td></tr>
            <tr><td>SGST @ ${entry.sgstRate}% (${entry.hsn})</td><td style="text-align:right">${formatRs(entry.sgst)}</td></tr>`).join('')}
            <tr><td>Shipping</td><td style="text-align:right">Rs. 0.00</td></tr>
            <tr style="font-weight:bold;font-size:13px"><td>Grand Total</td><td style="text-align:right">${formatRs(subtotal)}</td></tr>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <table style="font-size:11px">
    <tbody>
      <tr>
        <td style="width:50%;padding:8px;vertical-align:top">
          <strong>Terms & Conditions</strong><br/>
          1. Goods once sold will not be taken back.<br/>
          2. Subject to Bangalore jurisdiction only.
        </td>
        <td style="width:50%;padding:8px;text-align:right;vertical-align:bottom">
          <strong>For ${COMPANY.name}</strong><br/><br/><br/>
          Authorised Signatory
        </td>
      </tr>
    </tbody>
  </table>

  <div style="text-align:center;margin-top:10px;font-size:10px;color:#666">
    This is a computer generated invoice.
  </div>
</body>
</html>`;
}

export function openInvoicePrint(order: OrderForInvoice): void {
  const html = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}
