"use client";
import { createContext, ReactNode, useContext, ReactElement } from "react";
import { ModalManager } from "./types";
import { useModalManager } from "./use-modal-manager";
import { ModalItemProvider } from "./item-context";

interface ModalProviderProps {
  children: ReactNode;
  backdrop?: (modals: ModalManager) => ReactElement | null;
  loading?: () => ReactElement | null;
}

const ModalContext = createContext<ModalManager | null>(null);

export function ModalProvider({
  children,
  backdrop,
  loading,
}: ModalProviderProps) {
  const modalManager = useModalManager();

  return (
    <ModalContext.Provider value={modalManager}>
      {children}
      <Modals backdrop={backdrop} loading={loading} />
    </ModalContext.Provider>
  );
}

interface ModalsProps {
  backdrop?: (modals: ModalManager) => ReactElement | null;
  loading?: () => ReactElement | null;
}

function Modals({ backdrop, loading }: ModalsProps) {
  const modalManager = useModals();
  const { stack, isLoading } = modalManager;

  return (
    <>
      {isLoading && loading && loading()}
      {stack.map((modal) => {
        return (
          <ModalItemProvider key={modal.id} modal={modal}>
            <modal.component
              data={modal.data}
              close={modal.close}
              isOpen={modal.isOpen}
              id={modal.id}
              index={modal.index}
            />
          </ModalItemProvider>
        );
      })}
      {stack.length > 0 && backdrop && backdrop(modalManager)}
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
