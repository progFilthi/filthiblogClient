import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ModeToggle } from "../toggle/mode-toggle";

export default function NavbarPage() {
  return (
    <nav className="flex justify-between px-48 py-6 border border-b">
      <Link href={"/"} className="text-2xl font-semibold">
        Filthi <span>Blog</span>
      </Link>
      <div className="flex gap-4">
        <ModeToggle />
        <Link href={"/dashboard/create-blog"}>
          <Button>Create Blog</Button>
        </Link>
        <Link href={"/signup"}>
          <Button>Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}
