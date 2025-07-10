import { ModalInstance } from "./types";
export declare function useModal(): ModalInstance<any, any>;
export declare function useBeforeClose(callback: () => boolean): void;
export declare function ModalItemProvider({ modal, children, }: {
    modal: ModalInstance;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=item-context.d.ts.map