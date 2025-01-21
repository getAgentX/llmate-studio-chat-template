import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const notebookApi = createApi({
  reducerPath: "notebookApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getNotebooks: builder.mutation({
      query: ({ skip, limit, sort_by, query }) => ({
        url: `notebook/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    createNotebook: builder.mutation({
      query: ({ payload }) => ({
        url: `notebook/`,
        method: "POST",
        body: payload,
      }),
    }),
    deleteNotebook: builder.mutation({
      query: ({ notebook_id }) => ({
        url: `notebook/${notebook_id}/`,
        method: "DELETE",
        body: {},
      }),
    }),
    getNotebook: builder.mutation({
      query: ({ notebook_id }) => ({
        url: `notebook/${notebook_id}/`,
      }),
    }),
    getNotebookInfo: builder.query({
      query: ({ notebook_id }) => ({
        url: `notebook/${notebook_id}/`,
      }),
    }),
    updateNotebookPublish: builder.mutation({
      query: ({ notebook_id, payload }) => ({
        url: `notebook/${notebook_id}/published-status/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    updateNotebookInfo: builder.mutation({
      query: ({ notebook_id, payload }) => ({
        url: `notebook/${notebook_id}/update-notebook-info/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    updateDatasources: builder.mutation({
      query: ({ notebook_id, payload }) => ({
        url: `notebook/${notebook_id}/update-datasources/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateAssistants: builder.mutation({
      query: ({ notebook_id, payload }) => ({
        url: `notebook/${notebook_id}/update-assistants/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateBlocks: builder.mutation({
      query: ({ notebook_id, payload }) => ({
        url: `notebook/${notebook_id}/update-blocks/`,
        method: "PUT",
        body: payload,
      }),
    }),
    search: builder.query({
      query: ({ skip, limit, query }) => ({
        url: `notebook/search/?skip=${skip}&limit=${limit}&query=${query}`,
        method: "GET",
      }),
    }),
    getRecentlyUsedNotebooks: builder.query({
      query: () => ({
        url: `notebook/recently-used-notebooks/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetNotebooksMutation,
  useCreateNotebookMutation,
  useDeleteNotebookMutation,
  useGetNotebookMutation,
  useGetNotebookInfoQuery,
  useUpdateNotebookPublishMutation,
  useUpdateNotebookInfoMutation,
  useUpdateDatasourcesMutation,
  useUpdateAssistantsMutation,
  useUpdateBlocksMutation,
  useSearchQuery,
  useGetRecentlyUsedNotebooksQuery,
} = notebookApi;

export default notebookApi;
