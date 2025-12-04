"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, FilePlus, PenLine } from "lucide-react";

interface DashboardStats {
  totalDrafts: number;
  totalPosts: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ totalDrafts: 0, totalPosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      // Fetch user's drafts
      const draftsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/drafts?size=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch all user's posts (drafts + published)
      const myPostsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/my-posts?size=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const draftsData = draftsRes.ok ? await draftsRes.json() : { totalElements: 0 };
      const myPostsData = myPostsRes.ok ? await myPostsRes.json() : { totalElements: 0 };
      
      setStats({
        totalDrafts: draftsData.totalElements || 0,
        totalPosts: myPostsData.totalElements || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
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
      <div className="max-w-5xl mx-auto space-y-8">
        <Header />
        <StatsGrid stats={stats} />
        <ActionsSection />
        <InfoBanner />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">My Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Create and manage your blog posts
      </p>
    </div>
  );
}

function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StatCard
        title="My Drafts"
        value={stats.totalDrafts}
        description="Posts awaiting admin review"
        color="amber"
        href="/dashboard/my-posts"
      />
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        description="All your posts"
        color="blue"
        href="/dashboard/my-posts"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  color,
  href,
}: {
  title: string;
  value: number;
  description: string;
  color: "amber" | "blue" | "emerald";
  href: string;
}) {
  const colorClasses = {
    amber: "bg-amber-500/10 text-amber-600",
    blue: "bg-blue-500/10 text-blue-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <Link
      href={href}
      className="block rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <FileText className="h-6 w-6" />
        </div>
      </div>
    </Link>
  );
}

function ActionsSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ActionCard
        href="/dashboard/create"
        icon={<FilePlus className="h-8 w-8 text-primary" />}
        title="Create New Post"
        description="Write a new blog post"
        variant="primary"
      />
      <ActionCard
        href="/dashboard/my-posts"
        icon={<PenLine className="h-8 w-8" />}
        title="My Posts"
        description="View and edit your drafts"
        variant="secondary"
      />
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  variant,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: "primary" | "secondary";
}) {
  const bgClass =
    variant === "primary"
      ? "bg-gradient-to-br from-primary/10 to-primary/5"
      : "bg-card";

  return (
    <Link
      href={href}
      className={`group rounded-lg border ${bgClass} p-8 hover:shadow-lg transition-all hover:scale-105`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="rounded-full bg-muted p-4 group-hover:bg-muted/80 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function InfoBanner() {
  return (
    <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
      <p className="text-sm text-muted-foreground">
        <strong>Note:</strong> Your posts will be saved as drafts. An admin will
        review and publish approved posts.
      </p>
    </div>
  );
}
