import { useState, useCallback, useRef } from "react";
import { ModalManager, ModalInstance, ModalOptions } from "./types";

export function useModalManager(): ModalManager {
  const [stack, setStack] = useState<ModalInstance[]>([]);
  const nextId = useRef(0);
  const beforeCloseCallbacks = useRef<{
    [id: string]: () => boolean | Promise<boolean>;
  }>({});

  const generateId = useCallback(() => {
    return `modal-${nextId.current++}`;
  }, []);

  const updateModalStack = useCallback((newStack: ModalInstance[]) => {
    return newStack.map((modal, index) => ({
      ...modal,
      isOpen: index === newStack.length - 1,
    }));
  }, []);

  const open = useCallback(
    <T = any, R = any>(
      component: React.ComponentType<T>,
      data?: any,
      options?: ModalOptions
    ): Promise<R> => {
      return new Promise<R>((resolve) => {
        const id = options?.id || generateId();

        async function closeCurrentModal(
          value: any,
          resolve: (value: any) => void
        ) {
          const beforeClose = beforeCloseCallbacks.current[id];
          if (beforeClose) {
            const shouldClose = await beforeClose();
            if (!shouldClose) {
              return;
            }
          }
          delete beforeCloseCallbacks.current[id];
          await resolve(value);
          closeById(id);
        }

        const setBeforeClose = (fn: () => boolean | Promise<boolean>) => {
          beforeCloseCallbacks.current[id] = fn;
        };

        const modalInstance: ModalInstance = {
          component,
          data: data || {},
          id,
          isOpen: false,
          close: (value) => closeCurrentModal(value, resolve),
          setBeforeClose,
        };

        setStack((prev) => {
          const newStack = [...prev, modalInstance];
          return updateModalStack(newStack);
        });
      });
    },
    [generateId, updateModalStack]
  );

  const close = useCallback(
    (n: number = 1) => {
      setStack((prev) => {
        const newStack = [...prev];
        for (let i = 0; i < n && newStack.length > 0; i++) {
          const modal = newStack.pop();
          if (modal) {
            modal.close(undefined);
          }
        }
        return updateModalStack(newStack);
      });
    },
    [updateModalStack]
  );

  const closeById = useCallback(
    (id: string) => {
      setStack((prev) => {
        const modal = prev.find((m) => m.id === id);
        if (modal) {
          modal.close(undefined);
        }
        const newStack = prev.filter((m) => m.id !== id);
        return updateModalStack(newStack);
      });
    },
    [updateModalStack]
  );

  const closeAll = useCallback(() => {
    setStack((prev) => {
      prev.forEach((modal) => modal.close(undefined));
      return updateModalStack([]);
    });
  }, [updateModalStack]);

  return {
    open,
    close,
    closeById,
    closeAll,
    stack,
  };
}
