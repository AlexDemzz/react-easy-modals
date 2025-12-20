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

export function useBeforeClose<R = unknown>(callback: (value?: R) => boolean) {
  const modal = useContext(ModalItemContext);

  if (!modal) {
    throw new Error("useBeforeClose must be called inside a modal component");
  }

  useEffect(() => {
    modal.onBeforeClose(callback as (value?: any) => boolean);
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
