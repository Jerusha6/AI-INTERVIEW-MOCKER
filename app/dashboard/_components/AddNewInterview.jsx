"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExp, setJobExp] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!jobPosition || !jobDesc || !jobExp) {
      alert("Please fill out all fields.");
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      alert("User email not available. Please sign in properly.");
      return;
    }

    setLoading(true);

    const questionCount = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5;
    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExp}. Based on this information, please generate ${questionCount} interview questions with answers in valid JSON format. Only return the JSON object, without any markdown formatting or additional text.`;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const textResponse = await result.response.text();

      // More robust response cleaning
      let cleanedResponse = textResponse.trim();

      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.substring(7);
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.substring(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.substring(
          0,
          cleanedResponse.length - 3
        );
      }

      cleanedResponse = cleanedResponse.trim();

      // Parse to validate JSON
      const parsedResponse = JSON.parse(cleanedResponse);

      // Validate the response structure
      if (
        !Array.isArray(parsedResponse) &&
        typeof parsedResponse !== "object"
      ) {
        throw new Error("Invalid response format from AI");
      }

      // Insert into database
      const insertedRecord = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(parsedResponse), // Store stringified JSON
          jobPosition,
          jobDesc,
          jobExp,
          createdBy: user.primaryEmailAddress.emailAddress,
          createdAt: moment().format("DD-MM-YYYY"),
        })
        .returning();

      if (!insertedRecord || !insertedRecord[0]?.mockId) {
        throw new Error("Failed to insert record into database");
      }

      router.push("/dashboard/interview/" + insertedRecord[0].mockId);
    } catch (error) {
      console.error("Detailed Error:", {
        error: error.message,
        stack: error.stack,
      });
      alert(
        `Error: ${error.message}. Please check the console for more details.`
      );
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };
  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job interview
            </DialogTitle>

            {/* move h2 outside of DialogDescription */}
            <p className="text-muted-foreground text-sm">
              Add details about the job position, description, and years of
              experience
            </p>
          </DialogHeader>

          {/* move form outside of DialogDescription */}
          <form onSubmit={onSubmit}>
            <div>
              <div className="mt-7 my-3">
                <label>Job Role/Job Position</label>
                <Input
                  placeholder="Ex. Full Stack Developer"
                  required
                  value={jobPosition}
                  onChange={(event) => setJobPosition(event.target.value)}
                />
              </div>
              <div className="mt-7 my-3">
                <label>Job Description/Tech Stack (In short)</label>
                <Textarea
                  placeholder="Ex. React, Angular, NodeJs, MySQL, etc."
                  required
                  value={jobDesc}
                  onChange={(event) => setJobDesc(event.target.value)}
                />
              </div>
              <div className="mt-7 my-3">
                <label>Years of Experience</label>
                <Input
                  placeholder="Ex. 5"
                  type="number"
                  max={100}
                  required
                  value={jobExp}
                  onChange={(event) => setJobExp(event.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-5 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0A717C]" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Generating from AI
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
