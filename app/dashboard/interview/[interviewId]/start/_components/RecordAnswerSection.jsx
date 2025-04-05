"use client";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import moment from "moment";

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic(() => import("react-webcam"), { ssr: false });

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

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
  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdatedUserAnswer();
    }
  }, [userAnswer,isRecording]);
  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      setUserAnswer("");
      startSpeechToText();
    }
  };

  const UpdatedUserAnswer = async () => {
    console.log(userAnswer);
    setLoading(true);
    const feedBackPrompt =
      "Question:" +
      mockInterviewQuestion[activeQuestionIndex]?.question +
      ", User Answer:" +
      userAnswer +
      "Depends on question and user answer for given interview question" +
      "Kindly provide a rating for the answer and share any feedback or suggestions for improvement, if any" +
      "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

    const result = await chatSession.sendMessage(feedBackPrompt);
    const mockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(mockJsonResp);
    const JsonFeedbackResp = JSON.parse(mockJsonResp);

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: JsonFeedbackResp?.feedback,
      rating: JsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdBy: moment().format("DD-MM-YYYY"),
    });
    if (resp) {
      toast("User Answer recorded successfully");
    }
    setUserAnswer("");
    setLoading(false);
  };

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
        disabled={loading}
        variant="outline"
        className="my-10 "
        onClick={StartStopRecording}
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
    </div>
  );
}

export default RecordAnswerSection;
