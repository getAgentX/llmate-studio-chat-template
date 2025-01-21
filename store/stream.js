import { createApi } from "@reduxjs/toolkit/query/react";
import { streamBaseQuery } from "./_stream_base_query";

const streamApi = createApi({
  reducerPath: "streamApi",
  baseQuery: streamBaseQuery,
  endpoints: (builder) => ({
    streamRunDatasource: builder.mutation({
      query: ({ datasource_id, payload }) => ({
        url: `datasource/${datasource_id}/run/`,
        method: "POST",
        body: payload,
      }),
    }),
    streamAssistantMessage: builder.mutation({
      query: ({ assistant_id, chat_id, payload }) => ({
        url: `assistant/${assistant_id}/chat/${chat_id}/send-message/`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "77826d4d-932e-450d-ab2b-8da7c4634787",
        },
      }),
    }),
  }),
});

export const {
  useStreamRunDatasourceMutation,
  useStreamAssistantMessageMutation,
} = streamApi;

export default streamApi;
