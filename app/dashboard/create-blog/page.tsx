"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
    } else {
      setToken(authToken);
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish post.");
      }

      toast.success("Post published successfully!");
      setTitle("");
      setContent("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="space-y-8">
      <label className="block font-medium">Title</label>
      <Input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block font-medium">Content</label>
      <Textarea
        placeholder="Add blog post content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button
        disabled={loading || !title.trim() || !content.trim()}
        className="w-full"
        onClick={handleSubmit}
      >
        {loading ? "Publishing..." : "Publish Blog"}
      </Button>
    </div>
  );
}
