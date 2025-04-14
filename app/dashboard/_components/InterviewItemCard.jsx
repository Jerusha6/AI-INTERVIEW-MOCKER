import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

function InterviewItemCard({interview}) {
const router=useRouter();
const onStart=()=>{
    router.push('/dashboard/interview/'+interview?.mockId)
}
const onFeedback=()=>{
    router.push('/dashboard/interview/'+interview?.mockId+"/feedback")
}

  return (
    <div className="border shadow-sm rounded-lg p-3">
      <h2 className="font-bold text-[#0A717C]">{interview?.jobPosition}</h2>
      <h2 className="text-sm text-gray-600">
        {" "}
        {interview?.jobExperience}Years of Experience
      </h2>
      <h2 className="text-xs text-gray-400">
        {" "}
        Created on: {interview?.createdAt}
      </h2>
      <div className="flex flex-col items-end gap-1 mt-2">
        <Button
          onClick={onFeedback}
          size="sm"
          variant="outline"
          className="w-full mb-1"
        >
          Feedback
        </Button>
        <Button onClick={onStart} size="sm" className="w-full bg-[#0A717C]">
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
