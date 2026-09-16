import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Brand constants ──────────────────────────────────────────────────────────
const GOLD = [201, 168, 76] as [number, number, number];
const CHARCOAL = [28, 28, 30] as [number, number, number];
const LIGHT_GRAY = [245, 240, 232] as [number, number, number];
const TEXT_MUTED = [120, 120, 120] as [number, number, number];

// ─── Header drawn on every page ───────────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string) {
  const pw = doc.internal.pageSize.getWidth();

  // Dark header bar
  doc.setFillColor(...CHARCOAL);
  doc.rect(0, 0, pw, 36, "F");

  // Gold left accent
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 4, 36, "F");

  // Try to add logo — skip gracefully if it fails
  try {
    const img = new Image();
    img.src = "/logo.jpeg";
    doc.addImage(img, "JPEG", 10, 6, 24, 24);
  } catch {
    // logo not available in PDF context — skip
  }

  // Organisation name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("White-Collar English Care", 40, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text("7no. Lane, I Block, Halishahar, Chittagong  |  +880 1925-242188", 40, 23);

  // Document title on the right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text(title.toUpperCase(), pw - 14, 20, { align: "right" });

  // Gold divider below header
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(0, 36, pw, 36);
}

// ─── Footer drawn on every page ───────────────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(14, ph - 18, pw - 14, ph - 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("White-Collar English Care — Confidential", 14, ph - 11);
  doc.text(`Page ${pageNum} of ${totalPages}`, pw - 14, ph - 11, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, pw / 2, ph - 11, { align: "center" });
}

// ─── Signature block ──────────────────────────────────────────────────────────
function drawSignatureBlock(doc: jsPDF, y: number) {
  const pw = doc.internal.pageSize.getWidth();
  const colW = (pw - 28) / 3;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pw - 28, 30, 1, 1, "F");

  const sigs = [
    { label: "Student Signature", x: 14 + colW * 0 + colW / 2 },
    { label: "Instructor", x: 14 + colW * 1 + colW / 2 },
    { label: "Director / Admin", x: 14 + colW * 2 + colW / 2 },
  ];

  sigs.forEach(({ label, x }) => {
    // Signature line
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(x - 28, y + 20, x + 28, y + 20);
    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(label, x, y + 27, { align: "center" });
  });
}

// ─── INFO BOX ────────────────────────────────────────────────────────────────
function drawInfoRow(doc: jsPDF, x: number, y: number, label: string, value: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(label + ":", x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...CHARCOAL);
  doc.text(value, x + 28, y);
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Generate a single invoice PDF.
 */
export function generateInvoicePDF(invoice: {
  invoice_number: string;
  student_name: string;
  student_id: string;
  description: string;
  amount: number;
  issue_date: string;
  due_date: string;
  is_paid: boolean;
  paid_at?: string | null;
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();

  drawHeader(doc, "Invoice");

  // Invoice meta box
  let y = 46;
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pw - 28, 38, 1, 1, "F");

  drawInfoRow(doc, 18, y + 8, "Invoice No", invoice.invoice_number);
  drawInfoRow(doc, 18, y + 15, "Student", invoice.student_name);
  drawInfoRow(doc, 18, y + 22, "Student ID", invoice.student_id);
  drawInfoRow(doc, 18, y + 29, "Issue Date", invoice.issue_date);

  const halfW = (pw - 28) / 2;
  drawInfoRow(doc, 18 + halfW, y + 8, "Due Date", invoice.due_date);
  drawInfoRow(doc, 18 + halfW, y + 15, "Status",
    invoice.is_paid ? `PAID${invoice.paid_at ? " — " + invoice.paid_at : ""}` : "UNPAID");

  y += 46;

  // Amount block
  doc.setFillColor(...CHARCOAL);
  doc.roundedRect(14, y, pw - 28, 22, 1, 1, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Description", 20, y + 8);
  doc.text("Amount", pw - 20, y + 8, { align: "right" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(18, y + 11, pw - 18, y + 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.description, 20, y + 18);
  doc.setTextColor(...GOLD);
  doc.setFontSize(11);
  doc.text(`\u09F3${invoice.amount.toLocaleString()}`, pw - 20, y + 18, { align: "right" });

  y += 30;

  // Status badge
  if (invoice.is_paid) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(14, y, 28, 8, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("PAID", 28, y + 5.5, { align: "center" });
  } else {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(14, y, 28, 8, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("UNPAID", 28, y + 5.5, { align: "center" });
  }

  y += 20;

  // Note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Please retain this invoice for your records. For queries contact +880 1925-242188.", 14, y);

  y += 14;
  drawSignatureBlock(doc, y);

  drawFooter(doc, 1, 1);
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
}

/**
 * Generate a single result slip PDF.
 */
export function generateResultPDF(result: {
  student_name: string;
  student_id: string;
  exam_name: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  exam_date: string;
  remarks?: string | null;
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();

  drawHeader(doc, "Result Slip");

  let y = 46;

  // Student info box
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pw - 28, 30, 1, 1, "F");
  drawInfoRow(doc, 18, y + 8, "Student", result.student_name);
  drawInfoRow(doc, 18, y + 15, "Student ID", result.student_id);
  drawInfoRow(doc, 18, y + 22, "Exam Date", result.exam_date);
  const halfW = (pw - 28) / 2;
  drawInfoRow(doc, 18 + halfW, y + 8, "Exam", result.exam_name);

  y += 38;

  // Score display
  doc.setFillColor(...CHARCOAL);
  doc.roundedRect(14, y, pw - 28, 36, 1, 1, "F");

  // Marks
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("MARKS OBTAINED", pw / 2, y + 10, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...GOLD);
  doc.text(`${result.obtained_marks}`, pw / 2 - 10, y + 28, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(180, 180, 180);
  doc.text(`/ ${result.total_marks}`, pw / 2 - 8, y + 28);

  // Percentage
  const grade = getGradeLabel(result.percentage);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text(`${result.percentage}%  —  ${grade}`, pw - 20, y + 28, { align: "right" });

  y += 44;

  // Progress bar
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, pw - 28, 6, 2, 2, "F");
  const barW = ((pw - 28) * result.percentage) / 100;
  doc.setFillColor(...GOLD);
  doc.roundedRect(14, y, barW, 6, 2, 2, "F");

  y += 14;

  // Remarks
  if (result.remarks) {
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(14, y, pw - 28, 18, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Remarks:", 18, y + 7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...CHARCOAL);
    const lines = doc.splitTextToSize(result.remarks, pw - 44);
    doc.text(lines, 18, y + 14);
    y += 26;
  }

  y += 6;
  drawSignatureBlock(doc, y);

  drawFooter(doc, 1, 1);
  doc.save(`Result-${result.student_id}-${result.exam_name.replace(/\s+/g, "-")}.pdf`);
}

/**
 * Generate a monthly exam report PDF for admin — all students, one exam.
 */
export function generateMonthlyReportPDF(results: Array<{
  student_name: string;
  student_id: string;
  exam_name: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  exam_date: string;
  remarks?: string | null;
}>, reportTitle: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();

  drawHeader(doc, "Exam Report");

  let y = 46;

  // Report title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...CHARCOAL);
  doc.text(reportTitle, pw / 2, y + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Total students: ${results.length}  |  Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, pw / 2, y + 13, { align: "center" });

  y += 20;

  // Summary stats
  if (results.length > 0) {
    const avg = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);
    const highest = Math.max(...results.map((r) => r.percentage));
    const passed = results.filter((r) => r.percentage >= 50).length;

    doc.setFillColor(...CHARCOAL);
    doc.roundedRect(14, y, pw - 28, 18, 1, 1, "F");
    const statW = (pw - 28) / 3;
    [
      { label: "Average Score", value: `${avg}%` },
      { label: "Highest Score", value: `${highest}%` },
      { label: "Pass Rate", value: `${Math.round((passed / results.length) * 100)}%` },
    ].forEach(({ label, value }, i) => {
      const cx = 14 + statW * i + statW / 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...GOLD);
      doc.text(value, cx, y + 10, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(180, 180, 180);
      doc.text(label, cx, y + 15.5, { align: "center" });
    });

    y += 24;
  }

  // Results table
  autoTable(doc, {
    startY: y,
    head: [["#", "Student", "ID", "Obtained", "Total", "%", "Grade", "Remarks"]],
    body: results.map((r, i) => [
      i + 1,
      r.student_name,
      r.student_id,
      r.obtained_marks,
      r.total_marks,
      `${r.percentage}%`,
      getGradeLabel(r.percentage),
      r.remarks || "—",
    ]),
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: CHARCOAL,
      lineColor: [220, 215, 205],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: CHARCOAL,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [250, 248, 244] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 38 },
      2: { cellWidth: 22 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      drawFooter(doc, data.pageNumber, pageCount);
    },
  });

  // Signature block on last page
  const finalY = (doc as any).lastAutoTable.finalY + 14;
  const ph = doc.internal.pageSize.getHeight();
  if (finalY + 40 < ph - 20) {
    drawSignatureBlock(doc, finalY);
  } else {
    doc.addPage();
    drawHeader(doc, "Exam Report");
    drawSignatureBlock(doc, 50);
    const pageCount = (doc as any).internal.getNumberOfPages();
    drawFooter(doc, pageCount, pageCount);
  }

  doc.save(`Report-${reportTitle.replace(/\s+/g, "-")}.pdf`);
}

function getGradeLabel(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}
