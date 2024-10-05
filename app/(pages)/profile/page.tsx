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
import Following from "@/components/profileTabs/Following";
import Followers from "@/components/profileTabs/Followers";
import Posts from "@/components/profileTabs/Posts";

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

  const fetchPosts = async (currentUser: User) => {
    if (currentUser) {
      try {
        const postsQuery = query(
          collection(firestore, "posts"),
          where("email", "==", currentUser.email)
        );
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

  const fetchFollowersAndFollowing = async (currentUser: User) => {
    if (currentUser) {
      try {
        const followersQuery = query(
          collection(firestore, "users"),
          where("following", "array-contains", currentUser.email)
        );
        const followersSnapshot = await getDocs(followersQuery);
        const followersList = followersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<User, "id">),
        }));
        setFollowers(followersList);

        const followingQuery = query(
          collection(firestore, "users"),
          where("followers", "array-contains", currentUser.email)
        );
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const email = getCookie("email");

      if (!email) {
        console.log("Email not found in cookies.");
        return;
      }

      try {
        const userQuery = query(
          collection(firestore, "users"),
          where("email", "==", email)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as Omit<User, "id">;
          setCurrentUser({ id: userSnapshot.docs[0].id, ...userData });
          fetchPosts({ id: userSnapshot.docs[0].id, ...userData });
          fetchFollowersAndFollowing({ id: userSnapshot.docs[0].id, ...userData });
        } else {
          console.log("No user found with this email.");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, [firestore, auth]);

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
          followers: userToUnfollow.followers.filter(
            (email) => email !== currentUser.email
          ),
        });

        const currentUserRef = doc(firestore, "users", currentUser.id);
        await updateDoc(currentUserRef, {
          following: currentUser.following.filter(
            (email) => email !== userToUnfollow.email
          ),
        });

        setFollowing((prevFollowing) =>
          prevFollowing.filter((user) => user.id !== userToUnfollow.id)
        );

        toast.success(`You have unfollowed ${userToUnfollow.name}`);
      } catch (error) {
        console.error("Error unfollowing user:", error);
        toast.error("Failed to unfollow user. Please try again.");
      }
    }
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    if (!updatedPost.id) {
      console.error("Post ID is required to update the post.");
      return;
    }

    try {
      // Reference to the post document in Firestore
      const postRef = doc(firestore, "posts", updatedPost.id);

      // Update the post content in Firestore
      await updateDoc(postRef, {
        content: updatedPost.content, // Only updating the content field
        timestamp: new Date().toISOString(), // Update timestamp if needed
      });

      // Update the local state with the updated post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        )
      );

      toast.success("Post updated successfully.");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post. Please try again.");
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
            <Tabs
              defaultValue="post"
              className="w-full flex gap-11 flex-col justify-center items-center"
            >
              <TabsList className=" w-full sm:w-[500px]">
                <TabsTrigger value="post">Post</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <TabsContent value="post">
                <Posts posts={posts} handleUpdatePost={handleUpdatePost} />
              </TabsContent>
              <TabsContent value="followers">
                <Followers
                  followers={followers}
                  currentUser={currentUser}
                  handleFollow={handleFollow}
                  handleUnfollow={handleUnfollow}
                />
              </TabsContent>
              <TabsContent value="following">
                <Following
                  following={following}
                  currentUser={currentUser}
                  handleFollow={handleFollow}
                  handleUnfollow={handleUnfollow}
                />
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
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};
