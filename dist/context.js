"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useModalManager } from "./use-modal-manager";
import { ModalItemProvider } from "./item-context";
const ModalContext = createContext(null);
export function ModalProvider({ children, backdrop, loading, }) {
    const modalManager = useModalManager();
    return (_jsxs(ModalContext.Provider, { value: modalManager, children: [children, _jsx(Modals, { backdrop: backdrop, loading: loading })] }));
}
function Modals({ backdrop, loading }) {
    const modalManager = useModals();
    const { stack, isLoading } = modalManager;
    return (_jsxs(_Fragment, { children: [isLoading && loading && loading(), stack.map((modal) => {
                return (_jsx(ModalItemProvider, { modal: modal, children: _jsx(modal.component, { data: modal.data, close: modal.close, isOpen: modal.isOpen, id: modal.id, index: modal.index }) }, modal.id));
            }), stack.length > 0 && backdrop && backdrop(modalManager)] }));
}
export function useModals() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModals must be used within a ModalProvider");
    }
    return context;
}
