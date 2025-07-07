import React from "react";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import LoadingOverlay from "@/app/Loading";

/**
 * Компонент-менеджер для отображения LoadingOverlay
 * Отделяет логику отображения от провайдера, избегая циклических зависимостей
 */
const LoadingManager: React.FC = () => {
  const { shouldShowLoading } = useGlobalLoading();
  
  if (!shouldShowLoading) {
    return null;
  }
  
  return <LoadingOverlay />;
};

export default LoadingManager;
