import NavbarPage from "@/components/navigation/navbar";
import React from "react";

interface ChildrenProps {
  children: React.ReactNode;
}

export default function Container({ children }: ChildrenProps) {
  return (
    <div>
      <NavbarPage />

      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
