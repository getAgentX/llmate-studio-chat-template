import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const sql_datasource = createApi({
  reducerPath: "sql_datasource",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    listExamplesInfo: builder.query({
      query: ({ datasource_id, skip, limit, sort_by, query }) => ({
        url: `datasource/sql/${datasource_id}/example/list/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    getExample: builder.mutation({
      query: ({ datasource_id, source_id }) => ({
        url: `datasource/sql/${datasource_id}/example/${source_id}/`,
      }),
    }),

    deleteExample: builder.mutation({
      query: ({ datasource_id, source_id }) => ({
        url: `datasource/sql/${datasource_id}/example/${source_id}/`,
        method: "DELETE",
      }),
    }),
    bulkDownload: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/sql/${datasource_id}/example/bulk-download/`,
      }),
    }),
    uploadExamplesInBulk: builder.mutation({
      query: ({ datasource_id, payload }) => {
        const formData = new FormData();
        formData.append("file", payload.file);
        formData.append("cleanup", payload.cleanup);

        return {
          url: `datasource/sql/${datasource_id}/example/bulk-upload/`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),

    getDetailedSQLDatasourceRunLog: builder.mutation({
      query: ({ datasource_id, datasource_run_log_id }) => ({
        url: `datasource/sql/${datasource_id}/run-logs/${datasource_run_log_id}/`,
      }),
    }),

    verifySQLDatasourceRunLog: builder.mutation({
      query: ({
        datasource_id,
        datasource_run_log_id,
        status,
        verified_data,
      }) => ({
        url: `datasource/sql/${datasource_id}/run-logs/${datasource_run_log_id}/verify/`,
        method: "PUT",
        body: {
          status,
          verified_data: {
            user_query: verified_data.user_query,
            final_steps_to_follow: verified_data.final_steps_to_follow,
            final_sql: verified_data.final_sql,
          },
        },
      }),
    }),

    addDatasourceRunAsExample: builder.mutation({
      query: ({ datasource_id, datasource_run_log_id }) => ({
        url: `datasource/sql/${datasource_id}/run-logs/${datasource_run_log_id}/add-as-example/`,
      }),
      method: "GET",
    }),
  }),
});

export const {
  useListExamplesInfoQuery,
  useGetExampleMutation,

  useDeleteExampleMutation,
  useBulkDownloadMutation,
  useUploadExamplesInBulkMutation,

  useGetDetailedSQLDatasourceRunLogMutation,
  useVerifySQLDatasourceRunLogMutation,
  useAddDatasourceRunAsExampleMutation,
} = sql_datasource;

export default sql_datasource;
