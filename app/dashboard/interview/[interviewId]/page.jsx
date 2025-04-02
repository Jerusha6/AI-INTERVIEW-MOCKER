"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { WebcamIcon } from "lucide-react";
import React, { useEffect, useState, use } from "react";
import Webcam from "react-webcam";

function Interview({ params }) {
  const unwrappedParams = use(params); // ✅ Correctly unwrapping the Promise
  const interviewId = unwrappedParams?.interviewId; // Ensure it's defined before use

  const [interviewDetails, setInterviewDetails] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    if (interviewId) {
      GetInterviewDetails();
    }
  }, [interviewId]); // ✅ Ensures function runs only when interviewId is available

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
    <div className="my-10 flex justify-center flex-col items-center">
      <h2 className="font-bold text-2xl">Let's Get Started</h2>
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
              className="bg-[#0A717C]"
              onClick={() => setWebCamEnabled(true)}
            >
              Enable Web Cam and Microphone
            </Button>
          </>
        )}
      </div>
      <div>
        {interviewDetails ? (
          <h2>
            <strong>Job Role/Job Position:</strong>{" "}
            {interviewDetails.jobPosition}
          </h2>
        ) : (
          <p>Loading interview details...</p>
        )}
      </div>
    </div>
  );
}

export default Interview;
