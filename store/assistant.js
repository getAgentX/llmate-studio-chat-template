import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
});

const assistantApi = createApi({
  reducerPath: "assistantApi",
  baseQuery: rawBaseQuery,
  endpoints: (builder) => ({
    createAssistant: builder.mutation({
      query: ({ payload }) => ({
        url: `assistant/`,
        method: "POST",
        body: payload,
      }),
    }),
    deleteAssistant: builder.mutation({
      query: ({ assistant_id }) => ({
        url: `assistant/${assistant_id}/`,
        method: "DELETE",
      }),
    }),
    getAssistant: builder.mutation({
      query: ({ assistant_id }) => ({
        url: `assistant/${assistant_id}/`,
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
        },
      }),
    }),
    getAssistantInfo: builder.query({
      query: ({ assistant_id }) => ({
        url: `assistant/${assistant_id}/`,
      }),
    }),
    getRecentlyUsedAssistants: builder.query({
      query: () => ({
        url: `assistant/recently-used-assistants/`,
        method: "GET",
      }),
    }),
    updateAssistantInfo: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/info/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateLlmAssistant: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/stage/default/llm/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateStageInstructions: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/stage/default/instructions/`,
        method: "PUT",
        body: payload,
      }),
    }),
    createSQLDatasourceRouting: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/stage/default/add-sql-datasource/`,
        method: "POST",
        body: payload,
      }),
    }),

    createSemiStructuredDatasourceRouting: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/stage/default/add-semi-structured-datasource/`,
        method: "POST",
        body: payload,
      }),
    }),
    removeDatasourceRouting: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/stage/default/remove-sql-datasource/`,
        method: "DELETE",
        body: payload,
      }),
    }),
    getAssistantsList: builder.mutation({
      query: ({ skip, limit, sort_by, query }) => ({
        url: `assistant/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    getAssistants: builder.query({
      query: ({ skip, limit, sort_by, query }) => ({
        url: `assistant/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}`,
      }),
    }),
    createChat: builder.mutation({
      query: ({ assistant_id }) => ({
        url: `assistant/${assistant_id}/chat/`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
        },
      }),
    }),
    getMessageById: builder.mutation({
      query: ({ assistant_id, message_id }) => ({
        url: `assistant/${assistant_id}/message/${message_id}/`,
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
        },
      }),
    }),
    getChatById: builder.query({
      query: ({ assistant_id, chat_id }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/`,
      }),
    }),
    getChatThread: builder.mutation({
      query: ({ assistant_id, chat_id, skip, limit, sort_by }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/thread/?skip=${skip}&limit=${limit}&sort_by=${sort_by}`,
      }),
    }),
    getChatThreadQuery: builder.query({
      query: ({ assistant_id, chat_id, skip, limit, sort_by }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/thread/?skip=${skip}&limit=${limit}&sort_by=${sort_by}`,
      }),
    }),
    getChatThreadAssistantAccess: builder.mutation({
      query: ({ assistant_id, chat_id }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/thread/assistant-access/`,
      }),
    }),
    updateChatLabel: builder.mutation({
      query: ({ assistant_id, chat_id, payload }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/label/`,
        method: "PUT",
        body: payload,
      }),
    }),
    getChats: builder.mutation({
      query: ({ assistant_id, skip, limit }) => ({
        url: `assistant/${assistant_id}/chat/?skip=${skip}&limit=${limit}`,
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
        },
      }),
    }),

    getAllChats: builder.mutation({
      query: ({ assistant_id, skip, limit }) => ({
        url: `assistant/${assistant_id}/all-chats/?skip=${skip}&limit=${limit}`,
      }),
    }),

    getChatsInfo: builder.query({
      query: ({ assistant_id, skip, limit }) => ({
        url: `assistant/${assistant_id}/chat/?skip=${skip}&limit=${limit}`,
      }),
    }),

    getAllChatsList: builder.query({
      query: ({ assistant_id, skip, limit }) => ({
        url: `assistant/${assistant_id}/all-chats/?skip=${skip}&limit=${limit}`,
      }),
    }),

    updatePublishedAssistantStatus: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/published-status/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    stopMessageResponse: builder.mutation({
      query: ({ assistant_id, message_id }) => ({
        url: `assistant/${assistant_id}/message/${message_id}/stop/`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
        },
      }),
    }),
    getDatasourcesList: builder.mutation({
      query: ({ assistant_id }) => ({
        url: `assistant/${assistant_id}/stage/default/list-datasources/`,
      }),
    }),
    getDatasourcesListInfo: builder.query({
      query: ({ assistant_id }) => ({
        url: `assistant/${assistant_id}/stage/default/list-datasources/`,
      }),
    }),
    userFeedback: builder.mutation({
      query: ({ message_id, payload }) => ({
        url: `message/${message_id}/feedback/`,
        method: "POST",
        body: payload,
      }),
    }),
    refreshAssistantGraphEvent: builder.mutation({
      query: ({ message_id, event_id, skip = 0, limit = 100 }) => ({
        url: `message/${message_id}/graph/${event_id}/refresh//?skip=${skip}&limit=${limit}`,
        method: "POST",
      }),
    }),
    getAssistantGraph: builder.query({
      query: ({ message_id, event_id, payload, skip, limit }) => ({
        url: `message/${message_id}/graph/${event_id}/get-graph/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    refreshAssistantGraph: builder.query({
      query: ({ message_id, event_id, payload, skip, limit }) => ({
        url: `message/${message_id}/graph/${event_id}/refresh/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    addMultipleDatasourceRouting: builder.mutation({
      query: ({ assistant_id, stage, payload }) => ({
        url: `assistant/${assistant_id}/stage/${stage}/add-multiple-datasource-routing/`,
        method: "POST",
        body: payload,
      }),
    }),
    getDatasourceDetails: builder.query({
      query: ({ assistant_id, stage, datasource_id }) => ({
        url: `assistant/${assistant_id}/stage/${stage}/datasource-details/${datasource_id}/`,
      }),
    }),
    addStageSqlDatasourceRouting: builder.mutation({
      query: ({ assistant_id, stage, payload }) => ({
        url: `assistant/${assistant_id}/stage/${stage}/add-sql-datasource/`,
        method: "POST",
        body: payload,
      }),
    }),
    addStageSemiStructuredDatasourceRouting: builder.mutation({
      query: ({ assistant_id, stage, payload }) => ({
        url: `assistant/${assistant_id}/stage/${stage}/add-semi-structured-datasource/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateStageLlmAndInstructions: builder.mutation({
      query: ({ assistant_id, stage, payload }) => ({
        url: `assistant/${assistant_id}/stage/${stage}/update-llm-and-info/`,
        method: "PUT",
        body: payload,
      }),
    }),
    getPublishedAssistantsList: builder.query({
      query: ({ skip, limit, sort_by, query, is_published }) => ({
        url: `assistant/?skip=${skip}&limit=${limit}&sort_by=${sort_by}&query=${query}&is_published=${is_published}`,
      }),
    }),
    updateSampleQuestions: builder.mutation({
      query: ({ assistant_id, payload }) => ({
        url: `assistant/${assistant_id}/update-sample-questions/`,
        method: "PUT",
        body: payload,
      }),
    }),
    generateFollowUpQuestions: builder.query({
      query: ({ assistant_id, chat_id, skip, limit }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/generate-follow-up-questions/?skip=${skip}&limit=${limit}`,
      }),
    }),
  }),
});

export const {
  useCreateAssistantMutation,
  useDeleteAssistantMutation,
  useGetAssistantMutation,
  useGetAssistantInfoQuery,
  useGetRecentlyUsedAssistantsQuery,
  useUpdateAssistantInfoMutation,
  useUpdateLlmAssistantMutation,
  useUpdateStageInstructionsMutation,
  useCreateSQLDatasourceRoutingMutation,
  useCreateSemiStructuredDatasourceRoutingMutation,
  useRemoveDatasourceRoutingMutation,
  useGetAssistantsListMutation,
  useGetAssistantsQuery,
  useCreateChatMutation,
  useGetMessageByIdMutation,
  useGetChatByIdQuery,
  useGetChatThreadMutation,
  useGetChatThreadQueryQuery,
  useGetChatsInfoQuery,
  useGetChatThreadAssistantAccessMutation,
  useGetChatsMutation,
  useGetAllChatsMutation,
  useGetAllChatsListQuery,
  useUpdatePublishedAssistantStatusMutation,
  useStopMessageResponseMutation,
  useGetDatasourcesListMutation,
  useGetDatasourcesListInfoQuery,
  useUserFeedbackMutation,
  useRefreshAssistantGraphEventMutation,
  useGetAssistantGraphQuery,
  useRefreshAssistantGraphQuery,
  useUpdateChatLabelMutation,
  useAddMultipleDatasourceRoutingMutation,
  useGetDatasourceDetailsQuery,
  useAddStageSqlDatasourceRoutingMutation,
  useAddStageSemiStructuredDatasourceRoutingMutation,
  useUpdateStageLlmAndInstructionsMutation,
  useGetPublishedAssistantsListQuery,
  useUpdateSampleQuestionsMutation,
  useGenerateFollowUpQuestionsQuery,
} = assistantApi;

export default assistantApi;
