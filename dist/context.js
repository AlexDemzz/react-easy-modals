"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useModalManager } from "./use-modal-manager";
import { ModalItemProvider } from "./item-context";
const ModalContext = createContext(null);
export function ModalProvider({ children, backdrop, loading, modal, }) {
    const modalManager = useModalManager();
    return (_jsxs(ModalContext.Provider, { value: modalManager, children: [children, _jsx(Modals, { backdrop: backdrop, loading: loading, modal: modal })] }));
}
function Modals({ backdrop, loading, modal, }) {
    const modalManager = useModals();
    const { stack, isLoading } = modalManager;
    return (_jsxs(_Fragment, { children: [isLoading && loading && loading(modalManager), stack.map((modalInstance) => (_jsx(ModalItemProvider, { modal: modalInstance, children: modal ? (modal(modalInstance, modalManager)) : (_jsx(modalInstance.component, { data: modalInstance.data, close: modalInstance.close, isOpen: modalInstance.isOpen, id: modalInstance.id, index: modalInstance.index })) }, modalInstance.id))), (isLoading || stack.length > 0) && backdrop && backdrop(modalManager)] }));
}
export function useModals() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModals must be used within a ModalProvider");
    }
    return context;
}
