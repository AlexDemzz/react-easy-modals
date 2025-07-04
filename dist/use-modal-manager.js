import { useState, useCallback, useRef } from "react";
export function useModalManager() {
    const [stack, setStack] = useState([]);
    const [action, setAction] = useState("none");
    const [isLoading, setIsLoading] = useState(false);
    const nextId = useRef(0);
    const beforeCloseCallbacks = useRef(new Map());
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
    const canClose = useCallback((id) => {
        const callback = beforeCloseCallbacks.current.get(id);
        return callback ? callback() : true;
    }, []);
    const closeById = useCallback((id) => {
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
    }, [updateModalStack, canClose]);
    const closeCurrent = useCallback((id) => {
        let wasClosed = false;
        setStack((prev) => {
            const newStack = prev.filter((m) => m.id !== id);
            setAction("pop");
            return updateModalStack(newStack);
        });
        return wasClosed;
    }, [updateModalStack, canClose]);
    const open = useCallback((component, data, options) => {
        const id = options?.id || generateId();
        return new Promise(async (resolve) => {
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
            const newModalInstance = {
                component: actualComponent,
                id,
                isOpen: false,
                onBeforeClose: (callback) => {
                    beforeCloseCallbacks.current.set(id, callback);
                },
                close: (value) => {
                    if (canClose(id)) {
                        resolve(value);
                        closeCurrent(id);
                    }
                },
                index: 0,
            };
            if (data) {
                newModalInstance.data = data;
            }
            setStack((prev) => {
                const existingModal = prev.find((modal) => modal.id === id);
                if (existingModal) {
                    console.error(`Modal with ID "${id}" already exists, and cant be opened`);
                    return prev;
                }
                let newStack;
                if (options?.replace && prev.length > 0) {
                    newStack = [...prev.slice(0, -1), newModalInstance];
                    setAction("replace");
                }
                else {
                    newStack = [...prev, newModalInstance];
                    setAction("push");
                }
                return updateModalStack(newStack);
            });
        });
    }, [generateId, updateModalStack, closeById, canClose]);
    const close = useCallback((n = 1) => {
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
            if (closedCount > 0)
                setAction("pop");
            return updateModalStack(newStack);
        });
        return closedCount > 0;
    }, [updateModalStack, canClose]);
    const closeAll = useCallback(() => {
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
