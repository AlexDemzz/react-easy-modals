"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useModalManager } from "./use-modal-manager";
const ModalContext = createContext(null);
export function ModalProvider({ children }) {
    const modalManager = useModalManager();
    return (_jsx(ModalContext.Provider, { value: modalManager, children: children }));
}
export function useModals() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModals must be used within a ModalProvider");
    }
    return context;
}
