import { useEffect, useState } from "react";
import { useGetOrganizationPreferenceMutation, useGetOrganizationListQuery } from "@/store/organization";
import { useSelector } from "react-redux";
import { currentOrganizationSelector } from "@/store/current_organization";

const organizationPreferences = () => {
  const currentOrg = useSelector(currentOrganizationSelector);
  const [getOrganizationPreference] = useGetOrganizationPreferenceMutation();
  const { data: organizationList, isLoading: orgsLoading, error: orgsError } = useGetOrganizationListQuery();
  const [states, setStates] = useState({
    openai: false,
    claudeai: false,
    vertexai: false,
    azure_openai: false,
  });

  useEffect(() => {
    if (organizationList) {
      const currentOrganization = organizationList.find((org) => org.id === currentOrg.id);

      if (currentOrganization?.attributes?.membership_tier.includes("enterprise")) {
        setStates({
          openai: true,
          claudeai: true,
          vertexai: true,
          azure_openai: true,
        });
      } else if (currentOrganization?.attributes?.membership_tier.includes("free")) {
        fetchEnabledStates(currentOrg.id);
      }
    }
  }, [currentOrg, organizationList]);

  const fetchEnabledStates = async (orgId) => {
    try {
      const { data } = await getOrganizationPreference({ organization_id: orgId });
      if (data) {
        const newState = {
          openai: data.openai_preference?.openai_key_enabled || false,
          claudeai: data.claudeai_preference?.anthropic_key_enabled || false,
          vertexai: data.vertexai_preference?.vertex_creds_enabled || false,
          azure_openai: data.azure_openai_preference?.azure_openai_key_enabled || false,
        };
        setStates(newState);
      }
    } catch (error) {
      console.error("Error fetching organization preferences", error);
    }
  };

  return {
    states,
    orgsLoading,
    orgsError,
  };
};

export default organizationPreferences;
