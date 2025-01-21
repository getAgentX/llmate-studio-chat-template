import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const datasourceApi = createApi({
  reducerPath: "datasourceApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getDatasources: builder.mutation({
      query: ({ skip, limit, sort_by, query }) => ({
        url: `datasource/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    getDatasourcesList: builder.query({
      query: ({
        skip,
        limit,
        sort_by,
        ds_type,
        query,
        is_published = null,
      }) => {
        const params = new URLSearchParams({
          skip: skip.toString(),
          limit: limit.toString(),
          sort_by,
          query,
        });
        if (is_published !== null) {
          params.append("is_published", is_published.toString());
        }
        return {
          url: `datasource/?${params.toString()}`,
        };
      },
    }),

    getPrivateDatasourcesList: builder.query({
      query: ({ skip, limit, sort_by, ds_type, query }) => ({
        url: `datasource/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}&is_published=false`,
      }),
    }),
    createSqlDatasource: builder.mutation({
      query: ({ payload }) => ({
        url: `datasource/sql/`,
        method: "POST",
        body: payload,
      }),
    }),
    createSqlDatasourceSpreadsheet: builder.mutation({
      query: ({ payload }) => ({
        url: `datasource/sql/create-sql-datasource-spreadsheet/`,
        method: "POST",
        body: payload,
      }),
    }),
    getDbConnection: builder.mutation({
      query: ({ payload }) => ({
        url: `datasource/sql/db-connection/get-databases/`,
        method: "POST",
        body: payload,
      }),
    }),
    getDbConnectionList: builder.query({
      query: ({ payload }) => ({
        url: `datasource/sql/db-connection/get-databases/`,
        method: "POST",
        body: payload,
      }),
    }),
    getTablesConnection: builder.query({
      query: ({ payload }) => ({
        url: `datasource/sql/db-connection/get-tables/`,
        method: "POST",
        body: payload,
      }),
    }),
    getSqlDatasource: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/${datasource_id}/`,
      }),
    }),
    getDatasource: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/${datasource_id}/`,
      }),
    }),
    getDatasourceInfo: builder.query({
      query: ({ datasource_id }) => ({
        url: `datasource/${datasource_id}/`,
      }),
    }),
    getRecentlyUsedDatasources: builder.query({
      query: () => ({
        url: `datasource/recently-used-datasources/`,
        method: "GET",
      }),
    }),
    updateDatasourceInfo: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/${datasource_id}/info/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateDbConnection: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/db-connection/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateEmbeddingModel: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/example-embedding-model/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateSqlGenerator: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/sql-generator/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateSqlRegenerator: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/sql-regenerator/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateSqlValidator: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/sql-validator/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateTables: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/tables/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateTable: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/table/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateJoins: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/update-joins/`,
        method: "PUT",
        body: payload,
      }),
    }),
    getDatasourceRunsByID: builder.query({
      query: ({ datasource_id, skip, limit }) => ({
        url: `datasource/${datasource_id}/runs/?skip=${skip}&limit=${limit}`,
      }),
    }),

    getDatasourceRun: builder.mutation({
      query: ({ datasource_id, run_id }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/`,
      }),
    }),

    executeSqlQuery: builder.mutation({
      query: ({ datasource_id, skip = 0, limit = 10, payload }) => ({
        url: `datasource/${datasource_id}/execute-sql-query/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    executeSqlDatasourceQuery: builder.query({
      query: ({ datasource_id, skip = 0, limit = 10, payload }) => ({
        url: `datasource/${datasource_id}/execute-sql-query/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    addExampleToIndex: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/example/`,
        method: "POST",
        body: payload,
      }),
    }),
    updatePublishedStatus: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/${datasource_id}/published-status/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    stopDatasourceRun: builder.mutation({
      query: ({ datasource_id, run_id }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/stop/`,
        method: "POST",
      }),
    }),
    deleteDatasource: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/${datasource_id}/`,
        method: "DELETE",
      }),
    }),
    refreshDatasourceGraphEvent: builder.mutation({
      query: ({ datasource_id, run_id, event_id }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/graph/${event_id}/refresh/`,
        method: "POST",
      }),
    }),
    uploadSpreadsheetTemp: builder.mutation({
      query: (payload) => ({
        url: `datasource/sql/spreadsheet/upload-temp/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateSpreadsheet: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/spreadsheet/update/`,
        method: "POST",
        body: payload,
      }),
    }),
    getDownloadSpreadsheet: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/sql/${datasource_id}/spreadsheet/download/`,
      }),
    }),
    getDatasourceGraph: builder.query({
      query: ({ datasource_id, run_id, event_id, skip, limit, payload }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/graph/${event_id}/get-graph/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    autofillWithAi: builder.mutation({
      query: ({ payload }) => ({
        url: `datasource/sql/load-values-and-autofill-with-ai/`,
        method: "POST",
        body: payload,
      }),
    }),
    getDataGraph: builder.query({
      query: ({ datasource_id, run_id, event_id, skip, limit, payload }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/graph/${event_id}/get-graph/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    getGraphFor: builder.query({
      query: ({ datasource_id, skip, limit, payload }) => ({
        url: `datasource/${datasource_id}/get-graph-for-query/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    refreshGraphEvent: builder.query({
      query: ({ datasource_id, run_id, event_id, skip, limit, payload }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/graph/${event_id}/refresh/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    csvRefreshGraphEvent: builder.mutation({
      query: ({ datasource_id, run_id, event_id, skip, limit, payload }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/graph/${event_id}/refresh/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    updateDatasourceVisualizationConfig: builder.mutation({
      query: ({ datasource_id, run_id, event_id, payload }) => ({
        url: `datasource/${datasource_id}/run/${run_id}/graph/${event_id}/update-data-visualization-config/`,
        method: "PUT",
        body: payload,
      }),
    }),
    getDatasourceDbConnection: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/sql/${datasource_id}/get-db-connection/`,
        method: "POST",
      }),
    }),
    getDatasourcesDbQuery: builder.query({
      query: ({ datasource_id }) => ({
        url: `datasource/sql/${datasource_id}/get-db-connection/`,
        method: "POST",
      }),
    }),
    getDatasourcesTables: builder.query({
      query: ({ skip, limit, sort_by, ds_type, query, payload }) => ({
        url: `datasource/?skip=${skip}&limit=${limit}&sort_by=${sort_by}${
          ds_type ? `&ds_type=${ds_type}` : ""
        }&query=${query}`,
        method: "GET",
        // body: payload,
      }),
    }),
    validateFormula: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/validate-formula/`,
        method: "POST",
        body: payload,
      }),
    }),
    addNewConcept: builder.mutation({
      query: ({ datasource_id, table_name, payload }) => ({
        url: `datasource/sql/${datasource_id}/concept/${table_name}/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateConcept: builder.mutation({
      query: ({ datasource_id, table_name, payload }) => ({
        url: `datasource/sql/${datasource_id}/concept/${table_name}/`,
        method: "PUT",
        body: payload,
      }),
    }),
    removeConcept: builder.mutation({
      query: ({ datasource_id, table_name, payload }) => ({
        url: `datasource/sql/${datasource_id}/concept/${table_name}/`,
        method: "DELETE",
        body: payload,
      }),
    }),
    getPreviewTable: builder.query({
      query: ({ datasource_id, skip, limit, payload }) => ({
        url: `datasource/sql/${datasource_id}/preview-table/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    getPreviewThirdPartyTable: builder.query({
      query: ({ datasource_id, skip, limit, payload }) => ({
        url: `datasource/third-party/${datasource_id}/preview-table/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    getTableSchema: builder.query({
      query: ({ datasource_id, database_name }) => ({
        url: `datasource/sql/${datasource_id}/get-table-schema/${database_name}/`,
      }),
    }),
    getTableSchemaForDb: builder.query({
      query: ({ datasource_id, database_name, payload }) => ({
        url: `datasource/sql/${datasource_id}/get-table-schema-for-db-connection/${database_name}/`,
        method: "POST",
        body: payload,
      }),
    }),
    getDatabasesForDatasource: builder.query({
      query: ({ datasource_id }) => ({
        url: `datasource/sql/${datasource_id}/get-databases-for-datasource/`,
      }),
    }),
    updateExampleIndex: builder.mutation({
      query: ({ datasource_id, source_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/example/${source_id}/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateSemiStructuredColumns: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/semi-structured/${datasource_id}/update-multiple-columns/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateDatabaseConnection: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/sql/${datasource_id}/update-database-connection/`,
        method: "PUT",
        body: payload,
      }),
    }),
    listExamples: builder.mutation({
      query: ({ datasource_id, skip, limit, sort_by, query }) => ({
        url: `datasource/sql/${datasource_id}/example/list/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    getUserLevelList: builder.query({
      query: ({ connector_type }) => ({
        url: `datasource/third-party/${connector_type}/get-user-level-accounts-usage/`,
      }),
    }),
    getOrgLevelList: builder.query({
      query: ({ connector_type }) => ({
        url: `datasource/third-party/${connector_type}/get-org-level-accounts-usage/`,
      }),
    }),
    getAllUserLevelAccounts: builder.query({
      query: ({}) => ({
        url: `datasource/third-party/get-user-level-accounts/`,
      }),
    }),
    getAllOrgLevelAccounts: builder.query({
      query: ({}) => ({
        url: `datasource/third-party/get-org-level-accounts/`,
      }),
    }),
    getSQLDatasourceRunLogs: builder.mutation({
      query: ({
        datasource_id,
        start_date,
        end_date,
        verification_status,
        skip,
        limit,
        query,
        highest_confidence_score_gte,
        highest_confidence_score_lte,
        run_status,
      }) => {
        const params = new URLSearchParams();

        if (start_date) params.append("start_date", start_date);
        if (end_date) params.append("end_date", end_date);
        if (verification_status)
          params.append("verification_status", verification_status);
        if (skip !== undefined) params.append("skip", skip);
        if (limit !== undefined) params.append("limit", limit);
        if (query !== undefined && query.trim() !== "")
          params.append("query", query);
        if (
          highest_confidence_score_gte !== undefined &&
          (highest_confidence_score_gte !== 0 ||
            highest_confidence_score_lte !== 100)
        ) {
          params.append(
            "highest_confidence_score_gte",
            highest_confidence_score_gte
          );
        }
        if (
          highest_confidence_score_lte !== undefined &&
          (highest_confidence_score_gte !== 0 ||
            highest_confidence_score_lte !== 100)
        ) {
          params.append(
            "highest_confidence_score_lte",
            highest_confidence_score_lte
          );
        }
        if (run_status !== null && run_status !== undefined)
          params.append("run_status", run_status);

        return {
          url: `datasource/sql/${datasource_id}/run-logs/?${params.toString()}`,
        };
      },
    }),
    getConnectorsStatus: builder.query({
      query: ({}) => ({
        url: `datasource/third-party/get-connectors-status/`,
      }),
    }),
    getAllProperties: builder.query({
      query: ({ connector_type, skip, limit }) => ({
        url: `datasource/third-party/${connector_type}/get-all-properties/?skip=${skip}&limit=${limit}`,
      }),
    }),
    createThirdPartyDatasource: builder.mutation({
      query: ({ connector_type, payload }) => ({
        url: `datasource/third-party/${connector_type}/create-third-party-datasource/`,
        method: "post",
        body: payload,
      }),
    }),
    getSupportedConnectors: builder.query({
      query: ({}) => ({
        url: `datasource/third-party/get-supported-connectors/`,
      }),
    }),
    getTableLevelInfo: builder.query({
      query: ({ datasource_id }) => ({
        url: `datasource/third-party/${datasource_id}/get-table-level-info/`,
      }),
    }),
    getThirdPartyJoins: builder.query({
      query: ({ connector_type }) => ({
        url: `datasource/third-party/${connector_type}/get-joins/`,
      }),
    }),
    listThirdPartyExamples: builder.mutation({
      query: ({ datasource_id, skip, limit, sort_by, query }) => ({
        url: `datasource/third-party/${datasource_id}/example/list/?skip=${skip}&limit=${limit}&query=${query}`,
      }),
    }),
    updateThirdPartySqlGenerator: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/third-party/${datasource_id}/sql-generator/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateThirdPartySqlRegenerator: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/third-party/${datasource_id}/sql-regenerator/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateThirdPartySqlValidator: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/third-party/${datasource_id}/sql-validator/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateSource: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/third-party/${datasource_id}/update-source/`,
        method: "POST",
        body: payload,
      }),
    }),
    bulkThirdPartyDownload: builder.mutation({
      query: ({ datasource_id }) => ({
        url: `datasource/third-party/${datasource_id}/example/bulk-download/`,
      }),
    }),
    accountsPermission: builder.query({
      query: ({ datasource_id, skip, limit }) => ({
        url: `datasource/third-party/${datasource_id}/accounts-permission/?skip=${skip}&limit=${limit}`,
      }),
    }),
    getPublishedDatasources: builder.query({
      query: ({ skip, limit, sort_by, query, is_published }) => ({
        url: `datasource/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}&is_published=${is_published}`,
      }),
    }),
    updateDatasourceSampleQuestions: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/${datasource_id}/update-sample-questions/`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetDatasourcesMutation,
  useGetDatasourcesListQuery,
  useGetPrivateDatasourcesListQuery,
  useCreateSqlDatasourceMutation,
  useCreateSqlDatasourceSpreadsheetMutation,
  useGetDbConnectionMutation,
  useGetDbConnectionListQuery,
  useGetTablesConnectionQuery,
  useGetDatasourceMutation,
  useGetDatasourceInfoQuery,
  useGetRecentlyUsedDatasourcesQuery,
  useUpdateDatasourceInfoMutation,
  useUpdatePublishedStatusMutation,
  useUpdateDbConnectionMutation,
  useUpdateEmbeddingModelMutation,
  useUpdateSqlGeneratorMutation,
  useUpdateSqlRegeneratorMutation,
  useUpdateSqlValidatorMutation,
  useUpdateTablesMutation,
  useUpdateTableMutation,
  useUpdateJoinsMutation,
  useGetDatasourceRunMutation,
  useGetDatasourceRunsByIDQuery,
  useExecuteSqlQueryMutation,
  useExecuteSqlDatasourceQueryQuery,
  useAddExampleToIndexMutation,
  useStopDatasourceRunMutation,
  useDeleteDatasourceMutation,
  useRefreshDatasourceGraphEventMutation,
  useGetSqlDatasourceMutation,
  useUploadSpreadsheetTempMutation,
  useUpdateSpreadsheetMutation,
  useGetDownloadSpreadsheetMutation,
  useGetDatasourceGraphQuery,
  useGetDataGraphQuery,
  useGetGraphForQuery,
  useRefreshGraphEventQuery,
  useCsvRefreshGraphEventMutation,
  useUpdateDatasourceVisualizationConfigMutation,
  useAutofillWithAiMutation,
  useGetDatasourceDbConnectionMutation,
  useGetDatasourcesDbQueryQuery,
  useGetDatasourcesTablesQuery,
  useValidateFormulaMutation,
  useAddNewConceptMutation,
  useUpdateConceptMutation,
  useRemoveConceptMutation,
  useUpdateSemiStructuredColumnsMutation,
  useGetPreviewTableQuery,
  useGetPreviewThirdPartyTableQuery,
  useUpdateExampleIndexMutation,
  useListExamplesMutation,
  useGetSQLDatasourceRunLogsMutation,
  useGetTableSchemaQuery,
  useGetTableSchemaForDbQuery,
  useUpdateDatabaseConnectionMutation,
  useGetUserLevelListQuery,
  useGetOrgLevelListQuery,
  useGetAllUserLevelAccountsQuery,
  useGetAllOrgLevelAccountsQuery,
  useGetDatabasesForDatasourceQuery,
  useGetConnectorsStatusQuery,
  useGetSupportedConnectorsQuery,
  useGetAllPropertiesQuery,
  useCreateThirdPartyDatasourceMutation,
  useGetTableLevelInfoQuery,
  useGetThirdPartyJoinsQuery,
  useListThirdPartyExamplesMutation,
  useUpdateThirdPartySqlGeneratorMutation,
  useUpdateThirdPartySqlRegeneratorMutation,
  useUpdateThirdPartySqlValidatorMutation,
  useBulkThirdPartyDownloadMutation,
  useUpdateSourceMutation,
  useAccountsPermissionQuery,
  useGetPublishedDatasourcesQuery,
  useUpdateDatasourceSampleQuestionsMutation,
} = datasourceApi;

export default datasourceApi;
