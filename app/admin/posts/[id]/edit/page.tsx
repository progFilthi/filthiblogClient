"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Send } from "lucide-react";

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

    // Fetch post data
    if (postId) {
      fetchPost(authToken, postId as string);
    }
  }, [router, postId]);

  const fetchPost = async (token: string, id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch post");

      const data = await response.json();
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      toast.error("Failed to load post");
      router.push("/admin/drafts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !postId) return;

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

      toast.success("Post saved successfully!");
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!token || !postId) return;

    if (!confirm("Are you sure you want to publish this post?")) return;

    setSaving(true);

    try {
      // First save the post
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      // Then publish it
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/published`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to publish post");

      toast.success("Post published successfully!");
      router.push("/admin/published");
    } catch (error) {
      toast.error("Failed to publish post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving || !title.trim() || !content.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-4 bg-card border rounded-lg p-6">
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
