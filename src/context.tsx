import { createContext, Fragment, ReactNode, useContext } from "react";
import { ModalItemProvider } from "./item-context";
import {
  InternalModalInstance,
  InternalModalInstanceItem,
  ModalManager,
  ModalProps,
  ModalProviderProps,
} from "./types";
import { useModalManager } from "./use-modal-manager";

const ModalContext = createContext<ModalManager | null>(null);

export function ModalProvider({
  children,
  backdrop,
  loading,
  modal,
}: ModalProviderProps) {
  const modalManager = useModalManager();

  return (
    <ModalContext.Provider value={modalManager}>
      {children}
      <Modals backdrop={backdrop} loading={loading} modal={modal} />
    </ModalContext.Provider>
  );
}

function Modals({
  backdrop,
  loading,
  modal,
}: Omit<ModalProviderProps, "children">) {
  const modalManager = useModals();
  const { stack, isLoading, createOpen } = modalManager;

  const renderModal = (internalModal: InternalModalInstance, isNested: boolean = false): ReactNode => {
    const open = createOpen(internalModal.id);

    const nestedElement = internalModal.nested
      ? renderModal(internalModal.nested, true)
      : null;

    const internalModalItem: InternalModalInstanceItem = {
      ...internalModal,
      nested: nestedElement,
      open,
      isNested,
    };

    const modalProps: ModalProps = {
      id: internalModalItem.id,
      isOpen: internalModalItem.isOpen,
      isNested: internalModalItem.isNested,
      close: internalModalItem.close,
      index: internalModalItem.index,
      nested: nestedElement,
      open,
    };

    return (
      <ModalItemProvider modal={internalModalItem}>
        {modal ? (
          modal(modalProps, modalManager)
        ) : (
          <internalModalItem.component
            {...internalModalItem.props}
            close={internalModalItem.close}
            isOpen={internalModalItem.isOpen}
            isNested={isNested}
            id={internalModalItem.id}
            index={internalModalItem.index}
            open={internalModalItem.open}
            nested={nestedElement}
          />
        )}
      </ModalItemProvider>
    );
  };

  return (
    <>
      {isLoading && loading && loading(modalManager)}
      {stack.map((internalModal) => (
        <Fragment key={internalModal.id}>
          {renderModal(internalModal)}
        </Fragment>
      ))}
      {(isLoading || stack.length > 0) && backdrop && backdrop(modalManager)}
    </>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
