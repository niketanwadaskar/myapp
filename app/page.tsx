"use client";
import { useEffect, useState } from "react";
import { getCollectionData, addDocument, updateDocument, deleteDocument } from "../lib/services/firestore";
import { redirect } from 'next/navigation'

interface User {
  id?: string;
  name: string;
  email: string;
  following: string[];
  followers: string[];
  posts: string[];
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Pick<User, 'name' | 'email'>>({ name: '', email: '' });

  useEffect(() => { 
    const fetchData = async () => {
      const data = await getCollectionData("users");
      setUsers(data as any);
    };

    fetchData();
  }, []);

  const handleAddUser = async () => {
    const user: User = {
      name: newUser.name,
      email: newUser.email,
      following: [],
      followers: [],
      posts: []
    };
    const addedUser = await addDocument("users", user);
    setUsers([...users, { id: addedUser?.id, ...user }]);
  };

  const handleUpdateUser = async (id: string) => {
    const updatedData = { name: "Updated Name" };
    await updateDocument("users", id, updatedData);
    setUsers(users.map(user => user.id === id ? { ...user, ...updatedData } : user));
  };

  const handleDeleteUser = async (id: string) => {
    await deleteDocument("users", id);
    setUsers(users.filter(user => user.id !== id));
  };

  return (

    // export default function Page() {
      redirect('/feed')
    // }
    
  );
};

export default Page;
