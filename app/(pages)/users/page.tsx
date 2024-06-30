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
import { getAuth, User as FirebaseUser } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import firebaseApp, { db } from "./../../../lib/firebase";

interface User {
  id: string;
  name: string;
  email: string;
  followers: string[];
  following: string[];
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  console.log(currentUser,"c",users)

  useEffect(() => {
    const fetchUsers = async () => {
      const usersQuery = query(collection(firestore, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, "id">),
      }));
      const list = usersList.filter((user) => user.email !== currentUser?.email);
      setUsers(list);
    };

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
    

    fetchCurrentUser();
    fetchUsers();
  }, [firestore, auth]);

  const handleFollow = async (userToFollow: User) => {
    if (currentUser) {
      try {
        // Update the user to follow's followers list
        const userToFollowRef = doc(firestore, "users", userToFollow.id);
        await updateDoc(userToFollowRef, {
          followers: [...userToFollow.followers, currentUser.email],
        });

        // Update the current user's following list
        const currentUserRef = doc(firestore, "users", currentUser.id);
        await updateDoc(currentUserRef, {
          following: [...currentUser.following, userToFollow.email],
        });

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userToFollow.id
              ? { ...user, followers: [...user.followers, currentUser.email] }
              : user.id === currentUser.id
              ? { ...user, following: [...user.following, userToFollow.email] }
              : user
          )
        );

        setCurrentUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              following: [...prevUser.following, userToFollow.email],
            };
          }
          return prevUser;
        });

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
        // Update the user to unfollow's followers list
        const userToUnfollowRef = doc(firestore, "users", userToUnfollow.id);
        await updateDoc(userToUnfollowRef, {
          followers: userToUnfollow.followers.filter(
            (email) => email !== currentUser.email
          ),
        });

        // Update the current user's following list
        const currentUserRef = doc(firestore, "users", currentUser.id);
        await updateDoc(currentUserRef, {
          following: currentUser.following.filter(
            (email) => email !== userToUnfollow.email
          ),
        });

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userToUnfollow.id
              ? {
                  ...user,
                  followers: user.followers.filter(
                    (email) => email !== currentUser.email
                  ),
                }
              : user.id === currentUser.id
              ? {
                  ...user,
                  following: user.following.filter(
                    (email) => email !== userToUnfollow.email
                  ),
                }
              : user
          )
        );

        setCurrentUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              following: prevUser.following.filter(
                (email) => email !== userToUnfollow.email
              ),
            };
          }
          return prevUser;
        });

        toast.success(`You have unfollowed ${userToUnfollow.name}`);
      } catch (error) {
        console.error("Error unfollowing user:", error);
        toast.error("Failed to unfollow user. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto flex justify-center items-center flex-col p-4 sm:pt-16">
      <Toaster />
      {/* <h1 className="text-2xl font-bold mb-4">Users</h1> */}
      <ul className="space-y-4 w-[90%] sm:w-[500px]">
        {users.map((user) => (
          <li
            key={user.id}
            className={` ${currentUser && currentUser.email !== user.email ? "border" : "hidden"} flex justify-between items-center p-4 border border-gray-300 rounded-lg shadow-sm`}
          >
            <div className="flex gap-5">
              <div className="w-12 h-12 overflow-hidden rounded-full border bg-white text-gray-300 uppercase flex justify-center items-center font-bold text-2xl  ">
            {user.name.split("")[0]}
              </div>
            <div>  <p className="font-normal text-lg">{user.name}</p>
              {/* <p className="text-gray-600">Email: {user.email}</p> */}
              <p className="text-gray-400 text-sm">
                Following: {user.following.length}
              </p></div>
                {/* <p className="text-gray-600">
                  Followers: {user.followers.length}
                </p> */}
            </div>
            {currentUser && currentUser.email !== user.email && (
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
    </div>
  );
};

export default Users;


const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};