import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const ListDropdown = ({ url = "", data = {}, name }) => {
  const [currentSlug, setCurrentSlug] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const chatId = router.query.slug;

    if (chatId) {
      setCurrentSlug(chatId);
    }
  }, [router]);

  return (
    <li>
      <Link
        href={url}
        className={`flex items-center justify-between px-2 py-2 text-xs font-medium cursor-pointer rounded-md capitalize ${
          currentSlug === data._id
            ? "bg-[#2D2F34] text-white"
            : "text-white/40 hover:bg-[#2D2F34]"
        }`}
      >
        <span>{name}</span>
      </Link>
    </li>
  );
};

export default ListDropdown;
