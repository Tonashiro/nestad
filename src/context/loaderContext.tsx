"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";

interface LoaderContextProps {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  withDelay: boolean;
  setWithDelay: (delay: boolean) => void;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

/**
 * LoaderProvider - Provides global loading state
 */
export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [withDelay, setWithDelay] = useState(true);
  const [isReady, setIsReady] = useState(!withDelay);

  useEffect(() => {
    if (isLoading) {
      if (withDelay) {
        setIsReady(false);
        const timeout = setTimeout(() => {
          setIsReady(true);
        }, 3000);
        return () => clearTimeout(timeout);
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, withDelay]);

  return (
    <LoaderContext.Provider
      value={{ isLoading, setLoading, withDelay, setWithDelay }}
    >
      {isLoading && !isReady ? <Loader /> : children}
    </LoaderContext.Provider>
  );
};

/**
 * useLoader - Hook for accessing the LoaderContext
 */
export const useLoader = (): LoaderContextProps => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

/**
 * Loader Component - Displays a loading spinner
 */
export const Loader: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen w-screen">
    <Bars
      height="80"
      width="80"
      color="hsl(var(--monad-purple))"
      ariaLabel="bars-loading"
      visible={true}
    />
  </div>
);
