"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import {
  getCollectionData,
  addDocument,
  updateDocument,
  deleteDocument,
} from "../../../lib/services/firestore";
import { redirect } from "next/navigation";

interface User {
  id?: string;
  name: string;
  email: string;
  following: string[];
  followers: string[];
  password: string;
}

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Pick<User, "name" | "email">>({
    name: "",
    email: "",
  });

  useEffect(() => {
    // Fetch users data when component mounts
    const fetchUsers = async () => {
      const usersData = await getCollectionData("users");
      setUsers(usersData as User[]);
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data: FormData) => {
    const emailExists = users.some((user) => user.email === data.email);

    if (emailExists) {
      toast.error("Email already exists. Please use a different email.");
      return;
    }

    const user: User = {
      name: data.name,
      email: data.email,
      following: [],
      followers: [],
      password: data.password,
    };

    try {
      const addedUser = await addDocument("users", user);
      setUsers([...users, { id: addedUser?.id, ...user }]);
      toast.success("Your account has been created successfully!");
      setTimeout(() => {
        window.location.href=("/auth/login");
      }, 2000);
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="md:w-1/2 lg:w-1/3 mt-16">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-semibold text-gray-500">Create Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        <div className="py-1">
          <Input
            {...register("name")}
            type="text"
            placeholder="Name"
            className="bg-slate-100"
          />
          <p className={`text-red-500 ${errors.name ? "opacity-100" : "opacity-0"}`}>
            {errors?.name?.message ?? "not message"}
          </p>
        </div>
        <div className="py-1">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="bg-slate-100"
          />
          <p className={`text-red-500 ${errors.email ? "opacity-100" : "opacity-0"}`}>
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
          <p className={`text-red-500 ${errors.password ? "opacity-100" : "opacity-0"}`}>
            {errors?.password?.message ?? "not message"}
          </p>
        </div>
        <div className="py-1">
          <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="Confirm Password"
            className="bg-slate-100"
          />
          <p className={`text-red-500 ${errors.confirmPassword ? "opacity-100" : "opacity-0"}`}>
            {errors?.confirmPassword?.message ?? "not message"}
          </p>
        </div>
        <Button type="submit" className="bg-[#ff748d] float-end px-7 hover:opacity-80 hover:bg-[#ff748d]">
          Sign up
        </Button>
      </form>
    </div>
  );
}
