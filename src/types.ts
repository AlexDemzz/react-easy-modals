import { ComponentType } from "react";

export interface ModalOptions {
  id?: string;
  replace?: boolean;
}

export interface ModalProps<ReturnValue = any> extends Record<string, any> {
  index: number;
  id: string;
  isOpen: boolean;
  close: (value?: ReturnValue) => void;
  onBeforeClose: (callback: () => boolean) => void;
}

export interface ModalInstance<ReturnValue = any> {
  component: ComponentType<any>;
  id: string;
  data?: any;
  isOpen: boolean;
  close: (value?: ReturnValue) => void;
  onBeforeClose: (callback: () => boolean) => void;
  index: number;
}

export interface ModalManager {
  open: <T = any, R = any>(
    component:
      | ComponentType<T>
      | (() => Promise<{ default: ComponentType<T> }>),
    data?: any,
    options?: ModalOptions
  ) => Promise<R>;
  close: (n?: number) => boolean;
  closeById: (id: string) => boolean;
  closeAll: () => boolean;
  stack: ModalInstance[];
  action: ModalAction;
  isLoading: boolean;
}

export type ModalAction = "none" | "push" | "replace" | "pop";
