"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  return (
    <div className="min-h-[400px]">
      <ReactQuill
        value={value}
        onChange={onChange}
        theme="snow"
        placeholder="Start writing..."
      />
    </div>
  );
}
