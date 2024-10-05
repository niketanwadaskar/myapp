import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa"; // Import the pencil icon
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type Post = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
};

export default function Posts({ posts, handleUpdatePost }: { posts: Post[], handleUpdatePost: (post: Post) => void }) {
  const [isOpen, setIsOpen] = useState(false); // Modal open/close state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // To track which post is being edited
  const [updatedContent, setUpdatedContent] = useState<string>(""); // To track updated content

  const handleEditClick = (post: Post) => {
    setSelectedPost(post);
    setUpdatedContent(post.content); // Initialize the textarea with current post content
    setIsOpen(true);
  };

  const handleUpdateClick = () => {
    if (selectedPost) {
      // Update the selectedPost's content with the updatedContent
      const updatedPost = { ...selectedPost, content: updatedContent };
      handleUpdatePost(updatedPost); // Pass updated post to the handler
    }
    closeModal(); // Close the modal after update
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPost(null);
    setUpdatedContent(""); // Reset updated content when closing
  };

  return (
    <>
      {posts.map((post) => (
        <div key={post.id} className="p-4 mb-4 border rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-4"></div>
              <p className="font-medium">{post.author}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-gray-400 text-sm">{post.timestamp}</p>
              {/* Pencil icon for editing */}
              <FaPencilAlt
                className="text-gray-500 cursor-pointer"
                onClick={() => handleEditClick(post)}
              />
            </div>
          </div>
          <p className="text-gray-600 w-[90%] sm:w-[400px] line-clamp-2">
            {post.content}
          </p>
        </div>
      ))}

      {/* Modal for updating post */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPost && (
              <>
                <p>Author: {selectedPost.author}</p>
                <textarea
                  className="w-full p-2 border rounded"
                  value={updatedContent} // Controlled textarea
                  onChange={(e) => setUpdatedContent(e.target.value)} // Update the state with new content
                />
              </>
            )}
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleUpdateClick} // Trigger the update logic
            >
              Update
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
