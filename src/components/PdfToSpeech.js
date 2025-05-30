import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "./pdf_to_speech.css";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.js",
  import.meta.url
).toString();

export default function PdfViewer() {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageText, setPageText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file?.type !== "application/pdf") return;

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const loadedPdf = await pdfjsLib.getDocument({ data: typedArray })
        .promise;
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1); // start with page 1
    };
    fileReader.readAsArrayBuffer(file);
  };

  // Render current page
  useEffect(() => {
    const renderCurrentPage = async () => {
      if (!pdf || !canvasRef.current) return;
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      // Extract text for current page
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item) => item.str).join(" ");
      setPageText(text);
    };

    renderCurrentPage();
  }, [pdf, currentPage]);

  const speakText = () => {
    if (!pageText) return;
    const utterance = new SpeechSynthesisUtterance(pageText);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const goToPage = (newPage) => {
    stopSpeech(); // stop speaking when navigating
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="pdf-viewer">
      <h1 className="title">📄 Web Speech API - pdf content to Speech</h1>

      <label htmlFor="pdf-upload-1" className="formal-upload-label">
        Select PDF File
      </label>
      <input
        id="pdf-upload-1"
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

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
              ◀️ Previous
            </button>

            <span>
              Page {currentPage} of {numPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === numPages}
            >
              Next ▶️
            </button>
          </div>

          <div className="speak-controls">
            <button
              className="speak-btn"
              onClick={speakText}
              disabled={isSpeaking}
            >
              🔊 Speak This Page
            </button>

            {isSpeaking && (
              <button className="stop-btn" onClick={stopSpeech}>
                🛑 Stop
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
