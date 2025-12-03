"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostResponseTypes } from "@/types/PostsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface PageableResponse {
  content: PostResponseTypes[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function DraftsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "0");

  const [posts, setPosts] = useState<PostResponseTypes[]>([]);
  const [pageData, setPageData] = useState<PageableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return router.push("/login");

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/posts/drafts?page=${currentPage}&size=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error(`Failed to fetch drafts: ${res.status}`);

        const data: PageableResponse = await res.json();
        setPosts(data.content || []);
        setPageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch drafts");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [currentPage, router]);

  const goToPage = (page: number) => {
    router.push(`/dashboard/drafts?page=${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) setSelectedIds([]);
    else setSelectedIds(posts.map((p) => p.id));
  };

  const handlePublish = async () => {
    if (selectedIds.length === 0) return;

    const token = localStorage.getItem("authToken");
    setPublishing(true);

    try {
      const calls = selectedIds.map((id) =>
        fetch(`${API_BASE_URL}/api/posts/${id}/published`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

      const results = await Promise.all(calls);
      for (const r of results) {
        if (!r.ok) throw new Error("Publish failed");
      }

      setSuccessMessage(`Published ${selectedIds.length} draft(s)!`);
      setSelectedIds([]);
      window.location.reload();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish drafts");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-4">Loading drafts...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Draft Posts</h1>
        <p className="text-muted-foreground mb-6">
          Manage and publish your unfinished work
        </p>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="mb-4 flex items-center gap-3 p-3 bg-muted rounded border">
          <input
            type="checkbox"
            checked={selectedIds.length === posts.length && posts.length > 0}
            onChange={toggleSelectAll}
            className="cursor-pointer w-5 h-5"
          />
          <span className="text-sm font-medium">
            {selectedIds.length === 0
              ? `Select all (${posts.length})`
              : `${selectedIds.length} selected`}
          </span>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => toggleSelect(post.id)}
              className={`group bg-card border rounded-lg p-6 transition-all cursor-pointer ${
                selectedIds.includes(post.id)
                  ? "bg-accent/40 shadow-md"
                  : "hover:border-accent hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(post.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(post.id);
                  }}
                  className="w-5 h-5 mt-1 cursor-pointer"
                />

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {post.content}
                  </p>

                  <div className="flex gap-4 text-xs text-muted-foreground mt-3 border-t pt-3">
                    <span>Created: {formatDate(post.createdAt)}</span>
                    <span>Updated: {formatDate(post.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {pageData && pageData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={pageData.first}
            >
              Previous
            </Button>

            {[...Array(pageData.totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={i === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(i)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={pageData.last}
            >
              Next
            </Button>
          </div>
        )}

        <div className="sticky bottom-0 bg-background border-t mt-6 p-4 flex gap-4 items-center">
          <Button
            onClick={handlePublish}
            disabled={selectedIds.length === 0 || publishing}
          >
            {publishing
              ? "Publishing..."
              : `Publish Selected (${selectedIds.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
