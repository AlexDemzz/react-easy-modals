import { ComponentType } from "react";

export interface ModalOptions {
  id?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventClose?: boolean;
}

export interface ModalProps<ReturnValue = any> extends Record<string, any> {
  data: any;
  index: number;
  id: string;
  isOpen: boolean;
  close: (value: ReturnValue) => void;
  setBeforeClose: (fn: () => boolean | Promise<boolean>) => void;
}

export interface ModalInstance<ReturnValue = any> {
  component: ComponentType<any>;
  id: string;
  data: any;
  isOpen: boolean;
  close: (value: ReturnValue) => void;
  setBeforeClose: (fn: () => boolean | Promise<boolean>) => void;
}

export interface ModalManager {
  open: <T = any, R = any>(
    component: ComponentType<T>,
    data?: any,
    options?: ModalOptions
  ) => Promise<R>;
  close: (n?: number) => void;
  closeById: (id: string) => void;
  closeAll: () => void;
  stack: ModalInstance[];
}
