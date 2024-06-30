"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Adjust the path accordingly
import { Toaster, toast } from "react-hot-toast";

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  email: string;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchPosts = async () => {
      // Get email from cookies
      const email = getCookie("email");

      if (!email) return;

      // Query Firestore for the user's posts by email
      const postsQuery = query(collection(db, "posts"));
      const postsSnapshot = await getDocs(postsQuery);
      const fetchedPosts: Post[] = [];

      postsSnapshot.forEach((doc) => {
        const postData = doc.data();
        fetchedPosts.push({
          id: doc.id,
          author: postData.author,
          content: postData.content,
          timestamp: postData.timestamp,
          email: postData.email,
        });
      });

      setPosts(fetchedPosts);

      // Fetch the author's name from the users collection
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        const userData = usersSnapshot.docs[0].data();
        setUserName(userData.name);
      }
    };

    fetchPosts();
  }, []);

  const addPost = async () => {
    const email = getCookie("email");

    if (!email) return;

    const newPost: Post = {
      id: (posts.length + 1).toString(),
      author: userName,
      content: newPostContent,
      timestamp: new Date().toLocaleString(),
      email: email,
    };

    try {
      // Add the new post to Firestore
      await addDoc(collection(db, "posts"), newPost);

      // Update local state
      setPosts([...posts, newPost]);
      setNewPostContent("");
      setIsModalOpen(false);
      toast.success("Post added successfully!");
    } catch (error) {
      toast.error("Failed to add post.");
    }
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  return (
    <div className="bg-white lg:px-32 md:px-16 sm:px-11 px-2 pt-10">
      <Toaster />
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-[#ff748d] text-white px-4 py-2 rounded-md mb-4"
      >
        Write
      </button>

      {isModalOpen && (
        <div className="fixed  sm:inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white sm:p-6 rounded-lg shadow-lg sm:w-1/2">
            <h2 className="text-2xl mb-4">New Post</h2>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              maxLength={100}
              placeholder="What's on your mind? (100 characters max)"
              className="w-full p-4 mb-4 border rounded-md"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={addPost}
                className="bg-[#ff748d] text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className=" w-full justify-center items-center flex flex-col">
        {posts.map((post) => (
          <div key={post.id} className="p-4 mb-4 border rounded-lg shadow-md w-[90%] sm:w-1/2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-4"></div>
                <p className="font-medium">{post.author}</p>
              </div>
              <p className="text-gray-400 text-sm">{post.timestamp}</p>
            </div>
            <p className="text-gray-600 w-[300px] sm:w-[400px] line-clamp-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
