"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, use } from "react";
import Webcam from "react-webcam";

function Interview({ params }) {
  const unwrappedParams = use(params);
  const interviewId = unwrappedParams?.interviewId;

  const [interviewDetails, setInterviewDetails] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    if (interviewId) {
      GetInterviewDetails();
    }
  }, [interviewId]);

  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId));

      if (result.length > 0) {
        setInterviewDetails(result[0]);
      } else {
        console.warn("No interview details found.");
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
    }
  };

  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col my-5 gap-5 p-5 rounded-lg border">
          <div className="flex flex-col p-5 my-5 gap-5">
            {interviewDetails ? (
              <>
                <h2 className="text-lg">
                  <strong>Job Role/Job Position: </strong>
                  {interviewDetails.jobPosition}
                </h2>
                <h2 className="text-lg">
                  <strong>Job Description/Tech Stack: </strong>
                  {interviewDetails.jobDesc}
                </h2>
                <h2 className="text-lg">
                  <strong>Years of Experience: </strong>
                  {interviewDetails.jobExp}
                </h2>
              </>
            ) : (
              <p>Loading interview details...</p>
            )}
          </div>
          <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-500">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>
        <div>
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              style={{ height: 300, width: 300 }}
            />
          ) : (
            <>
              <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
              <Button
                variant="ghost"
                className="bg-[#0A717C] text-white w-full"
                onClick={() => setWebCamEnabled(true)}
              >
                Enable Web Cam and Microphone
              </Button>
            </>
          )}
        </div>
        <div className="flex justify-end items-end ">
          <Link
            href={
              "/dashboard/interview/" + unwrappedParams.interviewId + "/start"
            }
          >
            <Button className="bg-[#0A717C]">Start Interview</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Interview;
