"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post.");
      }

      toast.success("Draft saved successfully!");
      setTitle("");
      setContent("");
      router.push("/admin/drafts");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
        </div>

        {/* Editor */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
          <div>
            <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
          </div>

          <div>
            <label className="block font-medium mb-2">Title</label>
            <Input
              type="text"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Content</label>
            <RichTextEditor
              placeholder="Write your post content..."
              content={content}
              onChange={setContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
