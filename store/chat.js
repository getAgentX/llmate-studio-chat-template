import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQuery,

  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: ({ app_share_id }) => ({
        url: `${app_share_id}/chat/create-chat/`,
        method: "POST",
      }),
    }),

    appInfo: builder.query({
      query: ({ app_share_id, app_run_id }) =>
        `${app_share_id}/app-run/${app_run_id}/get-app-run/`,
    }),

    chatThreads: builder.query({
      query: ({ app_share_id, skip, limit }) =>
        `${app_share_id}/chat/chat-threads/?skip=${skip}&limit=${limit}`,
    }),

    getChatsThread: builder.mutation({
      query: ({ app_share_id, chat_id, skip, limit }) =>
        `${app_share_id}/chat/${chat_id}/thread/?skip=${skip}&limit=${limit}`,
    }),

    getMessage: builder.mutation({
      query: ({ app_share_id, message_id }) =>
        `${app_share_id}/chat/message/${message_id}/`,
    }),
  }),
  tagTypes: [],
});

export const {
  useCreateChatMutation,
  useAppInfoQuery,
  useChatThreadsQuery,
  useGetChatsThreadMutation,
  useGetMessageMutation,
} = chatApi;
export default chatApi;
