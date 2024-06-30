"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";

export default function Navbar() {
  const path = usePathname();

  function handleLogout() {
    // Delete the 'email' cookie
    document.cookie = 'email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    // Optionally, you can redirect the user to the login page or home page
    window.location.href = 'auth/login'; // Adjust this path based on your routing setup
  }

  return (
    <div className="bg-white lg:px-32 md:px-16 sm:px-11 px-2 pt-10 sm:flex justify-between flex-col">
      <p className="text-2xl font-medium text-[#ff748d]">TweetX</p>
      <div className="flex gap-5 justify-center items-center sm:justify-end">
      <p className="flex gap-5 font-medium ">
        <Link href={"/feed"}>
          <span
            className={`${
              path.includes("feed")
                ? "text-[#ff748d]"
                : "text-gray-300 hover:text-gray-400"
            } cursor-pointer`}
          >
            Feed
          </span>
        </Link>
        <Link href={"/users"}>
          <span
            className={`${
              path.includes("users")
                ? "text-[#ff748d]"
                : "text-gray-300 hover:text-gray-400"
            } cursor-pointer`}
          >
            Users
          </span>
        </Link>
        <Link href={"/profile"}>
          <span
            className={`${
              path.includes("profile")
                ? "text-[#ff748d]"
                : "text-gray-300 hover:text-gray-400"
            } cursor-pointer`}
          >
            Profile
          </span>
        </Link>
      </p>
      <Button
        variant={"outline"}
        className="sm:px-16 text-sm py-0 border-2 rounded-xl"
        onClick={handleLogout}
      >
        Logout
      </Button>
      </div>
    </div>
  );
}
