"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useModalManager } from "./use-modal-manager";
const ModalContext = createContext(null);
export function ModalProvider({ children }) {
    const modalManager = useModalManager();
    return (_jsxs(ModalContext.Provider, { value: modalManager, children: [children, _jsx(Modals, {})] }));
}
function Modals() {
    const { stack } = useModals();
    return (_jsx(_Fragment, { children: stack.map((modal, index) => {
            return (_jsx(modal.component, { data: modal.data, close: (v) => modal.close(v), isOpen: modal.isOpen, id: modal.id, index: index, setBeforeClose: modal.setBeforeClose }, `modal-${modal.id}-${index}`));
        }) }));
}
export function useModals() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModals must be used within a ModalProvider");
    }
    return context;
}
