import React, { useEffect, useState } from "react";
import "./with_web_speech_API.css"; // Import the CSS file

function With_web_speech_API() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0]);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  const speak = () => {
    if (text !== "") {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  const pause = () => {
    window.speechSynthesis.pause();
  };

  const resume = () => {
    window.speechSynthesis.resume();
  };

  const cancel = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="container">
      <h1 className="title">🗣️ Web Speech API - Text to Speech App</h1>
      <textarea
        className="textarea"
        rows="5"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select
        className="select"
        onChange={(e) =>
          setSelectedVoice(voices.find((v) => v.name === e.target.value))
        }
        value={selectedVoice?.name}
      >
        {voices.map((voice, index) => (
          <option key={index} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
      <div className="button-group">
        <button className="button blue" onClick={speak} disabled={isSpeaking}>
          Speak
        </button>
        <button className="button yellow" onClick={pause}>
          Pause
        </button>
        <button className="button green" onClick={resume}>
          Resume
        </button>
        <button className="button red" onClick={cancel}>
          Stop
        </button>
      </div>
    </div>
  );
}

export default With_web_speech_API;