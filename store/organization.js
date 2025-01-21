import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "./base_query";

const organizationApi = createApi({
  reducerPath: "organizationApi",
  baseQuery: rawBaseQuery,
  endpoints: (builder) => ({
    getOrganization: builder.query({
      query: ({ organization_id }) => `organization/${organization_id}`,
    }),
    getOrganizationList: builder.query({
      query: () => "organization/",
    }),
    getInvitations: builder.mutation({
      query: ({ organization_id, skip, limit }) =>
        `organization/${organization_id}/invitations/?skip=${skip}&limit=${limit}`,
    }),
    getOrganizationMembers: builder.mutation({
      query: ({ organization_id, skip, limit }) =>
        `organization/${organization_id}/members/?skip=${skip}&limit=${limit}`,
    }),

    getOrganizationPreference: builder.mutation({
      query: ({ organization_id }) =>
        `organization/${organization_id}/preference/`,
    }),

    getOrgPreferenceOpenaiKey: builder.mutation({
      query: ({ organization_id }) => ({
        url: `organization/${organization_id}/preference/openai/get-api-key/`,
        method: "POST",
      }),
    }),

    getOrgPreferenceAzureOpenaiKey: builder.mutation({
      query: ({ organization_id }) => ({
        url: `organization/${organization_id}/preference/azure/get-api-key/`,
        method: "POST",
      }),
    }),

    getOrgPreferenceClaudeaiKey: builder.mutation({
      query: ({ organization_id }) => ({
        url: `organization/${organization_id}/preference/claudeai/get-api-key/`,
        method: "POST",
      }),
    }),

    getOrgPreferenceVertexaiKey: builder.mutation({
      query: ({ organization_id }) => ({
        url: `organization/${organization_id}/preference/vertexai/get-creds/`,
        method: "POST",
      }),
    }),
    createOrganization: builder.mutation({
      query: (payload) => ({
        url: `organization/`,
        method: "POST",
        body: payload,
      }),
    }),
    sendInvitation: builder.mutation({
      query: ({ payload, organization_id }) => ({
        url: `organization/${organization_id}/invite/`,
        method: "POST",
        body: payload,
      }),
    }),
    removeMember: builder.mutation({
      query: ({ organization_id, user_id }) => ({
        url: `organization/${organization_id}/members/${user_id}/`,
        method: "DELETE",
      }),
    }),
    deleteInviation: builder.mutation({
      query: ({ organization_id, invitation_id }) => ({
        url: `organization/${organization_id}/invitations/${invitation_id}`,
        method: "DELETE",
        body: {},
      }),
    }),
    updateOrganization: builder.mutation({
      query: ({ id, payload }) => ({
        url: `organization/${id}/`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateOrganizationName: builder.mutation({
      query: ({ payload, organization_id }) => ({
        url: `organization/${organization_id}/name/`,
        method: "PUT",
        body: payload,
      }),
    }),

    updateOpenaiPreference: builder.mutation({
      query: ({ payload, organization_id }) => ({
        url: `organization/${organization_id}/preference/openai/`,
        method: "PUT",
        body: payload,
      }),
    }),

    updateAzureOpenaiPreference: builder.mutation({
      query: ({ payload, organization_id }) => ({
        url: `organization/${organization_id}/preference/azure/`,
        method: "PUT",
        body: payload,
      }),
    }),

    updateClaudeaiPreference: builder.mutation({
      query: ({ payload, organization_id }) => ({
        url: `organization/${organization_id}/preference/claudeai/`,
        method: "PUT",
        body: payload,
      }),
    }),

    updateVertexaiPreference: builder.mutation({
      query: ({ payload, organization_id }) => ({
        url: `organization/${organization_id}/preference/vertexai/`,
        method: "PUT",
        body: payload,
      }),
    }),
    leaveOrganization: builder.mutation({
      query: ({ organization_id }) => ({
        url: `organization/${organization_id}/leave-organization/`,
        method: "DELETE",
      }),
    }),
    getOrganizationDetails: builder.query({
      query: ({ organization_id }) => ({
        url: `organization/${organization_id}/details/`,
      }),
    }),
  }),
});

export const {
  useGetOrganizationQuery,
  useGetOrganizationListQuery,
  useGetInvitationsMutation,
  useGetOrganizationMembersMutation,
  useCreateOrganizationMutation,
  useSendInvitationMutation,
  useDeleteInviationMutation,
  useRemoveMemberMutation,
  useUpdateOrganizationMutation,
  useUpdateOrganizationNameMutation,
  useUpdateOpenaiPreferenceMutation,
  useUpdateAzureOpenaiPreferenceMutation,
  useUpdateClaudeaiPreferenceMutation,
  useUpdateVertexaiPreferenceMutation,
  useGetOrgPreferenceAzureOpenaiKeyMutation,
  useGetOrgPreferenceOpenaiKeyMutation,
  useGetOrgPreferenceClaudeaiKeyMutation,
  useGetOrgPreferenceVertexaiKeyMutation,
  useGetOrganizationPreferenceMutation,
  useLeaveOrganizationMutation,
  useGetOrganizationDetailsQuery,
} = organizationApi;

export default organizationApi;
