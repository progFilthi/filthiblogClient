"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostResponseTypes } from "@/types/PostsTypes";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

interface PageableResponse {
  content: PostResponseTypes[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export default function AdminDraftsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponseTypes[]>([]);
  const [pageData, setPageData] = useState<PageableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDrafts(token, currentPage);
  }, [router, currentPage]);

  const fetchDrafts = async (token: string, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/drafts?page=${page}&size=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch drafts");

      const data: PageableResponse = await res.json();
      setPosts(data.content || []);
      setPageData(data);
    } catch (error) {
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string | number) => {
    if (!confirm("Are you sure you want to publish this post?")) return;

    const token = localStorage.getItem("authToken");
    setPublishing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/published`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to publish post");

      toast.success("Post published successfully!");
      fetchDrafts(token!, currentPage);
    } catch (error) {
      toast.error("Failed to publish post");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete draft");

      toast.success("Draft deleted successfully");
      fetchDrafts(token!, currentPage);
    } catch (error) {
      toast.error("Failed to delete draft");
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
            <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your unpublished posts
            </p>
          </div>
          <Link href="/admin/create">
            <Button>Create New Post</Button>
          </Link>
        </div>

        {/* Drafts Table */}
        {posts.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">
              No drafts yet. Start writing!
            </p>
            <Link href="/admin/create">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-left p-4 font-medium">Updated</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0">
                      <td className="p-4">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {post.content.replace(/<[^>]*>?/gm, "")}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(post.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(post.id)}
                            disabled={publishing}
                          >
                            <Send className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {pageData.number * pageData.size + 1} to{" "}
                  {Math.min(
                    (pageData.number + 1) * pageData.size,
                    pageData.totalElements
                  )}{" "}
                  of {pageData.totalElements} drafts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={pageData.first}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={pageData.last}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
