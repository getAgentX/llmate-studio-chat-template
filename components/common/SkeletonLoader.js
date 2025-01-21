import { useTheme } from "@/hooks/useTheme";
import React from "react";

// const SkeletonLoader = ({ limit = 24 }) => {
//   const { theme } = useTheme()
//   return (
//     <div className="grid w-full max-w-full grid-cols-1 gap-4 mx-auto sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
//       {[...Array(limit)].map((_, index) => (
//         <div
//           className="flex flex-col p-2 space-y-3 border rounded-md border-border animate-pulse"
//           key={index}
//         >
//           <div className={`w-5 h-5 rounded-full ${theme === 'dark' ? 'bg-[#222426]' : 'bg-[#c3c3c3]'} animate-pulse`}></div>
//           <div className={`w-3/4 h-4 rounded-md ${theme === 'dark' ? 'bg-[#222426]' : 'bg-[#c3c3c3]'} animate-pulse`}></div>
//           <div className={`w-full h-3 rounded-md ${theme === 'dark' ? 'bg-[#222426]' : 'bg-[#c3c3c3]'} animate-pulse`}></div>
//           <div className={`w-5/6 h-3 rounded-md ${theme === 'dark' ? 'bg-[#222426]' : 'bg-[#c3c3c3]'} animate-pulse`}></div>
//           <div className="flex items-center space-x-2">
//             <div className={`rounded-md h-7 w-28 ${theme === 'dark' ? 'bg-[#222426]' : 'bg-[#c3c3c3]'} animate-pulse`}></div>
//             <div className={`rounded-md h-7 w-28 ${theme === 'dark' ? 'bg-[#222426]' : 'bg-[#c3c3c3]'} animate-pulse`}></div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
const SkeletonLoaderTable = ({ rows = 5, columns = 3 }) => {
  const { theme } = useTheme();
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {[...Array(columns)].map((_, colIndex) => (
              <th
                key={colIndex}
                className={`h-12 py-2 px-3 text-xs font-medium text-left border-border-color text-nowrap text-[#a1a1a1]`}
              >
                <div
                  className={`h-3 w-1/2  rounded-md animate-pulse ${theme === "dark" ? "bg-[#222426]" : "bg-[#c3c3c3]"
                    }`}
                ></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {[...Array(columns)].map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-3 text-xs font-medium text-left border-t cursor-pointer h-12 border-border-color text-primary-text  "
                >
                  <div
                    className={`h-3 w-3/4  rounded-md ${theme === "dark" ? "bg-[#222426]" : "bg-[#c3c3c3]"
                      }`}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default SkeletonLoaderTable;
