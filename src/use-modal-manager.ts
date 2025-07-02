import { useState, useCallback, useRef } from "react";
import {
  ModalManager,
  ModalInstance,
  ModalOptions,
  ModalAction,
} from "./types";

export function useModalManager(): ModalManager {
  const [stack, setStack] = useState<ModalInstance[]>([]);
  const [action, setAction] = useState<ModalAction>("none");
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(0);
  const beforeCloseCallbacks = useRef<{
    [id: string]: () => boolean;
  }>({});

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

  const canCloseModal = useCallback((id: string): boolean => {
    const beforeClose = beforeCloseCallbacks.current[id];
    if (beforeClose) {
      return beforeClose();
    }
    return true;
  }, []);

  const closeById = useCallback(
    (id: string): boolean => {
      let wasClosed = false;

      setStack((prev) => {
        const modal = prev.find((m) => m.id === id);
        if (!modal) return prev;

        if (!canCloseModal(id)) {
          return prev;
        }

        delete beforeCloseCallbacks.current[id];
        modal.close(undefined);
        wasClosed = true;

        const newStack = prev.filter((m) => m.id !== id);
        setAction("pop");
        return updateModalStack(newStack);
      });

      return wasClosed;
    },
    [updateModalStack, canCloseModal]
  );

  const open = useCallback(
    <T = any, R = any>(
      component:
        | React.ComponentType<T>
        | (() => Promise<{ default: React.ComponentType<T> }>),
      data?: any,
      options?: ModalOptions
    ): Promise<R> => {
      const id = options?.id || generateId();

      return new Promise<R>(async (resolve) => {
        let actualComponent: React.ComponentType<T>;

        const isLazyImport =
          typeof component === "function" && !component.prototype;

        if (isLazyImport) {
          setIsLoading(true);
          try {
            const module = await (
              component as () => Promise<{ default: React.ComponentType<T> }>
            )();
            actualComponent = module.default;
          } catch (error) {
            setIsLoading(false);
            throw error;
          }
          setIsLoading(false);
        } else {
          actualComponent = component as React.ComponentType<T>;
        }

        function closeCurrentModal(value: any, resolve: (value: any) => void) {
          resolve(value);
          closeById(id);
        }

        const onBeforeClose = (callback: () => boolean) => {
          beforeCloseCallbacks.current[id] = callback;
        };

        const modalInstance: ModalInstance = {
          component: actualComponent,
          id,
          isOpen: false,
          close: (value) => closeCurrentModal(value, resolve),
          onBeforeClose,
          index: 0,
        };

        if (data) {
          modalInstance.data = data;
        }

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
            newStack = [...prev.slice(0, -1), modalInstance];
            setAction("replace");
          } else {
            newStack = [...prev, modalInstance];
            setAction("push");
          }

          return updateModalStack(newStack);
        });
      });
    },
    [generateId, updateModalStack, closeById]
  );

  const close = useCallback(
    (n: number = 1): boolean => {
      let wasAnyClosed = false;

      setStack((prev) => {
        let newStack = [...prev];
        let closedCount = 0;

        for (let i = prev.length - 1; i >= 0 && closedCount < n; i--) {
          const modal = prev[i];
          if (canCloseModal(modal.id)) {
            delete beforeCloseCallbacks.current[modal.id];
            modal.close(undefined);
            newStack = newStack.filter((m) => m.id !== modal.id);
            closedCount++;
            wasAnyClosed = true;
          }
        }

        if (closedCount > 0) {
          setAction("pop");
        }

        return updateModalStack(newStack);
      });

      return wasAnyClosed;
    },
    [updateModalStack, canCloseModal]
  );

  const closeAll = useCallback((): boolean => {
    let wasAnyClosed = false;

    setStack((prev) => {
      const modalsToClose = prev.filter((modal) => canCloseModal(modal.id));

      if (modalsToClose.length === 0) {
        return prev;
      }

      modalsToClose.forEach((modal) => {
        delete beforeCloseCallbacks.current[modal.id];
        modal.close(undefined);
      });

      wasAnyClosed = true;

      const remainingModals = prev.filter((modal) => !canCloseModal(modal.id));

      setAction("pop");
      return updateModalStack(remainingModals);
    });

    return wasAnyClosed;
  }, [updateModalStack, canCloseModal]);

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
