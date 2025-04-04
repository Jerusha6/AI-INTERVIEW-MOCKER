"use client";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import dynamic from "next/dynamic";

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic(() => import("react-webcam"), { ssr: false });

function RecordAnswerSection() {
  const [userAnswer, setUserAnswer] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    results.map((result) =>
      setUserAnswer((prevAns) => prevAns + result?.transcript)
    );
  }, [results]);

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          alt="webcam"
          className="absolute"
        />
        {isClient && ( // Render Webcam only on the client
          <Webcam
            mirrored={true}
            style={{
              height: 300,
              width: "100%",
              zIndex: 10,
            }}
          />
        )}
      </div>
      <Button
        variant="outline"
        className="my-10 "
        onClick={isRecording ? stopSpeechToText : startSpeechToText}
      >
        {isRecording ? (
          <h2 className="text-red-600 flex gap-2">
            <Mic />
            Stop Recording
          </h2>
        ) : (
          "Record Answer"
        )}
      </Button>
      <Button
        className="bg-[#0A717C] text-white"
        onClick={() => console.log(userAnswer)}
      >
        Show User Answer
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
