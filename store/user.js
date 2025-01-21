import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "./base_query";

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: rawBaseQuery,

  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: () => "me/",
    }),
  }),
  tagTypes: [],
});

export const { useGetUserInfoQuery } = userApi;
export default userApi;
