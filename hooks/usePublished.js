import { useEffect, useState } from "react";

function usePublished(
  currentOrg = null,
  organization_id = null,
  published = false
) {
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (organization_id !== currentOrg?.id && published === true) {
      setIsPublished(true);
    } else {
      setIsPublished(false);
    }
  }, [currentOrg, organization_id, published]);

  return isPublished;
}

export default usePublished;
