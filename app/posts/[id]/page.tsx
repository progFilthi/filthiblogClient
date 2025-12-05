"use client";

import { Button } from "@/components/ui/button";
import { PostResponseTypes } from "@/types/PostsTypes";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [post, setPost] = useState<PostResponseTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) throw new Error("Post not found");
          throw new Error(`Failed to fetch post: ${res.status}`);
        }

        const data: PostResponseTypes = await res.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            {error || "Post not found"}
          </h1>
          <p className="text-muted-foreground">
            The post you are looking for might have been removed or is temporarily unavailable.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-transparent pl-0 hover:text-primary transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <header className="mb-8 space-y-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">
                {post.author.username}
              </span>
            </div>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div
            className="leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>

        <hr className="my-12 border-muted" />

        <div className="flex justify-between items-center">
           <p className="text-sm text-muted-foreground">
            Last updated: {formatDate(post.updatedAt)}
           </p>
           {/* Placeholder for future share buttons or tags */}
        </div>
      </article>
    </div>
  );
}
