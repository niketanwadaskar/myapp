"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { db } from "../../../lib/firebase"; // Adjust the path as necessary
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

// Validation schema using yup
const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

type EmailFormData = {
  email: string;
};

type PasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function Page() {
  const [emailVerifiedFromDb, setEmailVerifiedFromDb] = useState(false);
  const [userDocId, setUserDocId] = useState<string | null>(null);
  
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", data.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Email does not exist.");
        return;
      }

      let userId = null;
      querySnapshot.forEach((doc) => {
        userId = doc.id;
      });

      if (userId) {
        setUserDocId(userId);
        setEmailVerifiedFromDb(true);
        toast.success("Email verified, please reset your password.");
      }
    } catch (error) {
      console.error("Error verifying email: ", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!userDocId) return;

    try {
      const userDocRef = doc(db, "users", userDocId);
      await updateDoc(userDocRef, {
        password: data.password,
      });

      toast.success("Password reset successful, Please log in with new credentials!");
      setTimeout(() => {
          window.location.href = "/auth/login";
      }, 2000);
    } catch (error) {
      console.error("Error resetting password: ", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="md:w-1/2 lg:w-1/3 mt-16">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-semibold text-gray-500">Forgot Password</h1>
      {!emailVerifiedFromDb && (
        <form onSubmit={handleSubmitEmail(handleEmailSubmit)}>
          <div className="py-1">
            <Input
              {...registerEmail("email")}
              type="email"
              placeholder="Email"
              className="bg-slate-100"
            />
            <p className={`text-red-500 ${emailErrors.email ? "opacity-100" : "opacity-0"}`}>
              {emailErrors?.email?.message ?? "not message"}
            </p>
          </div>
          <Button
            type="submit"
            variant={"outline"}
            className="px-16 text-sm py-0 border-2 rounded-xl"
          >
            Submit
          </Button>
        </form>
      )}
      {emailVerifiedFromDb && (
        <form onSubmit={handleSubmitPassword(handlePasswordSubmit)}>
          <div className="py-1">
            <Input
              {...registerPassword("password")}
              type="password"
              placeholder="Password"
              className="bg-slate-100"
            />
            <p className={`text-red-500 ${passwordErrors.password ? "opacity-100" : "opacity-0"}`}>
              {passwordErrors?.password?.message ?? "not message"}
            </p>
          </div>
          <div className="py-1">
            <Input
              {...registerPassword("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              className="bg-slate-100"
            />
            <p className={`text-red-500 ${passwordErrors.confirmPassword ? "opacity-100" : "opacity-0"}`}>
              {passwordErrors?.confirmPassword?.message ?? "not message"}
            </p>
          </div>
          <Button
            type="submit"
            className="bg-[#ff748d] float-end px-7 hover:opacity-80 hover:bg-[#ff748d]"
          >
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}
