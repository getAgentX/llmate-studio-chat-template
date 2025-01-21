import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const publishedApps = createApi({
  reducerPath: "publishedApps",
  baseQuery: baseQuery,

  endpoints: (builder) => ({
    publishedAppsList: builder.query({
      query: ({ organization_id }) =>
        `/app/published-apps?organization_id=${organization_id}&app_privacy_type=workspace`,
    }),

    publishedAppInfo: builder.query({
      query: ({ app_share_id }) => `/app/${app_share_id}/`,
    }),
  }),
  tagTypes: [],
});

export const { usePublishedAppsListQuery, usePublishedAppInfoQuery } =
  publishedApps;
export default publishedApps;
