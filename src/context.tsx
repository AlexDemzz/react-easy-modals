import { createContext, useContext } from "react";
import { ModalItemProvider } from "./item-context";
import { ModalManager, ModalProviderProps } from "./types";
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
  const { stack, isLoading } = modalManager;

  return (
    <>
      {isLoading && loading && loading(modalManager)}
      {stack.map((modalInstance) => (
        <ModalItemProvider key={modalInstance.id} modal={modalInstance}>
          {modal ? (
            modal(modalInstance, modalManager)
          ) : (
            <modalInstance.component
              {...modalInstance.props}
              close={modalInstance.close}
              isOpen={modalInstance.isOpen}
              id={modalInstance.id}
              index={modalInstance.index}
            />
          )}
        </ModalItemProvider>
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
