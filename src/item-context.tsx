import { createContext, useContext, useEffect } from "react";
import {
  InternalModalInstanceItem,
  ModalLevel,
  ModalProps,
} from "./types.js";

const ModalItemContext = createContext<InternalModalInstanceItem | null>(null);

export function toModalProps<R>(modal: InternalModalInstanceItem<unknown, R>): ModalProps<R> {
  return {
    id: modal.id,
    index: modal.index,
    isOpen: modal.isOpen,
    isNested: modal.isNested,
    close: modal.close,
    open: modal.open,
    nested: modal.nested,
  };
}

function resolveAncestor(
  modal: InternalModalInstanceItem,
  level: ModalLevel
): InternalModalInstanceItem {
  const chain = modal.ancestors;

  if (level === "root") {
    return chain[0] ?? modal;
  }

  if (typeof level === "number") {
    if (level === 0) return modal;
    if (level > 0) {
      throw new Error(
        `useModalAt: positive level not supported. Use a negative number to go up, or 'root' for top.`
      );
    }
    const idx = chain.length + level;
    if (idx < 0) {
      throw new Error(
        `useModalAt: no ancestor at level ${level} (current depth: ${chain.length}).`
      );
    }
    return chain[idx];
  }

  if (level && typeof level === "object" && "id" in level) {
    if (modal.id === level.id) return modal;
    const found = chain.find((a) => a.id === level.id);
    if (!found) {
      throw new Error(
        `useModalAt: no ancestor with id "${level.id}" in current chain.`
      );
    }
    return found;
  }

  throw new Error(`useModalAt: invalid level ${JSON.stringify(level)}.`);
}

export function useModal<R = unknown>(): ModalProps<R> {
  const modal = useContext(ModalItemContext);

  if (!modal) {
    throw new Error("useModal must be called inside a modal component");
  }

  return toModalProps<R>(modal);
}

export function useModalAt<R = unknown>(level: ModalLevel): ModalProps<R> {
  const modal = useContext(ModalItemContext);

  if (!modal) {
    throw new Error("useModalAt must be called inside a modal component");
  }

  const target = resolveAncestor(modal, level);
  return toModalProps<R>(target);
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
