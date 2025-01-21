import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getApps: builder.query({
      query: () => "app/?skip=0&limit=100",
    }),
    getAppsHome: builder.query({
      query: () => "app/?skip=0&limit=2",
    }),
    getAddableAppsForSkill: builder.query({
      query: () => "app/?skip=0&limit=100",
    }),
    getAddableAppsForDatasource: builder.query({
      query: () => "app/?skip=0&limit=100",
    }),
    createApp: builder.mutation({
      query: (payload) => {
        let llm = {
          model_name: "openai_gpt_35",
          deployment_name: null,
          variant: "16k",
          temperature: 0,
          max_new_tokens: 1000,
        };
        payload.llm = llm;
        payload.router_llm = llm;
        payload.router_prompt = "";
        payload.chat_history_length = 8;
        return {
          url: "app/",
          method: "POST",
          body: payload,
        };
      },
    }),
    getApp: builder.query({
      query: (id) => `app/${id}/`,
    }),
    updateApp: builder.mutation({
      query: ({ id, payload }) => ({
        url: `app/${id}/`,
        method: "PUT",
        body: payload,
      }),
    }),
    deleteApp: builder.mutation({
      query: (id) => ({
        url: `app/${id}/`,
        method: "DELETE",
      }),
    }),
    addSkill: builder.mutation({
      query: ({ appId, skillId }) => ({
        url: `app/${appId}/add-skill/`,
        method: "POST",
        body: { skill_id: skillId },
      }),
    }),
    removeSkill: builder.mutation({
      query: ({ appId, skillId }) => ({
        url: `app/${appId}/remove-skill/`,
        method: "POST",
        body: { skill_id: skillId },
      }),
    }),
    addDatasource: builder.mutation({
      query: ({ appId, datasourceId }) => ({
        url: `app/${appId}/add-datasource/`,
        method: "POST",
        body: { datasource_id: datasourceId },
      }),
    }),
    updateUseAgentOnly: builder.mutation({
      query: ({ appId, use_agent_only }) => ({
        url: `app/${appId}/update-use-agent-only/`,
        method: "PUT",
        body: { use_agent_only: use_agent_only },
      }),
    }),
    removeDatasource: builder.mutation({
      query: ({ appId, datasourceId }) => ({
        url: `app/${appId}/remove-datasource/`,
        method: "POST",
        body: { datasource_id: datasourceId },
      }),
    }),
    enableInternet: builder.mutation({
      query: (id) => ({
        url: `app/${id}/enable-internet/`,
        method: "POST",
      }),
    }),
    disableInternet: builder.mutation({
      query: (id) => ({
        url: `app/${id}/disable-internet/`,
        method: "POST",
      }),
    }),
    updateDescription: builder.mutation({
      query: ({ id, description }) => ({
        url: `app/${id}/description/`,
        method: "PUT",
        body: { description: description },
      }),
    }),
  }),
});

export const {
  useGetAppsQuery,
  useGetAppsHomeQuery,
  useCreateAppMutation,
  useGetAppQuery,
  useUpdateAppMutation,
  useDeleteAppMutation,
  useGetAddableAppsForSkillQuery,
  useGetAddableAppsForDatasourceQuery,
  useAddSkillMutation,
  useRemoveSkillMutation,
  useEnableInternetMutation,
  useDisableInternetMutation,
  useUpdateDescriptionMutation,
  useAddDatasourceMutation,
  useRemoveDatasourceMutation,
  useUpdateUseAgentOnlyMutation,
} = appApi;

export default appApi;
