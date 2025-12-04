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
      return;
    }
    setToken(authToken);
  }, [router]);

  const handleSubmit = async () => {
    if (!token || !title.trim() || !content.trim()) return;

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create post");
      }

      toast.success("Post saved as draft!");
      router.push("/dashboard/my-posts");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
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

        {/* Info Banner */}
        <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
          <p className="text-sm text-muted-foreground">
            Your post will be saved as a draft. An admin will review and publish it.
          </p>
        </div>

        {/* Editor */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
          <h1 className="text-2xl font-bold">Create New Post</h1>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              type="text"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
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
