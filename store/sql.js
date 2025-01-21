import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const sqlApi = createApi({
  reducerPath: "sqlApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({}),
});

export const {} = sqlApi;

export default sqlApi;
