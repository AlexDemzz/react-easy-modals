import { useState, useCallback, useRef } from "react";
export function useModalManager() {
    const [stack, setStack] = useState([]);
    const [action, setAction] = useState("none");
    const nextId = useRef(0);
    const beforeCloseCallbacks = useRef({});
    const generateId = useCallback(() => {
        return `modal-${nextId.current++}`;
    }, []);
    const updateModalStack = useCallback((newStack) => {
        return newStack.map((modal, index) => ({
            ...modal,
            isOpen: index === newStack.length - 1,
        }));
    }, []);
    const open = useCallback((component, data, options) => {
        return new Promise((resolve) => {
            const id = options?.id || generateId();
            async function closeCurrentModal(value, resolve) {
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
            const setBeforeClose = (fn) => {
                beforeCloseCallbacks.current[id] = fn;
            };
            const modalInstance = {
                component,
                data: data || {},
                id,
                isOpen: false,
                close: (value) => closeCurrentModal(value, resolve),
                setBeforeClose,
            };
            setStack((prev) => {
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
    }, [generateId, updateModalStack]);
    const close = useCallback((n = 1) => {
        setStack((prev) => {
            const newStack = [...prev];
            for (let i = 0; i < n && newStack.length > 0; i++) {
                const modal = newStack.pop();
                if (modal) {
                    modal.close(undefined);
                }
            }
            setAction("pop");
            return updateModalStack(newStack);
        });
    }, [updateModalStack]);
    const closeById = useCallback((id) => {
        setStack((prev) => {
            const modal = prev.find((m) => m.id === id);
            if (modal) {
                modal.close(undefined);
            }
            const newStack = prev.filter((m) => m.id !== id);
            setAction("pop");
            return updateModalStack(newStack);
        });
    }, [updateModalStack]);
    const closeAll = useCallback(() => {
        setStack((prev) => {
            prev.forEach((modal) => modal.close(undefined));
            setAction("pop");
            return updateModalStack([]);
        });
    }, [updateModalStack]);
    return {
        open,
        close,
        closeById,
        closeAll,
        stack,
        action,
    };
}
