import { createContext, useContext } from 'react';

interface SelectionContextValue {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  isSelecting: boolean;
}

export const SelectionContext = createContext<SelectionContextValue>({
  selectedIds: new Set(),
  toggleSelection: () => {},
  clearSelection: () => {},
  isSelecting: false,
});

export function useSelection() {
  return useContext(SelectionContext);
}
