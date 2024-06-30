"use client";
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import firebaseApp, { db } from "./../../../lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  name: string;
  email: string;
  followers: string[];
  following: string[];
}

interface Post {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const email = getCookie("email");

      if (!email) {
        console.log("Email not found in cookies.");
        return;
      }

      try {
        const userQuery = query(collection(firestore, "users"), where("email", "==", email));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as Omit<User, "id">;
          setCurrentUser({ id: userSnapshot.docs[0].id, ...userData });
        } else {
          console.log("No user found with this email.");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    const fetchPosts = async () => {
      if (currentUser) {
        try {
          const postsQuery = query(collection(firestore, "posts"), where("email", "==", currentUser.email));
          const postsSnapshot = await getDocs(postsQuery);
          const postsList = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Post, "id">),
          }));
          setPosts(postsList);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      }
    };

    const fetchFollowersAndFollowing = async () => {
      if (currentUser) {
        try {
          const followersQuery = query(collection(firestore, "users"), where("following", "array-contains", currentUser.email));
          const followersSnapshot = await getDocs(followersQuery);
          const followersList = followersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<User, "id">),
          }));
          setFollowers(followersList);

          const followingQuery = query(collection(firestore, "users"), where("followers", "array-contains", currentUser.email));
          const followingSnapshot = await getDocs(followingQuery);
          const followingList = followingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<User, "id">),
          }));
          setFollowing(followingList);
        } catch (error) {
          console.error("Error fetching followers and following:", error);
        }
      }
    };

    fetchCurrentUser();
    fetchPosts();
    fetchFollowersAndFollowing();
  }, [firestore, auth, currentUser]);

  const handleFollow = async (userToFollow: User) => {
    if (currentUser) {
      try {
        const userToFollowRef = doc(firestore, "users", userToFollow.id);
        await updateDoc(userToFollowRef, {
          followers: [...userToFollow.followers, currentUser.email],
        });

        const currentUserRef = doc(firestore, "users", currentUser.id);
        await updateDoc(currentUserRef, {
          following: [...currentUser.following, userToFollow.email],
        });

        setFollowing((prevFollowing) => [...prevFollowing, userToFollow]);

        toast.success(`You are now following ${userToFollow.name}`);
      } catch (error) {
        console.error("Error following user:", error);
        toast.error("Failed to follow user. Please try again.");
      }
    }
  };

  const handleUnfollow = async (userToUnfollow: User) => {
    if (currentUser) {
      try {
        const userToUnfollowRef = doc(firestore, "users", userToUnfollow.id);
        await updateDoc(userToUnfollowRef, {
          followers: userToUnfollow.followers.filter((email) => email !== currentUser.email),
        });

        const currentUserRef = doc(firestore, "users", currentUser.id);
        await updateDoc(currentUserRef, {
          following: currentUser.following.filter((email) => email !== userToUnfollow.email),
        });

        setFollowing((prevFollowing) => prevFollowing.filter((user) => user.id !== userToUnfollow.id));

        toast.success(`You have unfollowed ${userToUnfollow.name}`);
      } catch (error) {
        console.error("Error unfollowing user:", error);
        toast.error("Failed to unfollow user. Please try again.");
      }
    }
  };

  return (
    <div className="w-full pt-8 flex-col flex justify-center items-center bg-white lg:px-32 md:px-16 sm:px-11 px-2 pt-10">
      <Toaster />
      {currentUser && (
        <>
          <div className="flex border-gray-300 py-5 sm:gap-10 justify-center items-center">
            <div className="w-24 h-24 overflow-hidden rounded-full border bg-white text-gray-300 uppercase flex justify-center items-center font-bold text-2xl">
              {currentUser.name.charAt(0)}
            </div>
            <div className="font-medium text-xl">
              <p>{currentUser.name}</p>
              <div className="text-sm text-gray-300 flex gap-5 py-5 font-normal">
                <p>Posts: {posts.length}</p>
                <p>Following: {currentUser.following.length}</p>
                <p>Followers: {currentUser.followers.length}</p>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <Tabs defaultValue="post" className="w-full flex gap-11 flex-col justify-center items-center">
              <TabsList className=" w-full sm:w-[500px]">
                <TabsTrigger value="post">Post</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <TabsContent value="post">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 mb-4 border rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-4"></div>
                        <p className="font-medium">{post.author}</p>
                      </div>
                      <p className="text-gray-400 text-sm">{post.timestamp}</p>
                    </div>
                    <p className="text-gray-600 w-[90%] sm:w-[400px] line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="followers">
                <ul className="">
                  {followers.map((user) => (
                    <li key={user.id} className="flex my-2 justify-between items-center p-4 border border-gray-300 rounded-lg shadow-sm">
                      <div className="flex gap-5">
                        <div className="w-12 h-12 overflow-hidden rounded-full border bg-white text-gray-300 uppercase flex justify-center items-center font-bold text-2xl">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-normal text-lg">{user.name}</p>
                          <p className="text-gray-400 text-sm">Following: {user.following.length}</p>
                        </div>
                      </div>
                      {currentUser.email !== user.email && (
                        <div className="ml-4">
                          {currentUser.following.includes(user.email) ? (
                            <button
                              onClick={() => handleUnfollow(user)}
                              className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Following
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFollow(user)}
                              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="following">
                <ul className="">
                  {following.map((user) => (
                    <li key={user.id} className="flex my-2 justify-between items-center p-4 border border-gray-300 rounded-lg shadow-sm">
                      <div className="flex gap-5">
                        <div className="w-12 h-12 overflow-hidden rounded-full border bg-white text-gray-300 uppercase flex justify-center items-center font-bold text-2xl">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-normal text-lg">{user.name}</p>
                          <p className="text-gray-400 text-sm">Following: {user.following.length}</p>
                        </div>
                      </div>
                      {currentUser.email !== user.email && (
                        <div className="ml-4">
                          {currentUser.following.includes(user.email) ? (
                            <button
                              onClick={() => handleUnfollow(user)}
                              className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Following
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFollow(user)}
                              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};