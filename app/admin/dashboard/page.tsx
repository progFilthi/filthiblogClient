"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FilePlus, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalDrafts: number;
  totalPublished: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalDrafts: 0,
    totalPublished: 0,
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
      const [draftsRes, publishedRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/drafts?size=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?size=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const draftsData = await draftsRes.json();
      const publishedData = await publishedRes.json();

      setStats({
        totalDrafts: draftsData.totalElements || 0,
        totalPublished: publishedData.totalElements || 0,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blog posts and content
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Drafts"
            value={stats.totalDrafts}
            icon={<FileText className="h-5 w-5" />}
            href="/admin/drafts"
            color="amber"
          />
          <StatCard
            title="Published Posts"
            value={stats.totalPublished}
            icon={<CheckCircle2 className="h-5 w-5" />}
            href="/admin/published"
            color="emerald"
          />
          <StatCard
            title="Total Posts"
            value={stats.totalDrafts + stats.totalPublished}
            icon={<TrendingUp className="h-5 w-5" />}
            color="blue"
          />
          <Link
            href="/admin/create"
            className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Create New
                </p>
                <h3 className="text-2xl font-bold mt-2">Post</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                <FilePlus className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <QuickActionCard
            title="Manage Drafts"
            description="View and edit your unpublished posts"
            href="/admin/drafts"
            buttonText="View Drafts"
          />
          <QuickActionCard
            title="Published Posts"
            description="Manage your live blog posts"
            href="/admin/published"
            buttonText="View Published"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
  color = "blue",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
  color?: "amber" | "emerald" | "blue";
}) {
  const colorClasses = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  const content = (
    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickActionCard({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {buttonText}
      </Link>
    </div>
  );
}
