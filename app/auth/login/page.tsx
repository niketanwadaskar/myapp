"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { db } from "../../../lib/firebase"; // Adjust the path as necessary
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

// Validation schema using yup
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type FormData = {
  email: string;
  password: string;
};

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Function to set a cookie
  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  const onSubmit = async (data: FormData) => {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", data.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Email does not exist.");
        return;
      }

      let user = null as any;
      querySnapshot.forEach((doc) => {
        user = doc.data();
      });

      if (user && user.password === data.password) {
        // Generate a mock token for demonstration purposes
        const token = Math.random().toString(36).substr(2);

        // Set token in cookies
        setCookie("email",user.email, 7);

        toast.success("Login successful!");

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/";
        },500)
      } else {
        toast.error("Password does not match.");
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="md:w-1/2 lg:w-1/3 mt-16">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-semibold text-gray-500">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        <div className="py-1">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="bg-slate-100"
          />
          <p
            className={`text-red-500 ${
              errors.email ? "opacity-100" : "opacity-0"
            }`}
          >
            {errors?.email?.message ?? "not message"}
          </p>
        </div>
        <div className="py-1">
          <Input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="bg-slate-100"
          />
          <p
            className={`text-red-500 ${
              errors.password ? "opacity-100" : "opacity-0"
            }`}
          >
            {errors?.password?.message ?? "not message"}
          </p>
        </div>
        <div className="flex justify-between">
         <Link href="/auth/forgot-password" className="text-[#ff748d]"> <p>forgot password</p></Link>

          <Button
            type="submit"
            className="bg-[#ff748d] float-end px-7 hover:opacity-80 hover:bg-[#ff748d]"
          >
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}
