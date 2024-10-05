"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="bg-white  lg:px-32 md:px-16 sm:px-11 px-2 pt-10 flex flex-col">
      <div className="flex justify-between items-center">
      <p className=" text-2xl  font-medium text-[#ff748d]"> TweetX</p>
     { (path.includes("forgot") || path.includes("signup")) && <Link href="/auth/login">
      <Button variant={"outline"} className="px-16  text-sm py-0  border-2 rounded-xl">
        Log in
      </Button> </Link>}
     {path.includes("login") && <Link href="/auth/signup">
      <Button variant={"outline"} className="px-16  text-sm py-0  border-2 rounded-xl">
        Sign up
      </Button> </Link>}

      </div>
      <div>

      {children}
      </div>
    </div>
  );
}