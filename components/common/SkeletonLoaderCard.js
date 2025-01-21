import { useTheme } from "@/hooks/useTheme";
import React from "react";

const SkeletonLoaderCard = ({ count = 3 }) => {
  const { theme } = useTheme();

  return (
    <div className="grid sm:grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`flex flex-col justify-between space-y-3 p-3 rounded-md shadow-md ${theme === "dark" ? "bg-[#222426]" : "bg-[#f0f0f0]"} animate-pulse`}
        >
          {/* Top Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
              <div className={`h-3 w-16 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-4 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
              <div className={`h-3 w-16 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="space-y-4">
            <div className={`h-3 w-full rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
            <div className={`h-3 w-5/6 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
          </div>

          <div className="flex items-center gap-2 justify-between">
            <div className={`h-3 w-16 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
            <div className={`h-4 w-4 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-cente pt-6">
            <div className={`h-8 w-20 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
            <div className={`h-8 w-20 rounded-md ${theme === "dark" ? "bg-[#333436]" : "bg-[#d4d4d4]"}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoaderCard;
