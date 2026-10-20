"use client";

import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load your shipments. Please verify your connection or try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="p-8 text-center rounded-3xl bg-red-50/70 backdrop-blur-xl border border-red-200/80 max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-900">{title}</h3>
      <p className="text-xs text-red-700 mt-1 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-red-300 text-red-800 hover:bg-red-100/50">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
