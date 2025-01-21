import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const apiUserApi = createApi({
  reducerPath: "apiUserApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    createApiUser: builder.mutation({
      query: ({ payload }) => ({
        url: `api_user/`,
        method: "POST",
        body: payload,
      }),
    }),
    listApiUsers: builder.query({
      query: ({}) => ({
        url: `api_user/`,
      }),
    }),
    deleteApiUser: builder.mutation({
      query: ({ api_user_id }) => ({
        url: `api_user/${api_user_id}/`,
        method: "DELETE",
      }),
    }),
    getApiKey: builder.mutation({
      query: ({ api_user_id }) => ({
        url: `api_user/${api_user_id}/get-key/`,
        method: "POST",
      }),
    }),
    updateApiKeyLabel: builder.mutation({
      query: ({ api_user_id, payload }) => ({
        url: `api_user/${api_user_id}/update-label/`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
});

export const {
  useCreateApiUserMutation,
  useListApiUsersQuery,
  useDeleteApiUserMutation,
  useGetApiKeyMutation,
  useUpdateApiKeyLabelMutation,
} = apiUserApi;

export default apiUserApi;
