import React from "react";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import LoadingOverlay from "@/app/Loading";

const LoadingManager: React.FC = () => {
  const { shouldShowLoading } = useGlobalLoading();

  if (!shouldShowLoading) {
    return null;
  }

  return <LoadingOverlay />;
};

export default LoadingManager;
