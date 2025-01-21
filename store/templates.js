import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base_query";

const templatesApi = createApi({
    reducerPath: "templatesApi",
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        exploreTemplates: builder.query({
            query: ({}) => ({
                url: `templates/`,
            }),
        }),
    }),
});

export const {
    useExploreTemplatesQuery
} = templatesApi;

export default templatesApi;