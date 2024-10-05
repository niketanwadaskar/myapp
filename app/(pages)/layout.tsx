import ErrorBoundary from "@/components/coustom-compoent/ErrorBoundary";
import Navbar from "@/components/coustom-compoent/Navbar";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Navbar />
      {children}
    </ErrorBoundary>
  );
}
