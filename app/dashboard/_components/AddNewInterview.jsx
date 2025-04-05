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
    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExp}. Based on this information, please generate ${questionCount} interview questions with answers in JSON format.`;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const textResponse = await result.response.text();
      const formattedResponse = textResponse
        .replace("```json", "")
        .replace("```", "");

      // Parse to validate it's proper JSON before storing
      JSON.parse(formattedResponse);

      // Insert into database and get the inserted record
      const insertedRecord = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: formattedResponse,
          jobPosition,
          jobDesc,
          jobExp,
          createdBy: user.primaryEmailAddress.emailAddress,
          createdAt: moment().format("DD-MM-YYYY"),
        })
        .returning(); // Add .returning() to get the inserted record

      console.log("Inserted record:", insertedRecord);

      if (insertedRecord && insertedRecord[0]?.mockId) {
        router.push("/dashboard/interview/" + insertedRecord[0].mockId);
      } else {
        throw new Error("Could not fetch interview ID after insertion");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
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
