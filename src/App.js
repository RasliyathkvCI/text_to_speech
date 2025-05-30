
import React, { useState, useEffect } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import "./App.css";
import With_react_speech_kit from "./components/with_react_speech_kit";
import With_web_speech_API from "./components/with_web_speech_API";
import PdfToSpeech from "./components/PdfToSpeech";

function App() {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const {  voices, supported } = useSpeechSynthesis({
    voice: selectedVoice,
  });

  useEffect(() => {
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  }, [voices]);
  return (
    <div className="container">
      <h2 className="title">Text To Speech Converter Using React Js</h2>   
      {!supported ? (
        <p>Your browser does not support speech synthesis.</p>
      ) : (
        <>
        <With_react_speech_kit />         
        <With_web_speech_API />
        </>
      )}
       <h2 className="title">Pdf Text To Speech Converter Using React Js</h2>
       <PdfToSpeech />
    </div>
  );
}

export default App;

