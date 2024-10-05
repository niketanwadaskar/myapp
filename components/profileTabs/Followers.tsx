import React from "react";
type User = {
  id: string;
  name: string;
  email: string;
  following: string[];
  followers: string[];
};

export default function Followers({
  followers,
  currentUser,
  handleFollow,
  handleUnfollow,
}: {
  followers: User[];
  currentUser: User;
  handleFollow: (user: User) => void;
  handleUnfollow: (user: User) => void;
}) {
  return (
    <ul className="">
      {followers.map((user) => (
        <li
          key={user.id}
          className="flex my-2 justify-between items-center p-4 border border-gray-300 rounded-lg shadow-sm"
        >
          <div className="flex gap-5">
            <div className="w-12 h-12 overflow-hidden rounded-full border bg-white text-gray-300 uppercase flex justify-center items-center font-bold text-2xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-normal text-lg">{user.name}</p>
              <p className="text-gray-400 text-sm">
                Following: {user.following.length}
              </p>
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
  );
}
