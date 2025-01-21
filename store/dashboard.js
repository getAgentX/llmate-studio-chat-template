import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";
import { get } from "lodash";

const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getDashboardList: builder.mutation({
      query: ({ skip, limit, sort_by, query }) => ({
        url: `dashboard/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    // getDashboard: builder.mutation({
    //   query: ({ dashboard_id }) => ({
    //     url: `dashboard/${dashboard_id}/`,
    //   }),
    // }),
    getDashboard: builder.query({
      query: ({ dashboard_id }) => ({
        url: `dashboard/${dashboard_id}/`,
      }),
    }),
    // getWidgetData: builder.mutation({
    //   query: ({ dashboard_id, section_id, widget_id, skip, limit }) => ({
    //     url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/data/?skip=${skip}&limit=${limit}`,
    //   }),
    // }),

    getWidgetData: builder.query({
      query: ({ dashboard_id, section_id, widget_id, skip, limit }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/data/?skip=${skip}&limit=${limit}`,
      }),
    }),
    getBulkWidgetData: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id, skip, limit }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/data/?skip=${skip}&limit=${limit}`,
      }),
    }),
    getWidget: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/`,
      }),
    }),
    createNewDashboard: builder.mutation({
      query: ({ payload }) => ({
        url: `dashboard/`,
        method: "POST",
        body: payload,
      }),
    }),
    createNewSection: builder.mutation({
      query: ({ dashboard_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/`,
        method: "POST",
        body: payload,
      }),
    }),
    deleteDashboard: builder.mutation({
      query: ({ dashboard_id }) => ({
        url: `dashboard/${dashboard_id}/`,
        method: "DELETE",
        body: {},
      }),
    }),
    deleteSection: builder.mutation({
      query: ({ dashboard_id, section_id }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/`,
        method: "DELETE",
        body: {},
      }),
    }),
    deleteWidget: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/`,
        method: "DELETE",
      }),
    }),
    updateDashboardInfo: builder.mutation({
      query: ({ dashboard_id, payload }) => ({
        url: `dashboard/${dashboard_id}/info/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getSections: builder.mutation({
      query: ({ dashboard_id }) => ({
        url: `dashboard/${dashboard_id}/sections/`,
      }),
    }),
    getSectionsList: builder.query({
      query: ({ dashboard_id }) => ({
        url: `dashboard/${dashboard_id}/sections/`,
      }),
    }),
    updateSectionsInfo: builder.mutation({
      query: ({ dashboard_id, section_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/update-section-label/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    addWidgetFromMessage: builder.mutation({
      query: ({ dashboard_id, section_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/add-widget-from-message/`,
        method: "POST",
        body: payload,
      }),
    }),
    addWidgetFromDatasourceRun: builder.mutation({
      query: ({ dashboard_id, section_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/add-widget-from-datasource-run/`,
        method: "POST",
        body: payload,
      }),
    }),
    addWidgetFromSql: builder.mutation({
      query: ({ dashboard_id, section_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/add-widget-from-sql/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateWidgetInfo: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/update-widget-label/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    updateDashboardPublishedStatus: builder.mutation({
      query: ({ dashboard_id, payload }) => ({
        url: `dashboard/${dashboard_id}/published-status/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    addGraphConfig: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/add-graph-config/`,
        method: "PUT",
        body: payload,
      }),
    }),
    addVisualizationConfig: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/add-visualization-config/`,
        method: "PUT",
        body: payload,
      }),
    }),
    getGraph: builder.query({
      query: ({
        dashboard_id,
        section_id,
        widget_id,
        payload,
        skip,
        limit,
      }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/get-graph/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),

    updateWidgetsPosition: builder.mutation({
      query: ({ dashboard_id, section_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/update-widgets-position/`,
        method: "POST",
        body: payload,
      }),
    }),
    getRecentlyUsedDashboards: builder.query({
      query: () => ({
        url: `dashboard/recently-used-dashboards/`,
        method: "GET",
      }),
    }),
    getSection: builder.query({
      query: ({ dashboard_id, section_id }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/`,
        method: "GET",
      }),
    }),
    updateWidgetSql: builder.mutation({
      query: ({ dashboard_id, section_id, widget_id, payload }) => ({
        url: `dashboard/${dashboard_id}/sections/${section_id}/widgets/${widget_id}/update-widget-sql/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    generateEmbedLink: builder.mutation({
      query: ({ dashboard_id }) => ({
        url: `dashboard/${dashboard_id}/generate-embed-link/`,
        method: "PATCH",
      }),
    }),
    updateEmbededStatus: builder.mutation({
      query: ({ dashboard_id, payload }) => ({
        url: `dashboard/${dashboard_id}/embeded-status/`,
        method: "PATCH",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetDashboardListMutation,
  useGetDashboardQuery,
  useGetWidgetDataQuery,
  useGetBulkWidgetDataMutation,
  useGetWidgetMutation,
  useCreateNewDashboardMutation,
  useCreateNewSectionMutation,
  useDeleteDashboardMutation,
  useDeleteSectionMutation,
  useDeleteWidgetMutation,
  useUpdateDashboardInfoMutation,
  useGetSectionsMutation,
  useGetSectionsListQuery,
  useUpdateSectionsInfoMutation,
  useAddWidgetFromMessageMutation,
  useAddWidgetFromDatasourceRunMutation,
  useAddWidgetFromSqlMutation,
  useUpdateWidgetInfoMutation,
  useUpdateDashboardPublishedStatusMutation,
  useAddGraphConfigMutation,
  useAddVisualizationConfigMutation,
  useGetGraphQuery,
  useUpdateWidgetsPositionMutation,
  useGetRecentlyUsedDashboardsQuery,
  useGetSectionQuery,
  useUpdateWidgetSqlMutation,
  useGenerateEmbedLinkMutation,
  useUpdateEmbededStatusMutation,
} = dashboardApi;

export default dashboardApi;
