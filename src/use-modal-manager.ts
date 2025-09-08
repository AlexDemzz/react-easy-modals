import { useCallback, useRef, useState } from "react";
import {
  ModalAction,
  ModalComponent,
  ModalInstance,
  ModalManager,
  ModalOptions,
  ModalProps,
} from "./types";

export function useModalManager(): ModalManager {
  const [stack, setStack] = useState<ModalInstance[]>([]);
  const [action, setAction] = useState<ModalAction>("none");
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(0);
  const beforeCloseCallbacks = useRef<
    Map<string, (value?: unknown) => boolean>
  >(new Map());

  const generateId = useCallback(() => {
    return `modal-${nextId.current++}`;
  }, []);

  const updateModalStack = useCallback((newStack: ModalInstance[]) => {
    return newStack.map((modal, index) => ({
      ...modal,
      index,
      isOpen: index === newStack.length - 1,
    }));
  }, []);

  const canClose = useCallback((id: string, value?: unknown): boolean => {
    const callback = beforeCloseCallbacks.current.get(id);
    return callback ? callback(value) : true;
  }, []);

  const closeById = useCallback(
    (id: string): boolean => {
      let wasClosed = false;

      setStack((prev) => {
        const modal = prev.find((m) => m.id === id);
        if (!modal) {
          console.error(`Modal with ID "${id}" not found, and cant be closed`);
          return prev;
        }

        if (!canClose(id)) {
          return prev;
        }

        wasClosed = true;
        beforeCloseCallbacks.current.delete(id);
        const newStack = prev.filter((m) => m.id !== id);
        setAction("pop");
        return updateModalStack(newStack);
      });

      return wasClosed;
    },
    [updateModalStack]
  );

  const closeCurrent = useCallback(
    (id: string): boolean => {
      const wasClosed = true;

      setStack((prev) => {
        const newStack = prev.filter((m) => m.id !== id);
        setAction("pop");
        return updateModalStack(newStack);
      });

      return wasClosed;
    },
    [updateModalStack]
  );

  const open = useCallback(
    <T = any, R = any>(
      component:
        | ModalComponent<T, R>
        | (() => Promise<{ default: ModalComponent<T, R> }>),
      props?: Omit<T, keyof ModalProps<R>>,
      options?: ModalOptions
    ): Promise<R> => {
      const id = options?.id || generateId();

      return new Promise<R>(async (resolve) => {
        let actualComponent: ModalComponent<T, R>;

        const isLazyImport =
          typeof component === "function" && !component.prototype;

        if (isLazyImport) {
          setIsLoading(true);
          try {
            const lazyModule = await (
              component as () => Promise<{ default: ModalComponent<T, R> }>
            )();
            actualComponent = lazyModule.default;
          } catch (error) {
            setIsLoading(false);
            throw error;
          }
          setIsLoading(false);
        } else {
          actualComponent = component as ModalComponent<T, R>;
        }

        const newModalInstance: ModalInstance<T, R> = {
          component: actualComponent,
          id,
          isOpen: false,
          onBeforeClose: (callback: (value?: R) => boolean) => {
            beforeCloseCallbacks.current.set(
              id,
              callback as (value?: unknown) => boolean
            );
          },
          close: (value?: R) => {
            if (canClose(id, value)) {
              resolve(value as R);
              closeCurrent(id);
            }
          },
          props,
          index: 0,
        };

        setStack((prev) => {
          const existingModal = prev.find((modal) => modal.id === id);
          if (existingModal) {
            console.error(
              `Modal with ID "${id}" already exists, and cant be opened`
            );
            return prev;
          }
          let newStack: ModalInstance[];

          if (options?.replace && prev.length > 0) {
            newStack = [...prev.slice(0, -1), newModalInstance];
            setAction("replace");
          } else {
            newStack = [...prev, newModalInstance];
            setAction("push");
          }

          return updateModalStack(newStack);
        });
      });
    },
    [generateId, updateModalStack, closeCurrent, canClose]
  );

  const close = useCallback(
    (n: number = 1): boolean => {
      if (typeof n !== "number" || n < 1) {
        throw new Error(
          `amount must be a number greater than 0. Received ${n}`
        );
      }
      let closedCount = 0;
      setStack((prev) => {
        let newStack = [...prev];
        for (let i = prev.length - 1; i >= 0 && closedCount < n; i--) {
          const modal = prev[i];
          if (canClose(modal.id)) {
            beforeCloseCallbacks.current.delete(modal.id);
            newStack = newStack.filter((m) => m.id !== modal.id);
            closedCount += 1;
          }
        }
        if (closedCount > 0) setAction("pop");

        return updateModalStack(newStack);
      });

      return closedCount > 0;
    },
    [updateModalStack, canClose]
  );

  const closeAll = useCallback((): boolean => {
    let wasAnyClosed = false;
    setStack((prev) => {
      if (prev.length > 0) {
        wasAnyClosed = true;
        setAction("pop");
        beforeCloseCallbacks.current.clear();
        return [];
      }
      return prev;
    });

    return wasAnyClosed;
  }, []);

  return {
    open,
    close,
    closeById,
    closeAll,
    stack,
    action,
    isLoading,
  };
}
