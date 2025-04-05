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

// 2.45.50

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

      const result = await chatSession.sendMessage(feedBackPrompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json|```/g, "");

      let feedbackResp;
      try {
        feedbackResp = JSON.parse(cleanedResponse);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        feedbackResp = { rating: 0, feedback: "Could not parse feedback" };
      }

      if (!interviewData?.mockId) {
        throw new Error("Missing interview data");
      }

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: currentQuestion.question,
        correctAns: currentQuestion.answer,
        userAns: userAnswer,
        feedback: feedbackResp.feedback || "No feedback provided",
        rating: feedbackResp.rating || 0,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdBy: moment().format("DD-MM-YYYY"),
      });

      toast.success("Your answer has been recorded successfully");
      setUserAnswer("");
      setResults([]);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to process your answer, Please try again");
    } finally {
      setUserAnswer("");
      setLoading(false);
      setIsProcessing(false);
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
      stopSpeechToText();
    } else {
      setUserAnswer("");
      startSpeechToText();
    }
  }, [isProcessing, isRecording, startSpeechToText, stopSpeechToText]);

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
        disabled={loading || isProcessing}
        variant="outline"
        className="my-10"
        onClick={toggleRecording}
      >
        {isRecording ? (
          <span className="text-red-600 flex gap-2">
            <StopCircle className="animate-pulse" />
            Stop Recording
          </span>
        ) : (
          <span className="flex gap-2">
            <Mic />
            Record Answer
          </span>
        )}
      </Button>

      {(loading || isProcessing) && (
        <p className="text-sm text-muted-foreground">
          Processing your answer...
        </p>
      )}
    </div>
  );
}

export default RecordAnswerSection;
