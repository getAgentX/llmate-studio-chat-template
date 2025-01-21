import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const semi_structured_datasource = createApi({
  reducerPath: "semi_structured_datasource",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    createSemiStructuredDatasource: builder.mutation({
      query: ({ payload }) => ({
        url: `datasource/semi-structured/`,
        method: "POST",
        body: payload,
      }),
    }),

    addColumnsToDatasource: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/columns/`,
        method: "POST",
        body: payload,
      }),
    }),

    deleteDatasourceColumn: builder.mutation({
      query: ({ datasource_id, column_id }) => ({
        url: `datasource/semi-structured/${datasource_id}/columns/${column_id}/`,
        method: "DELETE",
      }),
    }),

    updateEmbeddingModel: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/embeddings/`,
        method: "PUT",
        body: payload,
      }),
    }),

    updateDatasourceColumns: builder.mutation({
      query: ({ datasource_id, column_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/columns/${column_id}/`,
        method: "PUT",
        body: payload,
      }),
    }),

    lookupRowsInDatasource: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/rows/lookup/`,
        method: "POST",
        body: payload,
      }),
    }),

    addRowToDatasource: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/rows/`,
        method: "POST",
        body: payload,
      }),
    }),

    deleteRowbyId: builder.mutation({
      query: ({ datasource_id, source_id }) => ({
        url: `datasource/semi-structured/${datasource_id}/rows/${source_id}/`,
        method: "DELETE",
      }),
    }),

    updateRowbyId: builder.mutation({
      query: ({ datasource_id, source_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/rows/${source_id}/`,
        method: "PUT",
        body: payload
      }),
    }),

    addBulkRows: builder.mutation({
      query: ({ datasource_id, payload }) => {
        const formData = new FormData();
        formData.append("file", payload.file);
        formData.append("cleanup", payload.cleanup);

        return {
          url: `datasource/semi-structured/${datasource_id}/bulk-upload-rows/`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),

    bulkDownloadRows: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/semi-structured/${datasource_id}/bulk-download-rows/`,
      }),
    }),
  }),
});

export const {
  useCreateSemiStructuredDatasourceMutation,
  useAddColumnsToDatasourceMutation,
  useDeleteDatasourceColumnMutation,
  useUpdateEmbeddingModelMutation,
  useUpdateDatasourceColumnsMutation,
  useLookupRowsInDatasourceMutation,
  useAddRowToDatasourceMutation,
  useDeleteRowbyIdMutation,
  useUpdateRowbyIdMutation,
  useAddBulkRowsMutation,
  useBulkDownloadRowsMutation

} = semi_structured_datasource;

export default semi_structured_datasource;
