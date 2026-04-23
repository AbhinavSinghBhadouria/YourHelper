const { createWorker } = require("tesseract.js");
const { createCanvas } = require("@napi-rs/canvas");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

/**
 * OCR a PDF buffer by rendering the first N pages to images.
 * Designed for Node (no pdf.js workerSrc required).
 */
async function ocrPdfBuffer(pdfBuffer, { maxPages = 2, scale = 2 } = {}) {
  // Some Node canvas/polyfill libraries define Path2D globally, which can break pdf.js rendering
  // with @napi-rs/canvas. Force pdf.js to use its internal path implementation.
  try { delete global.Path2D; } catch {}

  // pdfjs-dist is ESM; use the legacy build which works well in Node without workerSrc.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Important: copy Buffer bytes into a fresh Uint8Array.
  // pdf.js may detach the underlying ArrayBuffer during parsing, which can break shared views.
  const data = Buffer.isBuffer(pdfBuffer)
    ? Uint8Array.from(pdfBuffer)
    : pdfBuffer instanceof Uint8Array
        ? pdfBuffer
        : new Uint8Array(pdfBuffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  const pageCount = Math.min(pdf.numPages || 0, maxPages);
  if (pageCount <= 0) return "";

  // tesseract.js v7 (Node): create worker with language upfront.
  // Note: loadLanguage/initialize are not available in v7.
  const worker = await createWorker("eng");
  try {
    let fullText = "";

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      console.log(`OCR: Processing page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = canvas.getContext("2d");

      console.log(`OCR: Rendering page ${pageNum} to canvas...`);
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      console.log(`OCR: Running Tesseract on page ${pageNum}...`);
      // In Node, passing a file path is the most reliable input type for tesseract.js worker.
      const imageBuffer = canvas.toBuffer("image/png");
      const tmpPath = path.join(
        os.tmpdir(),
        `yourhelper-ocr-${crypto.randomBytes(8).toString("hex")}-p${pageNum}.png`
      );
      fs.writeFileSync(tmpPath, imageBuffer);
      let data;
      try {
        ({ data } = await worker.recognize(tmpPath));
      } finally {
        try { fs.unlinkSync(tmpPath); } catch {}
      }
      const pageText = (data?.text || "").trim();
      console.log(`OCR: Page ${pageNum} extraction complete (${pageText.length} chars).`);
      
      if (pageText) {
        fullText += (fullText ? "\n\n" : "") + pageText;
      }
    }

    console.log(`OCR Complete. Total text length: ${fullText.length}`);
    return fullText.trim();
  } catch (ocrError) {
    // Bubble up so caller can show a meaningful error message.
    throw ocrError;
  } finally {
    await worker.terminate();
  }
}

module.exports = { ocrPdfBuffer };


