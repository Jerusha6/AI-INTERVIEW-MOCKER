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

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExp, setJobExp] = useState();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExp);
    const questionCount = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT;

    const InputPrompt =
      "Job Position: " +
      jobPosition +
      ", Job Description: " +
      jobDesc +
      ",Years of Experience: " +
      jobExp +
      ", Depends on this information please give me " +
      questionCount +
      " Interview question with Answered in Json Format, Give Question and Answered as field in JSON";

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const textResponse = await result.response
        .text()
        .replace("```json", "")
        .replace("```", "");
      console.log(JSON.parse(textResponse));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching interview questions:", error);
    }
  };

  return (
    <div>
      <div
        className="p-10 border round-lg bg-secondary
       hover:scale-105 hover:shadow-md cursor-pointer 
       transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add details about your job position/role, Job description and years of experience</h2>
                  <div className="mt-7 my-3">
                    <label>Job Role/Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className="mt-7 my-3">
                    <label>Job Description/Tech Stack(In short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJs, MySQL etc."
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>
                  <div className="mt-7 my-3">
                    <label>Years of Experience</label>
                    <Input
                      placeholder="Ex.5"
                      type="number"
                      max={100}
                      required
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
                  <Button
                    type="submit"
                    className="bg-[#0A717C]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin"/>
                        Generating from AI
                      </>
                    ) : (
                      'Start Interview'
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
