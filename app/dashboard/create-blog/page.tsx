"use client";

import { useState } from "react";
import RichTextEditor from "@/components/rich-text/richtext-editor";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    await fetch("http://localhost:8080/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
  };

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      <input
        className="w-full p-3 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title..."
      />

      <div className="border rounded p-2">
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <button
        className="w-full bg-blue-600 text-white p-3 rounded"
        onClick={handleSubmit}
      >
        Publish
      </button>
    </div>
  );
}
