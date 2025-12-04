"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }
    setToken(authToken);

    if (postId) {
      fetchPost(authToken, postId as string);
    }
  }, [router, postId]);

  const fetchPost = async (token: string, id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch post");

      const data = await response.json();
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      toast.error("Failed to load post");
      router.push("/dashboard/my-posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !postId || !title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        }
      );

      if (!response.ok) throw new Error("Failed to save post");

      toast.success("Post saved!");
      router.push("/dashboard/my-posts");
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            onClick={() => router.push("/dashboard/my-posts")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
          <p className="text-sm text-muted-foreground">
            Your changes will be saved as a draft. An admin will review and publish it.
          </p>
        </div>

        {/* Editor */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
          <h1 className="text-2xl font-bold">Edit Post</h1>

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
