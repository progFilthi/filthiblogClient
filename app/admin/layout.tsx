"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Try to fetch user data to verify admin role
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        
        if (userData.role === "ADMIN") {
          setIsAuthorized(true);
        } else {
          // Not an admin, redirect to home
          router.push("/");
        }
      } else {
        // Invalid token
        localStorage.removeItem("authToken");
        router.push("/login");
      }
    } catch (error) {
      // If endpoint doesn't exist yet, allow access if token exists
      // Remove this fallback once /api/auth/me is implemented
      setIsAuthorized(true);
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

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
