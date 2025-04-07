"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const { error, results, startSpeechToText, stopSpeechToText } =
    useSpeechToText({
      continuous: true,
      useLegacyResults: false,
    });

  useEffect(() => {
    if (results && results.length > 0) {
      setUserAnswer(results.map((result) => result.transcript).join(" "));
    }
  }, [results]);

  useEffect(() => {
    if (error) {
      console.error("Speech recognition error:", error);
    }
  }, [error]);

  const startTimer = () => {
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    stopSpeechToText();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const handleAnswerSubmission = async () => {
    if (!userAnswer) return;

    setLoading(true);

    try {
      const currentQuestion = mockInterviewQuestion[activeQuestionIndex];
      if (!currentQuestion) return;

      const feedBackPrompt = `Question: ${currentQuestion.question}, 
        User Answer: ${userAnswer}
        Provide a rating and feedback in JSON with 'rating' and 'feedback' fields.`;

      const result = await chatSession.sendMessage(feedBackPrompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json|```/g, "");

      let feedbackResp;
      try {
        feedbackResp = JSON.parse(cleanedResponse);
      } catch (e) {
        feedbackResp = { rating: 0, feedback: "Could not parse feedback" };
      }

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: currentQuestion.question,
        correctAns: currentQuestion.answer,
        userAns: userAnswer,
        feedback: feedbackResp.feedback,
        rating: feedbackResp.rating,
        userEmail: user.primaryEmailAddress.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      });

      toast.success("Answer recorded");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUserAnswer("");
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (loading) return;

    if (isRecording) {
      stopRecording();
      if (userAnswer) {
        handleAnswerSubmission();
      }
    } else {
      setUserAnswer("");
      startSpeechToText();
      setIsRecording(true);
      startTimer();
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5 relative">
        <Image
          src="/webcam.png"
          width={200}
          height={200}
          alt="webcam placeholder"
          className="absolute"
          priority
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>

      {isRecording && (
        <div className="my-4 text-lg font-medium">Time remaining: {timer}s</div>
      )}

      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={toggleRecording}
      >
        {isRecording ? (
          <span className="text-red-600 flex gap-2">
            <Mic className="animate-pulse" />
            Stop Recording
          </span>
        ) : (
          "Record Answer"
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
