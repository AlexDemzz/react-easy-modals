import { ComponentType, ReactElement, ReactNode } from "react";

export interface ModalOptions {
  id?: string;
  replace?: boolean;
}

export interface CloseOptions {
  force?: boolean;
}

export interface ModalProviderProps {
  children: ReactNode;
  backdrop?: (modals: ModalManager) => ReactElement | null;
  loading?: (modals: ModalManager) => ReactElement | null;
  modal?: (modal: ModalProps, modals: ModalManager) => ReactElement;
}

export type OpenFunction = {
  <T extends Record<string, never>, R = unknown>(
    component:
      | ModalComponent<T, R>
      | (() => Promise<{ default: ModalComponent<T, R> }>),
    options?: ModalOptions
  ): Promise<R>;
  <T, R = unknown>(
    component:
      | ModalComponent<T, R>
      | (() => Promise<{ default: ModalComponent<T, R> }>),
    props: Omit<T, keyof ModalProps<R>>,
    options?: ModalOptions
  ): Promise<R>;
};

export interface ModalProps<ReturnValue = any> {
  index: number;
  id: string;
  isOpen: boolean;
  isNested: boolean;
  close: (value?: ReturnValue, options?: CloseOptions) => void;
  open: OpenFunction;
  nested?: ReactNode;
}

// Type commun pour les composants modaux
export type ModalComponent<T = any, ReturnValue = any> = ComponentType<
  ModalProps<ReturnValue> & T
>;

export interface InternalModalInstanceItem<T = any, ReturnValue = any>
  extends ModalProps<ReturnValue> {
  component: ModalComponent<T, ReturnValue>;
  props?: Omit<T, keyof ModalProps<ReturnValue>>;
  onBeforeClose: (callback: (value?: ReturnValue) => boolean) => void;
}

export interface ModalManager {
  open: {
    <T extends Record<string, never>, R = any>(
      component:
        | ModalComponent<T, R>
        | (() => Promise<{ default: ModalComponent<T, R> }>),
      options?: ModalOptions
    ): Promise<R>;
    <T, R = any>(
      component:
        | ModalComponent<T, R>
        | (() => Promise<{ default: ModalComponent<T, R> }>),
      props: Omit<T, keyof ModalProps<R>>,
      options?: ModalOptions
    ): Promise<R>;
  };
  close: (n?: number, options?: CloseOptions) => boolean;
  closeById: (id: string, options?: CloseOptions) => boolean;
  closeAll: (options?: CloseOptions) => boolean;
  stack: InternalModalInstance[];
  action: ModalAction;
  isLoading: boolean;
  createOpen: (parentId: string) => OpenFunction;
}

export interface InternalModalInstance<T = any, ReturnValue = any> {
  component: ModalComponent<T, ReturnValue>;
  id: string;
  props?: Omit<T, keyof ModalProps<ReturnValue>>;
  isOpen: boolean;
  close: (value?: ReturnValue, options?: CloseOptions) => void;
  index: number;
  onBeforeClose: (callback: (value?: ReturnValue) => boolean) => void;
  nested?: InternalModalInstance;
}

export type ModalAction = "none" | "push" | "replace" | "pop";
