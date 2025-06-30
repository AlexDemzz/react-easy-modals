# React Easy Modals

A React modal management library with easy-to-use hooks and components.

## Installation

```bash
npm install react-easy-modals
# or
yarn add react-easy-modals
# or
pnpm add react-easy-modals
```

## Usage

```tsx
import { ModalProvider, useModals, Modals, useModalManager } from 'react-easy-modals';

function App() {
  return (
    <ModalProvider>
      <YourApp />
      <Modals />
    </ModalProvider>
  );
}

function YourComponent() {
  const { openModal } = useModals();
  const modalManager = useModalManager();

  const handleOpenModal = () => {
    openModal('myModal', {
      title: 'My Modal',
      content: 'This is my modal content'
    });
  };

  return (
    <button onClick={handleOpenModal}>
      Open Modal
    </button>
  );
}
```

## API

### Components

- `ModalProvider` - Context provider for modal management
- `Modals` - Renders all active modals

### Hooks

- `useModals()` - Hook to access modal operations
- `useModalManager()` - Hook to access the modal manager instance

### Types

- `ModalManager` - Type for the modal manager
- `ModalInstance` - Type for a modal instance
- `ModalOptions` - Type for modal options

## License

ISC 
