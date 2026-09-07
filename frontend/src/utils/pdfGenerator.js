import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to draw Kudumbashree PDF Header
const drawHeader = (doc, title) => {
  // Green Header Bar
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, 210, 25, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KUDUMBASHREE MANAGEMENT SYSTEM', 14, 16);

  // Subtitle / Document Type
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 14, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);

  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 46, 196, 46);
};

// Helper to draw Footer
const drawFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Kudumbashree State Poverty Eradication Mission - Official Document', 14, 285);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  }
};

/**
 * Generate PDF Invoice for Purchase Orders
 */
export const generateOrderInvoice = (order) => {
  const doc = new jsPDF();
  drawHeader(doc, 'Official Purchase Invoice');

  let yPos = 54;

  // Invoice Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(`Invoice ID: #${order._id ? order._id.substr(-8).toUpperCase() : 'INV-' + Date.now()}`, 14, yPos);
  doc.text(`Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 130, yPos);

  yPos += 8;
  doc.text(`Customer Name: ${order.user?.name || 'Valued Customer'}`, 14, yPos);
  doc.text(`Status: ${order.status ? order.status.toUpperCase() : 'CONFIRMED'}`, 130, yPos);

  yPos += 8;
  doc.text(`Delivery Address: ${order.shippingAddress || 'N/A'}`, 14, yPos);
  doc.text(`Payment: ${order.paymentMethod || 'Cash on Delivery'} (${order.paymentStatus || 'Pending'})`, 130, yPos);

  yPos += 12;

  // Items Table
  const tableColumn = ['#', 'Product Name', 'Category', 'Qty', 'Unit Price (₹)', 'Subtotal (₹)'];
  const tableRows = [];

  const items = order.orderItems || order.items || [];
  let totalCalculated = 0;

  items.forEach((item, index) => {
    const name = item.product?.name || item.name || 'Kudumbashree Product';
    const category = item.product?.category || 'General';
    const qty = item.qty || item.quantity || 1;
    const price = item.price || 0;
    const subtotal = qty * price;
    totalCalculated += subtotal;

    tableRows.push([index + 1, name, category, qty, `₹${price.toFixed(2)}`, `₹${subtotal.toFixed(2)}`]);
  });

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // Grand Total Box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(120, finalY, 76, 20, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text(`Grand Total: ₹${(order.totalPrice || totalCalculated).toFixed(2)}`, 126, finalY + 13);

  drawFooter(doc);
  doc.save(`Kudumbashree_Invoice_${order._id ? order._id.substr(-6) : 'Order'}.pdf`);
};

/**
 * Generate PDF Financial Statement (Savings & Loans)
 */
export const generateFinancialReport = (userData, savingsList = [], loansList = []) => {
  const doc = new jsPDF();
  drawHeader(doc, 'Financial Statement & Loan Summary');

  let yPos = 54;

  // Member Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text(`Member Name: ${userData?.name || 'N/A'}`, 14, yPos);
  doc.text(`Role: ${userData?.role ? userData.role.toUpperCase() : 'MEMBER'}`, 130, yPos);

  yPos += 7;
  doc.text(`NHG Unit: ${userData?.nhg?.name || userData?.nhgName || 'Primary NHG'}`, 14, yPos);
  doc.text(`Total Savings: ₹${(userData?.savingsBalance || 0).toFixed(2)}`, 130, yPos);

  yPos += 12;

  // Savings History Table
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text('1. Savings Contribution History', 14, yPos);
  yPos += 4;

  const savingsColumns = ['#', 'Date', 'Type', 'Amount (₹)', 'Description'];
  const savingsRows = savingsList.map((s, idx) => [
    idx + 1,
    s.date ? new Date(s.date).toLocaleDateString() : new Date().toLocaleDateString(),
    s.type || 'Weekly Savings',
    `₹${(s.amount || 0).toFixed(2)}`,
    s.description || 'Regular deposit',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [savingsColumns],
    body: savingsRows.length ? savingsRows : [['-', '-', 'No savings records found', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
  });

  let loansY = doc.lastAutoTable.finalY + 12;

  // Check page overflow
  if (loansY > 220) {
    doc.addPage();
    loansY = 30;
  }

  // Loans Table
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text('2. Loan Accounts & History', 14, loansY);
  loansY += 4;

  const loanColumns = ['#', 'Loan Type', 'Amount (₹)', 'Interest (%)', 'Status', 'Purpose'];
  const loanRows = loansList.map((l, idx) => [
    idx + 1,
    l.loanType || l.type || 'Personal NHG Loan',
    `₹${(l.amount || 0).toFixed(2)}`,
    `${l.interestRate || 4}%`,
    (l.status || 'Active').toUpperCase(),
    l.purpose || 'Micro enterprise / Welfare',
  ]);

  autoTable(doc, {
    startY: loansY,
    head: [loanColumns],
    body: loanRows.length ? loanRows : [['-', '-', 'No loan records found', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  doc.save(`Kudumbashree_Financial_Statement_${userData?.name ? userData.name.replace(/\s+/g, '_') : 'Member'}.pdf`);
};

/**
 * Generate PDF Meeting Report & Minutes
 */
export const generateMeetingReport = (meeting) => {
  const doc = new jsPDF();
  drawHeader(doc, 'NHG Meeting Minutes & Attendance Report');

  let yPos = 54;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text(`Meeting Title: ${meeting.title || 'Weekly NHG Meeting'}`, 14, yPos);

  yPos += 7;
  doc.text(`Date & Time: ${meeting.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'} | ${meeting.time || ''}`, 14, yPos);
  doc.text(`Venue: ${meeting.location || meeting.venue || 'NHG Hall'}`, 130, yPos);

  yPos += 7;
  doc.text(`NHG Unit: ${meeting.nhg?.name || 'Local NHG Unit'}`, 14, yPos);

  yPos += 12;

  // Agenda & Minutes Box
  doc.setFontSize(10);
  doc.setFillColor(249, 250, 251);
  doc.rect(14, yPos, 182, 28, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(14, yPos, 182, 28, 'S');

  doc.setTextColor(16, 185, 129);
  doc.text('Agenda & Minutes Summary:', 18, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  const splitAgenda = doc.splitTextToSize(meeting.description || meeting.agenda || 'Discussion on weekly savings collection, upcoming micro-enterprise stalls, and welfare schemes.', 174);
  doc.text(splitAgenda, 18, yPos + 14);

  yPos += 36;

  // Attendance Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text('Member Attendance Record', 14, yPos);
  yPos += 4;

  const attColumns = ['#', 'Member Name', 'Attendance Status', 'Savings Deposited (₹)'];
  const attendees = meeting.attendance || meeting.attendees || [];
  const attRows = attendees.map((a, idx) => [
    idx + 1,
    a.user?.name || a.name || `Member ${idx + 1}`,
    a.present || a.status === 'present' ? 'PRESENT' : 'ABSENT',
    `₹${a.savingsDeposited || 100}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [attColumns],
    body: attRows.length ? attRows : [['1', 'All NHG Members', 'PRESENT', '₹100.00']],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);
  doc.save(`Kudumbashree_Meeting_${meeting.title ? meeting.title.replace(/\s+/g, '_') : 'Report'}.pdf`);
};
