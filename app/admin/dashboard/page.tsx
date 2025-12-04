"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Send, FilePlus, Users } from "lucide-react";

interface AdminStats {
  totalDrafts: number;
  totalPublished: number;
  totalPosts: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalDrafts: 0,
    totalPublished: 0,
    totalPosts: 0,
    totalUsers: 0,
  });
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
      // Fetch all drafts count (admin only)
      const draftsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/drafts/all?size=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const draftsData = await draftsRes.json();

      // Fetch published posts count
      const publishedRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts?size=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const publishedData = await publishedRes.json();

      // Try to fetch users count
      let usersCount = 0;
      try {
        const usersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/users?size=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          usersCount = usersData.totalElements || 0;
        }
      } catch {
        // Endpoint might require admin access
      }

      setStats({
        totalDrafts: draftsData.totalElements || 0,
        totalPublished: publishedData.totalElements || 0,
        totalPosts: (draftsData.totalElements || 0) + (publishedData.totalElements || 0),
        totalUsers: usersCount,
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
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        <StatsGrid stats={stats} />
        <QuickActions />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Manage all posts and users
      </p>
    </div>
  );
}

function StatsGrid({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Drafts"
        value={stats.totalDrafts}
        description="Awaiting review"
        icon={<FileText className="h-5 w-5" />}
        color="amber"
        href="/admin/drafts"
      />
      <StatCard
        title="Published"
        value={stats.totalPublished}
        description="Live posts"
        icon={<Send className="h-5 w-5" />}
        color="emerald"
        href="/admin/published"
      />
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        description="All posts"
        icon={<FileText className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        description="Registered users"
        icon={<Users className="h-5 w-5" />}
        color="purple"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: "amber" | "emerald" | "blue" | "purple";
  href?: string;
}) {
  const colorClasses = {
    amber: "bg-amber-500/10 text-amber-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    blue: "bg-blue-500/10 text-blue-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  const content = (
    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickActions() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <ActionCard
        href="/admin/create"
        icon={<FilePlus className="h-6 w-6 text-primary" />}
        title="Create Post"
        description="Write a new post"
      />
      <ActionCard
        href="/admin/drafts"
        icon={<FileText className="h-6 w-6 text-amber-600" />}
        title="Review Drafts"
        description="Approve and publish"
      />
      <ActionCard
        href="/admin/published"
        icon={<Send className="h-6 w-6 text-emerald-600" />}
        title="Published Posts"
        description="Manage live posts"
      />
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border bg-card p-6 hover:shadow-lg transition-all hover:scale-105"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-muted p-3 group-hover:bg-muted/80 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
