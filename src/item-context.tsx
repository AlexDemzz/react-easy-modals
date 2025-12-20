import { createContext, useContext, useEffect } from "react";
import { InternalModalInstanceItem, ModalProps } from "./types";

const ModalItemContext = createContext<InternalModalInstanceItem | null>(null);

export function useModal<R = unknown>(): ModalProps<R> {
  const modal = useContext(ModalItemContext);

  if (!modal) {
    throw new Error("useModal must be called inside a modal component");
  }

  return {
    id: modal.id,
    index: modal.index,
    isOpen: modal.isOpen,
    isNested: modal.isNested,
    close: modal.close as (value?: R) => void,
    open: modal.open,
    nested: modal.nested,
  };
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
  modal: InternalModalInstanceItem;
  children: React.ReactNode;
}) {
  return (
    <ModalItemContext.Provider value={modal}>
      {children}
    </ModalItemContext.Provider>
  );
}
