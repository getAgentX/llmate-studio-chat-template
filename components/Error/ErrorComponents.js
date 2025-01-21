import React from "react";
import { useRouter } from "next/router";

const ErrorComponents = ({ error = {} }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-page">
      <div className="flex flex-col justify-center w-full max-w-lg mx-auto space-y-2 text-center min-h-60">
        <img src="" alt="" />

        {error?.data?.message !== "" ? (
          <h4 className="text-base font-medium tracking-wide text-primary-text">
            {error?.data?.message}
          </h4>
        ) : (
          <>
            <h4 className="text-base font-medium tracking-wide text-primary-text">
              Something went wrong
            </h4>
          </>
        )}

        {/* <p className="text-sm font-normal leading-8 tracking-wide text-secondary-text">
          Oops! The page you’re looking for doesn’t exists. It might have been
          moved or delete.
        </p> */}

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text"
            onClick={() => router.push("/")}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponents;
