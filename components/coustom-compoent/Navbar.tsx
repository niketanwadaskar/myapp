"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";

export default function Navbar() {
  const path = usePathname();

  function handleLogout() {
    // Delete the 'email' cookie
    document.cookie = 'email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    // Optionally, you can redirect the user to the login page or home page
    window.location.href = 'auth/login'; // Adjust this path based on your routing setup
  }

  return (
    <nav className="bg-white px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto mb-4 sm:mb-0">
            <Image src="/logo.svg" alt="Logo" width={150} height={150}  className="cursor-pointer" onClick={() => window.location.href = '/feed'}/>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex space-x-6 font-medium">
              <Link href="/feed">
                <span className={`cursor-pointer ${path.includes("feed") ? "text-[#ff748d]" : "text-gray-500 hover:text-gray-700"}`}>
                  Feed
                </span>
              </Link>
              <Link href="/users">
                <span className={`cursor-pointer ${path.includes("users") ? "text-[#ff748d]" : "text-gray-500 hover:text-gray-700"}`}>
                  Users
                </span>
              </Link>
              <Link href="/profile">
                <span className={`cursor-pointer ${path.includes("profile") ? "text-[#ff748d]" : "text-gray-500 hover:text-gray-700"}`}>
                  Profile
                </span>
              </Link>
            </div>
            <Button
              variant="outline"
              className="px-6 py-2 text-sm border-2 rounded-xl"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
