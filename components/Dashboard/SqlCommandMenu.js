import React, { useRef, useState } from "react";
import { stackoverflowDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { CopyToClipboard } from "react-copy-to-clipboard";

const SqlCommandMenu = ({ show, setShow, data }) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);

  const handleCopy = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const customStyle = {
    ...stackoverflowDark,

    hljs: {
      ...stackoverflowDark.hljs,
      backgroundColor: "#09090B",
      padding: "20px 12px",
      fontSize: "14px",
    },
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] max-h-full md:inset-0 bg_blur ${
        show ? "" : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 w-full overflow-x-hidden overflow-y-auto max-w-2xl bg-page recent__bar"
        ref={modalRef}
      >
        <div className="relative flex flex-col flex-1 h-full border-l-2 border-[#171717]">
          <div className="flex sticky top-0 left-0 z-[100] bg-page w-full items-center py-3 px-4 justify-between border-b text-accent border-[#171717] mb-4">
            <div className="flex items-center space-x-4 text-sm font-medium tracking-wide text-white">
              <span
                className="flex items-center justify-center"
                onClick={() => setShow(false)}
              >
                <svg
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 cursor-pointer fill-white"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.00104 6.91474L9.53637 10.4501C9.72397 10.6377 9.9784 10.7431 10.2437 10.7431C10.509 10.7431 10.7634 10.6377 10.951 10.4501C11.1386 10.2625 11.244 10.008 11.244 9.74274C11.244 9.47744 11.1386 9.223 10.951 9.03541L7.41437 5.50007L10.9504 1.96474C11.0432 1.87185 11.1169 1.76159 11.1671 1.64024C11.2173 1.51889 11.2432 1.38884 11.2431 1.2575C11.2431 1.12617 11.2172 0.99613 11.1669 0.874806C11.1166 0.753482 11.0429 0.643251 10.95 0.550407C10.8571 0.457562 10.7469 0.383923 10.6255 0.333692C10.5042 0.283462 10.3741 0.257624 10.2428 0.257655C10.1115 0.257686 9.98143 0.283585 9.8601 0.333872C9.73878 0.38416 9.62855 0.457852 9.5357 0.55074L6.00104 4.08607L2.4657 0.55074C2.3735 0.455188 2.26319 0.378954 2.14121 0.326488C2.01924 0.274023 1.88803 0.246375 1.75525 0.245159C1.62247 0.243943 1.49078 0.269183 1.36786 0.319406C1.24494 0.369629 1.13326 0.443829 1.03932 0.537677C0.945384 0.631525 0.871078 0.743142 0.820739 0.866014C0.770401 0.988886 0.745037 1.12055 0.746127 1.25333C0.747218 1.38611 0.774742 1.51734 0.827093 1.63937C0.879443 1.7614 0.955572 1.87178 1.05104 1.96407L4.5877 5.50007L1.05171 9.03607C0.956239 9.12837 0.88011 9.23875 0.827759 9.36077C0.775409 9.4828 0.747885 9.61403 0.746794 9.74681C0.745703 9.87959 0.771067 10.0113 0.821406 10.1341C0.871745 10.257 0.94605 10.3686 1.03999 10.4625C1.13392 10.5563 1.24561 10.6305 1.36853 10.6807C1.49145 10.731 1.62314 10.7562 1.75592 10.755C1.8887 10.7538 2.0199 10.7261 2.14188 10.6737C2.26386 10.6212 2.37417 10.545 2.46637 10.4494L6.00104 6.91541V6.91474Z"
                  />
                </svg>
              </span>
              <span className=" font-medium text-white capitalize line-clamp-1 whitespace-nowrap">
                SQL
              </span>
            </div>
            <CopyToClipboard text={data} onCopy={() => handleCopy()}>
              <div className="flex items-center space-x-2 cursor-pointer text-xs">
                <span>
                  {copied ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-green-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                      />
                    </svg>
                  )}
                </span>

                <span className="tracking-wider">
                  {copied ? "Copied" : "Copy"}
                </span>
              </div>
            </CopyToClipboard>
          </div>
          <div className="flex flex-col overflow-x-auto border border-[#171717] rounded-md mx-2">
            <SyntaxHighlighter
              language="Sql"
              style={customStyle}
              wrapLongLines={true}
            >
              {data}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlCommandMenu;
