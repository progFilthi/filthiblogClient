"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostResponseTypes } from "@/types/PostsTypes";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PageableResponse {
  content: PostResponseTypes[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponseTypes[]>([]);
  const [pageData, setPageData] = useState<PageableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchPosts(token, currentPage);
  }, [router, currentPage]);

  const fetchPosts = async (token: string, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/drafts?page=${page}&size=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data: PageableResponse = await res.json();
      setPosts(data.content || []);
      setPageData(data);
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete post");

      toast.success("Post deleted successfully");
      fetchPosts(token!, currentPage);
    } catch (error) {
      toast.error("Failed to delete post");
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your blog posts
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button>Create New Post</Button>
          </Link>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <PostsTable posts={posts} onDelete={handleDelete} />
            {pageData && pageData.totalPages > 1 && (
              <Pagination
                pageData={pageData}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 border rounded-lg bg-card">
      <p className="text-muted-foreground mb-4">
        No posts yet. Start writing!
      </p>
      <Link href="/dashboard/create">
        <Button>Create Your First Post</Button>
      </Link>
    </div>
  );
}

function PostsTable({
  posts,
  onDelete,
}: {
  posts: PostResponseTypes[];
  onDelete: (id: string | number) => void;
}) {
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Created</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostRow({
  post,
  onDelete,
}: {
  post: PostResponseTypes;
  onDelete: (id: string | number) => void;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <div className="font-medium">{post.title}</div>
        <div className="text-sm text-muted-foreground line-clamp-1">
          {post.content.replace(/<[^>]*>?/gm, "")}
        </div>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600">
          Draft
        </span>
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {new Date(post.createdAt).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/posts/${post.id}/edit`}>
            <Button variant="ghost" size="sm" title="Edit post">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" title="Delete post">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title="Delete Post"
            description="Are you sure you want to delete this post? This action cannot be undone."
            confirmText="Delete"
            onConfirm={() => onDelete(post.id)}
            variant="destructive"
          />
        </div>
      </td>
    </tr>
  );
}

function Pagination({
  pageData,
  currentPage,
  onPageChange,
}: {
  pageData: PageableResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <p className="text-sm text-muted-foreground">
        Showing {pageData.number * pageData.size + 1} to{" "}
        {Math.min(
          (pageData.number + 1) * pageData.size,
          pageData.totalElements
        )}{" "}
        of {pageData.totalElements} posts
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={pageData.first}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={pageData.last}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
