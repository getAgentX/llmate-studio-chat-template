import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getGraphEvent: builder.mutation({
      query: ({ message_id, event_id }) => ({
        url: `message/${message_id}/graph/${event_id}/`,
      }),
    }),
    updateDataVisualizationConfig: builder.mutation({
      query: ({ message_id, event_id, payload }) => ({
        url: `message/${message_id}/graph/${event_id}/update-data-visualization-config/`,
        method: "PUT",
        body: payload,
      }),
    }),
    getGraphMessage: builder.mutation({
      query: ({ message_id, event_id, payload, skip, limit }) => ({
        url: `message/${message_id}/graph/${event_id}/get-graph/?skip=${skip}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
    }),
    // getAssistantGraph: builder.query({
    //   query: ({ message_id, event_id, payload, skip, limit }) => ({
    //     url: `message/${message_id}/graph/${event_id}/get-graph/?skip=${skip}&limit=${limit}`,
    //     method: "POST",
    //     body: payload,
    //   }),
    // }),
    // refreshAssistantGraph: builder.query({
    //   query: ({ message_id, event_id, payload, skip, limit }) => ({
    //     url: `message/${message_id}/graph/${event_id}/refresh/?skip=${skip}&limit=${limit}`,
    //     method: "POST",
    //     body: payload,
    //   }),
    // }),
  }),
});

export const {
  useGetGraphEventMutation,
  useUpdateDataVisualizationConfigMutation,
  useGetGraphMessageMutation,
  // useGetAssistantGraphQuery,
  // useRefreshAssistantGraphQuery,
} = messageApi;

export default messageApi;
