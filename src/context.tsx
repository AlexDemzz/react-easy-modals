"use client";
import { createContext, ReactNode, useContext } from "react";
import { ModalManager } from "./types";
import { useModalManager } from "./use-modal-manager";

const ModalContext = createContext<ModalManager | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const modalManager = useModalManager();

  return (
    <ModalContext.Provider value={modalManager}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
