import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_EMBED_API_URL}/`,
});

const embedApi = createApi({
  reducerPath: "embedApi",
  baseQuery: rawBaseQuery,
  endpoints: (builder) => ({
    getEmbedDashboard: builder.query({
      query: ({ embeded_id }) => ({
        url: `dashboard/${embeded_id}/`,
      }),
    }),
    getEmbededSections: builder.query({
      query: ({ embeded_id }) => ({
        url: `dashboard/${embeded_id}/sections/`,
      }),
    }),
    getEmbededSection: builder.query({
      query: ({ embeded_id, section_id }) => ({
        url: `dashboard/${embeded_id}/sections/${section_id}/`,
      }),
    }),
    getEmbededWidget: builder.query({
      query: ({ embeded_id, section_id, widget_id }) => ({
        url: `dashboard/${embeded_id}/sections/${section_id}/widgets/${widget_id}/`,
      }),
    }),
    getEmbededWidgetData: builder.query({
      query: ({ embeded_id, section_id, widget_id }) => ({
        url: `dashboard/${embeded_id}/sections/${section_id}/widgets/${widget_id}/data/`,
      }),
    }),
    getEmbededGraph: builder.query({
      query: ({ embeded_id, section_id, widget_id, payload, skip, limit }) => ({
        url: `dashboard/${embeded_id}/sections/${section_id}/widgets/${widget_id}/get-graph/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetEmbedDashboardQuery,
  useGetEmbededSectionsQuery,
  useGetEmbededSectionQuery,
  useGetEmbededWidgetQuery,
  useGetEmbededWidgetDataQuery,
  useGetEmbededGraphQuery,
} = embedApi;

export default embedApi;
