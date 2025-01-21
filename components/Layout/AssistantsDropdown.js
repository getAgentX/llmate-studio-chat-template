import React from "react";
import { useRouter } from "next/router";

const AssistantsDropdown = ({ data = {}, isOpen, slug = "" }) => {
  const router = useRouter();

  return (
    <li
      onClick={() => router.push(`/assistant/chat/${slug}/history/${data.id}`)}
    >
      <div className="flex flex-col">
        <div
          className={`flex items-center justify-between px-2 py-2 text-xs font-medium cursor-pointer border rounded-md capitalize ${
            isOpen
              ? "bg-[#2D2F34] text-white border-border"
              : "text-white/40 border-transparent hover:bg-[#2D2F34]"
          }`}
        >
          <div className="line-clamp-1">{data.label}</div>
        </div>
      </div>
    </li>
  );
};

export default AssistantsDropdown;
