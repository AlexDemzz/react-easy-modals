import { createContext, ReactNode, useContext } from "react";
import { ModalItemProvider } from "./item-context";
import {
  InternalModalInstance,
  ModalInstance,
  ModalManager,
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

    const modalInstance: ModalInstance = {
      ...internalModal,
      nested: nestedElement,
      open,
      isNested,
    };

    return (
      <ModalItemProvider key={modalInstance.id} modal={modalInstance}>
        {modal ? (
          modal(modalInstance, modalManager)
        ) : (
          <modalInstance.component
            {...modalInstance.props}
            close={modalInstance.close}
            isOpen={modalInstance.isOpen}
            isNested={isNested}
            id={modalInstance.id}
            index={modalInstance.index}
            open={modalInstance.open}
            nested={nestedElement}
          />
        )}
      </ModalItemProvider>
    );
  };

  return (
    <>
      {isLoading && loading && loading(modalManager)}
      {stack.map((internalModal) => renderModal(internalModal))}
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
