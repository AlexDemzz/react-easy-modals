"use client";

import { useModals } from "./context";

export function Modals() {
  const { stack } = useModals();
  return (
    <>
      {stack.map((modal, index) => {
        return (
          <modal.component
            key={`modal-${modal.id}-${index}`}
            data={modal.data}
            close={(v: any) => modal.close(v)}
            isOpen={modal.isOpen}
            id={modal.id}
            index={index}
            setBeforeClose={modal.setBeforeClose}
          />
        );
      })}
    </>
  );
}
