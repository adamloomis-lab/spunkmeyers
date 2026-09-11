// Generates a clean, printable PDF of the full menu, built live from the same
// `menuData` the Menu page renders. Nothing here is a separate copy of the
// menu that can drift out of sync: change a price on the page and the PDF
// picks it up the next time someone taps Download.
import { jsPDF } from "jspdf";
import { BUSINESS } from "@/lib/constants";

export interface PdfMenuItem {
  name: string;
  price: string;
  desc: string;
  gf?: boolean;
  spx?: boolean;
  topSeller?: boolean;
}

export interface PdfMenuCategory {
  id: string;
  label: string;
  note?: string;
  items: PdfMenuItem[];
}

const ORANGE: [number, number, number] = [232, 96, 28];
const INK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [110, 110, 110];

const PAGE_W = 612; // 8.5in letter, in points
const PAGE_H = 792; // 11in
const MARGIN = 46;
const CONTENT_W = PAGE_W - MARGIN * 2;
const COL_GAP = 20;
const COL_W = (CONTENT_W - COL_GAP) / 2;

export function buildMenuPdf(menuData: PdfMenuCategory[]): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  let col = 0; // 0 = left column, 1 = right column
  let y = MARGIN;
  let colX = MARGIN;

  const drawFooter = () => {
    const page = doc.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `${BUSINESS.name} · ${BUSINESS.address} · ${BUSINESS.phone}`,
      MARGIN,
      PAGE_H - 24
    );
    doc.text(String(page), PAGE_W - MARGIN, PAGE_H - 24, { align: "right" });
  };

  const newPage = () => {
    doc.addPage();
    col = 0;
    colX = MARGIN;
    y = MARGIN;
    drawFooter();
  };

  const switchColumn = () => {
    if (col === 0) {
      col = 1;
      colX = MARGIN + COL_W + COL_GAP;
      y = headerBottom;
    } else {
      newPage();
    }
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN - 20) switchColumn();
  };

  // ---- Cover header ----
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_W, 150, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text(BUSINESS.name, MARGIN, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(230, 230, 230);
  doc.text(`${BUSINESS.address}  ·  ${BUSINESS.phone}`, MARGIN, 100);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ORANGE);
  doc.text("FULL MENU", MARGIN, 128);

  const headerBottom = 178;
  y = headerBottom;
  drawFooter();

  const wrap = (text: string, width: number, size: number) => {
    doc.setFontSize(size);
    return doc.splitTextToSize(text, width) as string[];
  };

  for (const category of menuData) {
    // Category heading
    ensureSpace(34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...ORANGE);
    doc.text(category.label.toUpperCase(), colX, y);
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(1);
    doc.line(colX, y + 5, colX + COL_W, y + 5);
    y += 20;

    if (category.note) {
      const lines = wrap(category.note, COL_W, 8);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      for (const line of lines) {
        ensureSpace(11);
        doc.text(line, colX, y);
        y += 11;
      }
      y += 4;
    }

    // Sauces & rubs render as a compact tag grid; everything else as a list.
    if (category.id === "sauces") {
      const tagH = 16;
      let tx = colX;
      for (const item of category.items) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        const label = item.spx ? `${item.name}  [SPX]` : item.name;
        const w = doc.getTextWidth(label) + 12;
        if (tx + w > colX + COL_W) {
          tx = colX;
          y += tagH;
          ensureSpace(tagH);
        }
        ensureSpace(tagH);
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(tx, y - 10, w, 14, 2, 2, "S");
        doc.setTextColor(...INK);
        doc.text(label, tx + 6, y);
        tx += w + 4;
      }
      y += tagH + 6;
      continue;
    }

    for (const item of category.items) {
      const badges = [
        item.topSeller ? "TOP SELLER" : null,
        item.gf ? "GF" : null,
        item.spx ? "SPX" : null,
      ].filter(Boolean) as string[];
      const nameLine = badges.length
        ? `${item.name}  (${badges.join(", ")})`
        : item.name;

      const nameLines = wrap(nameLine, COL_W - 60, 10);
      const descLines = item.desc ? wrap(item.desc, COL_W, 8) : [];
      const blockH = nameLines.length * 12 + descLines.length * 10 + 8;
      ensureSpace(blockH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      nameLines.forEach((line: string, i: number) => {
        doc.text(line, colX, y + i * 12);
      });
      if (item.price) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...ORANGE);
        doc.text(item.price, colX + COL_W, y, { align: "right" });
      }
      y += nameLines.length * 12 + 2;

      if (descLines.length) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        descLines.forEach((line: string, i: number) => {
          doc.text(line, colX, y + i * 10);
        });
        y += descLines.length * 10;
      }
      y += 8;
    }
    y += 6;
  }

  // Legend, bottom of wherever we ended up
  ensureSpace(30);
  doc.setDrawColor(220, 220, 220);
  doc.line(colX, y, colX + COL_W, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("GF = Gluten Sensitive   ·   SPX = Spunkmeyers Original", colX, y);

  return doc;
}

export function downloadMenuPdf(menuData: PdfMenuCategory[]) {
  buildMenuPdf(menuData).save("spunkmeyers-pub-menu.pdf");
}
