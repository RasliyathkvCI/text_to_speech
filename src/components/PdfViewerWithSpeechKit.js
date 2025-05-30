// PdfViewerWithSpeechKit.js
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { useSpeechSynthesis } from "react-speech-kit";
import "./pdf_to_speech.css";

/* ---------- 1. Set up the pdf.js worker ---------- */
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.js",
  import.meta.url
).toString();

export default function PdfViewerWithSpeechKit() {
  /* ---------- 2. PDF state ---------- */
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageText, setPageText] = useState("");

  /* ---------- 3. Canvas ref ---------- */
  const canvasRef = useRef(null);

  /* ---------- 4. react-speech-kit ---------- */
  const { speak, cancel, speaking, voices } = useSpeechSynthesis({
    onEnd: () => {
      /* this fires when speech finishes naturally */
    },
  });
  const [selectedVoice, setSelectedVoice] = useState(null);

  /* Pick the first voice once they load */
  useEffect(() => {
    if (voices.length && !selectedVoice) {
      setSelectedVoice(voices[0]);
    }
  }, [voices, selectedVoice]);

  /* ---------- 5. Upload handler ---------- */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const loadedPdf = await pdfjsLib.getDocument({ data: typedArray })
        .promise;
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1);
    };
    reader.readAsArrayBuffer(file);
  };

  /* ---------- 6. Render & extract current page ---------- */
  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      /* Grab text for speech */
      const textContent = await page.getTextContent();
      const text = textContent.items.map((it) => it.str).join(" ");
      setPageText(text);
    };

    renderPage();
    cancel(); // stop any speech when page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, currentPage]);

  /* ---------- 7. Navigation ---------- */
  const goToPage = (n) => {
    if (n >= 1 && n <= numPages) setCurrentPage(n);
  };

  /* ---------- 8. Speak helpers ---------- */
  const speakCurrentPage = () => {
    if (pageText) {
      speak({
        text: pageText,
        voice: selectedVoice ?? undefined,
      });
    }
  };

  return (
    <div className="pdf-viewer">
      <h1 className="title">📄 React Speech Kit - pdf content to Speech</h1>

      <label htmlFor="pdf-upload-2" className="formal-upload-label">
        Select PDF File
      </label>
      <input
        id="pdf-upload-2"
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {voices.length > 0 && (
        <select
          className="voice-select"
          value={selectedVoice?.name}
          onChange={(e) =>
            setSelectedVoice(voices.find((v) => v.name === e.target.value))
          }
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      )}

      {pdf && (
        <>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>

          <div className="controls">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀️ Prev
            </button>
            <span>
              Page {currentPage} / {numPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === numPages}
            >
              Next ▶️
            </button>
          </div>

          <div className="speak-controls">
            <button onClick={speakCurrentPage} disabled={speaking || !pageText}>
              🔊 Speak This Page
            </button>
            {speaking && (
              <button onClick={cancel} className="stop-btn">
                🛑 Stop
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
