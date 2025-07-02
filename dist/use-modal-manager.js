import { useState, useCallback, useRef } from "react";
export function useModalManager() {
    const [stack, setStack] = useState([]);
    const [action, setAction] = useState("none");
    const [isLoading, setIsLoading] = useState(false);
    const nextId = useRef(0);
    const beforeCloseCallbacks = useRef({});
    const generateId = useCallback(() => {
        return `modal-${nextId.current++}`;
    }, []);
    const updateModalStack = useCallback((newStack) => {
        return newStack.map((modal, index) => ({
            ...modal,
            index,
            isOpen: index === newStack.length - 1,
        }));
    }, []);
    const canCloseModal = useCallback((id) => {
        const beforeClose = beforeCloseCallbacks.current[id];
        if (beforeClose) {
            return beforeClose();
        }
        return true;
    }, []);
    const closeById = useCallback((id) => {
        let wasClosed = false;
        setStack((prev) => {
            const modal = prev.find((m) => m.id === id);
            if (!modal)
                return prev;
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
    }, [updateModalStack, canCloseModal]);
    const open = useCallback((component, data, options) => {
        const id = options?.id || generateId();
        return new Promise(async (resolve, reject) => {
            let actualComponent;
            const isLazyImport = typeof component === "function" && !component.prototype;
            if (isLazyImport) {
                setIsLoading(true);
                try {
                    const module = await component();
                    actualComponent = module.default;
                }
                catch (error) {
                    setIsLoading(false);
                    throw error;
                }
                setIsLoading(false);
            }
            else {
                actualComponent = component;
            }
            function closeCurrentModal(value, resolve) {
                resolve(value);
                closeById(id);
            }
            const onBeforeClose = (callback) => {
                beforeCloseCallbacks.current[id] = callback;
            };
            const modalInstance = {
                component: actualComponent,
                data: data || {},
                id,
                isOpen: false,
                close: (value) => closeCurrentModal(value, resolve),
                onBeforeClose,
                index: 0,
            };
            setStack((prev) => {
                const existingModal = prev.find((modal) => modal.id === id);
                if (existingModal) {
                    console.error(`Modal with ID "${id}" already exists, and cant be opened`);
                }
                let newStack;
                if (options?.replace && prev.length > 0) {
                    newStack = [...prev.slice(0, -1), modalInstance];
                    setAction("replace");
                }
                else {
                    newStack = [...prev, modalInstance];
                    setAction("push");
                }
                return updateModalStack(newStack);
            });
        });
    }, [generateId, updateModalStack, closeById]);
    const close = useCallback((n = 1) => {
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
    }, [updateModalStack, canCloseModal]);
    const closeAll = useCallback(() => {
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
