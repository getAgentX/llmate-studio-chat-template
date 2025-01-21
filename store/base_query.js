import { getSession } from "next-auth/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  credentials: "include",
  prepareHeaders: async (headers) => {
    const session = await getSession();
    if (session) {
      headers.set("Authorization", `Bearer ${session["accessToken"]}`);
    }
    // headers.set("Content-Type", "application/json");
    return headers;
  },
});

const selectOrganizationId = (state) => {
  return state.currentOrganization?.id;
};

export const baseQuery = async (args, api, extraOptions) => {
  const projectId = selectOrganizationId(api.getState());

  // gracefully handle scenarios where data to generate the URL is missing
  if (!projectId) {
    return {
      error: {
        status: 400,
        statusText: "Bad Request",
        data: "No project ID received",
      },
    };
  }

  const urlEnd = typeof args === "string" ? args : args.url;
  const adjustedUrl = `/${projectId}/${urlEnd}`;
  const adjustedArgs =
    typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };
  // provide the amended URL and other params to the raw base query
  return rawBaseQuery(adjustedArgs, api, extraOptions);
};
