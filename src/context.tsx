import { createContext, Fragment, ReactNode, useContext } from "react";
import { ModalItemProvider, toModalProps } from "./item-context.js";
import {
  InternalModalInstance,
  InternalModalInstanceItem,
  ModalManager,
  ModalProviderProps,
} from "./types.js";
import { useModalManager } from "./use-modal-manager.js";

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

  const renderModal = (
    internalModal: InternalModalInstance,
    ancestors: InternalModalInstanceItem[] = [],
    isNested: boolean = false
  ): ReactNode => {
    const open = createOpen(internalModal.id);

    // Ancestor view exposed to descendants: nested is null since descendants
    // shouldn't introspect their own subtree via useModalAt(...).nested
    const ancestorView: InternalModalInstanceItem = {
      ...internalModal,
      nested: null,
      open,
      isNested,
      ancestors,
    };

    const nestedElement = internalModal.nested
      ? renderModal(
        internalModal.nested,
        [...ancestors, ancestorView],
        true
      )
      : null;

    const internalModalItem: InternalModalInstanceItem = {
      ...ancestorView,
      nested: nestedElement,
    };

    return (
      <ModalItemProvider modal={internalModalItem}>
        {modal ? (
          modal(toModalProps(internalModalItem), modalManager)
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
