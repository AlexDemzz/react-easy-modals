"use client";
import { createContext, useContext, useEffect } from "react";
import { ModalInstance } from "./types";

const ModalItemContext = createContext<ModalInstance | null>(null);

export function useModal() {
  const modal = useContext(ModalItemContext);

  if (!modal) {
    throw new Error("useModal must be called inside a modal component");
  }

  return modal;
}

export function useBeforeClose(callback: () => boolean) {
  const modal = useModal();

  useEffect(() => {
    modal.onBeforeClose(callback);
  }, [modal, callback]);
}

export function ModalItemProvider({
  modal,
  children,
}: {
  modal: ModalInstance;
  children: React.ReactNode;
}) {
  return (
    <ModalItemContext.Provider value={modal}>
      {children}
    </ModalItemContext.Provider>
  );
}
