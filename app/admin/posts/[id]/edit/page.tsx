"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Send } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }
    setToken(authToken);
    checkUserRole(authToken);

    if (postId) {
      fetchPost(authToken, postId as string);
    }
  }, [router, postId]);

  const checkUserRole = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
      }
    } catch (error) {
      setUserRole("USER");
    }
  };

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
      if (userRole === "ADMIN") {
        router.push("/admin/drafts");
      } else {
        router.push("/dashboard/my-posts");
      }
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

      if (userRole === "ADMIN") {
        router.push("/admin/published");
      } else {
        router.push("/dashboard/my-posts");
      }
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
            {userRole === "ADMIN" && (
              <ConfirmDialog
                trigger={
                  <Button
                    disabled={saving || !title.trim() || !content.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </Button>
                }
                title="Publish Post"
                description="Are you sure you want to publish this post? It will be visible to everyone."
                confirmText="Publish"
                onConfirm={handlePublish}
              />
            )}
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
