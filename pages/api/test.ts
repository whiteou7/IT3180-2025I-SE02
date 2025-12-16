// pages/api/test-pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
import PdfPrinter from "pdfmake";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const fonts = {
    Roboto: {
      normal: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"),
      bold: path.join(process.cwd(), "public/fonts/Roboto-Medium.ttf"),
      italics: path.join(process.cwd(), "public/fonts/Roboto-Italic.ttf"),
      bolditalics: path.join(process.cwd(), "public/fonts/Roboto-MediumItalic.ttf"),
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      { text: "PDFMAKE TEST", fontSize: 18, bold: true },
      { text: "Hello from Next.js API route" },
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=test.pdf");

  pdfDoc.pipe(res);
  pdfDoc.end();
}
