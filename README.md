# React Easy Modals

[![bundle size](https://img.shields.io/bundlephobia/minzip/react-easy-modals)](https://bundlephobia.com/result?p=react-easy-modals)

A simple, flexible, zero-dependency, type-safe modal manager for React (port of [svelte-modals](https://github.com/mattjennings/svelte-modals)).

[📚 Documentation](https://react-easy-modals-docs.vercel.app/)

## Get started

### Installation

```bash
npm install react-easy-modals
```

### Add ModalProvider to your app

Wrap your app with `ModalProvider` to enable modals:

```tsx
import { ModalProvider } from "react-easy-modals";

function App() {
  return <ModalProvider>{/* Your app content */}</ModalProvider>;
}

export default App;
```

### Create your Modal component

Create a basic modal component:

```tsx
function Modal({ title, message, close, isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <strong>{title}</strong>
        <p>{message}</p>
        <button onClick={() => close()}>OK</button>
      </div>
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          z-index: 50;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          color: white;
          background: black;
          border: 1px solid gray;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 300px;
        }
        .modal button {
          background: white;
          color: black;
          padding: 5px;
        }
      `}</style>
    </div>
  );
}
```

### Try it out

Import `useModals` anywhere in your app to open or close your modals:

```tsx
import { useModals } from "react-easy-modals";
import Modal from "./Modal";

function Page() {
  const modals = useModals();

  const handleClick = () => {
    modals.open(Modal, {
      title: "Alert",
      message: "This is an alert",
    });
  };

  return <button onClick={handleClick}>Open Modal</button>;
}
```
