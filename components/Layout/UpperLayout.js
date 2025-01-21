import React, { useEffect, useState } from 'react';
import TopBanner from '../common/TopBanner';
import { useGetOrganizationListQuery } from '@/store/organization';
import { currentOrganizationSelector } from '@/store/current_organization';
import { useSelector } from "react-redux";


const UpperLayout = ({ children }) => {
  const [showTopBanner, setShowTopBanner] = useState(false);
  const currentOrg = useSelector(currentOrganizationSelector);

  const {
    refetch: refetchOrgs,
    data: organizationList,
    isLoading: orgsLoading,
    error: orgsError,
  } = useGetOrganizationListQuery();



  useEffect(() => {
    if (organizationList === undefined || !organizationList) {
      return;
    }

    let orgs = [];
    for (let j = 0; j < organizationList?.length; j++) {
      orgs.push({
        id: organizationList[j].id,
        name: organizationList[j].name,
        displayName: organizationList[j].displayName,
        attributes: organizationList[j].attributes,
      });
    }
  }, [organizationList]);

  useEffect(() => {
    if (!currentOrg || !organizationList) {
      return;
    }

    const currentOrganization = organizationList.find(org => org.id === currentOrg.id);

    if (currentOrganization && currentOrganization.attributes.membership_tier[0] === "free") {
      setShowTopBanner(true);
    } else {
      setShowTopBanner(false);
    }
  }, [currentOrg, organizationList]);

  const handleCloseTopBanner = () => {
    setShowTopBanner(false);
    sessionStorage.setItem("banner", true);
  };

  return (
    <div>
      {showTopBanner && <TopBanner onClose={handleCloseTopBanner} />}
      <div>{children}</div>
    </div>
  );
};

export default UpperLayout;
