import { ReactNode, ReactElement } from "react";
import { ModalManager } from "./types";
interface ModalProviderProps {
    children: ReactNode;
    backdrop?: (modals: ModalManager) => ReactElement | null;
    loading?: () => ReactElement | null;
}
export declare function ModalProvider({ children, backdrop, loading, }: ModalProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useModals(): ModalManager;
export {};
//# sourceMappingURL=context.d.ts.map