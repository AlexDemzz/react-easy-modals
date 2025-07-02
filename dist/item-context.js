"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect } from "react";
const ModalItemContext = createContext(null);
export function useModal() {
    const modal = useContext(ModalItemContext);
    if (!modal) {
        throw new Error("useModal must be called inside a modal component");
    }
    return modal;
}
export function useBeforeClose(callback) {
    const modal = useModal();
    useEffect(() => {
        modal.onBeforeClose(callback);
    }, [modal, callback]);
}
export function ModalItemProvider({ modal, children, }) {
    return (_jsx(ModalItemContext.Provider, { value: modal, children: children }));
}
