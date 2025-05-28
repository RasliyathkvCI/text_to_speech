
import React, { useState, useEffect } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import "./with_react_speech_kit.css";

function With_react_speech_kit() {
 const [value, setValue] = React.useState("");
    const { speak } = useSpeechSynthesis();
    return (
        <div className="speech">
            <div className="group">
               <h1 className="title">🗣️ React Speech Kit - Text to Speech</h1>
            </div>
            <div className="group">
                <textarea
                    rows="10"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                ></textarea>
            </div>
            <div className="group">
                <button onClick={() => speak({ text: value })}>
                    Speech
                </button>
            </div>
        </div>
    );
}

export default With_react_speech_kit;

