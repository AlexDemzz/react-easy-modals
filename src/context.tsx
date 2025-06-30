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
      <Modals />
    </ModalContext.Provider>
  );
}

function Modals() {
  const { stack } = useModals();
  return (
    <>
      {stack.map((modal, index) => {
        return (
          <modal.component
            key={`modal-${modal.id}-${index}`}
            data={modal.data}
            close={(v: any) => modal.close(v)}
            isOpen={modal.isOpen}
            id={modal.id}
            index={index}
            setBeforeClose={modal.setBeforeClose}
          />
        );
      })}
    </>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
