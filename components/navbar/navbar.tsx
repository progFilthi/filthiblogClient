import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ModeToggle } from "../toggle/mode-toggle";

export default function navbar() {
  return (
    <nav className="flex justify-between px-8 py-8">
      <h1 className="text-2xl font-semibold">
        Filthi <span>Blog</span>
      </h1>
      <ModeToggle />
      <div className="flex gap-4">
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
