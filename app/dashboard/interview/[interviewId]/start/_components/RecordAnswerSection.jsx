"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const TIME_LIMIT = 60; // 60 seconds time limit

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    error,
    isRecording,
    results,
    startSpeechToText,
    setResults,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: false,
    useLegacyResults: false,
  });

  // Handle speech recognition results
  useEffect(() => {
    if (results && results.length > 0) {
      setUserAnswer(results.map((result) => result.transcript).join(" "));
    }
  }, [results]);

  // Handle recording stop and answer submission
  useEffect(() => {
    if (!isRecording && userAnswer && userAnswer.length > 10 && !isProcessing) {
      handleAnswerSubmission();
    }
  }, [isRecording, userAnswer, isProcessing]);

  // Handle speech recognition errors
  useEffect(() => {
    if (error) {
      toast.error("Speech recognition error: " + error.message);
    }
  }, [error]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);

  const startTimer = useCallback(() => {
    setTimeLeft(TIME_LIMIT);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (isRecording) {
            stopRecording();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setRecordingTimer(timer);
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    stopSpeechToText();
  }, [recordingTimer, stopSpeechToText]);

  const handleAnswerSubmission = useCallback(async () => {
    if (!userAnswer || isProcessing) return;

    setIsProcessing(true);
    setLoading(true);

    try {
      const currentQuestion =
        mockInterviewQuestion && mockInterviewQuestion[activeQuestionIndex];
      if (!currentQuestion) {
        throw new Error("No question found");
      }

      const feedBackPrompt = `Question: ${currentQuestion.question}, 
        User Answer: ${userAnswer}
        Please provide a rating and feedback for this answer in JSON format with 'rating' and 'feedback' fields.`;

      let feedbackResp = {
        rating: 0,
        feedback: "Feedback service unavailable",
      };

      try {
        const result = await chatSession.sendMessage(feedBackPrompt);
        const responseText = result.response.text();
        const cleanedResponse = responseText.replace(/```json|```/g, "");
        feedbackResp = JSON.parse(cleanedResponse);
        setServiceAvailable(true);
      } catch (err) {
        console.error("API Error:", err);
        if (err.message.includes("quota") || err.message.includes("429")) {
          setServiceAvailable(false);
          toast.error(
            "Our feedback service is currently at capacity. Your answer has been saved, but feedback will be added later."
          );
        } else {
          throw err;
        }
      }

      if (!interviewData?.mockId) {
        throw new Error("Missing interview data");
      }

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: currentQuestion.question,
        correctAns: currentQuestion.answer,
        userAns: userAnswer,
        feedback: feedbackResp.feedback,
        rating: feedbackResp.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress || "no-email",
        createdAt: moment().format("DD-MM-YYYY"),
      });

      toast.success("Your answer has been recorded successfully");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to process your answer. Please try again later.");
    } finally {
      setUserAnswer("");
      setLoading(false);
      setIsProcessing(false);
      setTimeLeft(0);
    }
  }, [
    userAnswer,
    activeQuestionIndex,
    interviewData,
    user,
    mockInterviewQuestion,
    isProcessing,
  ]);

  const toggleRecording = useCallback(() => {
    if (isProcessing) return;

    if (isRecording) {
      stopRecording();
    } else {
      setUserAnswer("");
      startSpeechToText();
      startTimer();
    }
  }, [isProcessing, isRecording, startSpeechToText, stopRecording, startTimer]);

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

      <Button
        disabled={loading || isProcessing || !serviceAvailable}
        variant="outline"
        className="my-10"
        onClick={toggleRecording}
      >
        {isRecording ? (
          <span className="text-red-600 flex gap-2">
            <StopCircle className="animate-pulse" />
            Stop Recording ({timeLeft}s)
          </span>
        ) : (
          <span className="flex gap-2">
            <Mic />
            Record Answer ({TIME_LIMIT}s limit)
          </span>
        )}
      </Button>

      {!serviceAvailable && (
        <p className="text-sm text-yellow-600 mt-2">
          Note: Feedback generation is temporarily unavailable
        </p>
      )}

      {(loading || isProcessing) && (
        <p className="text-sm text-muted-foreground">
          Processing your answer...
        </p>
      )}
    </div>
  );
}

export default RecordAnswerSection;
