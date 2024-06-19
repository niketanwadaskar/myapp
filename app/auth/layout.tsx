import { Button } from "@/components/ui/button";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white  lg:px-32 md:px-16 sm:px-11 px-2 pt-10">
      <p className=" text-2xl  font-medium text-[#ff748d]"> TweetX</p>
      <Button variant={"outline"} className="px-16  text-sm py-0  border-2 rounded-xl">
        Log in
      </Button>
      {children}
    </div>
  );
}
