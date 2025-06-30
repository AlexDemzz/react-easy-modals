"use client";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useModals } from "./context";
export function Modals() {
    const { stack } = useModals();
    return (_jsx(_Fragment, { children: stack.map((modal, index) => {
            return (_jsx(modal.component, { data: modal.data, close: (v) => modal.close(v), isOpen: modal.isOpen, id: modal.id, index: index, setBeforeClose: modal.setBeforeClose }, `modal-${modal.id}-${index}`));
        }) }));
}
