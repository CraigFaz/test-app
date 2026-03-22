import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { AppState, AppAction, Group } from './types';
import { createInitialState } from './data';

const STORAGE_KEY = 'list-organizer-state';

function uid(): string {
  return crypto.randomUUID();
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return createInitialState();
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_GROUP': {
      const newGroup: Group = {
        id: uid(),
        title: 'New Group',
        color: { r: 30, g: 100, b: 180 },
        collapsed: false,
        items: [],
      };
      return { ...state, groups: [...state.groups, newGroup] };
    }

    case 'DELETE_GROUP': {
      return { ...state, groups: state.groups.filter((g) => g.id !== action.groupId) };
    }

    case 'UPDATE_GROUP_TITLE': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId ? { ...g, title: action.title } : g
        ),
      };
    }

    case 'UPDATE_GROUP_COLOR': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId ? { ...g, color: action.color } : g
        ),
      };
    }

    case 'TOGGLE_GROUP_COLLAPSE': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId ? { ...g, collapsed: !g.collapsed } : g
        ),
      };
    }

    case 'REORDER_GROUPS': {
      const oldIdx = state.groups.findIndex((g) => g.id === action.activeId);
      const newIdx = state.groups.findIndex((g) => g.id === action.overId);
      if (oldIdx < 0 || newIdx < 0) return state;
      return { ...state, groups: arrayMove(state.groups, oldIdx, newIdx) };
    }

    case 'ADD_ITEM': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId
            ? { ...g, items: [...g.items, { id: uid(), name: action.name, checked: false }] }
            : g
        ),
      };
    }

    case 'DELETE_ITEM': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId
            ? { ...g, items: g.items.filter((i) => i.id !== action.itemId) }
            : g
        ),
      };
    }

    case 'UPDATE_ITEM_NAME': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId
            ? {
                ...g,
                items: g.items.map((i) =>
                  i.id === action.itemId ? { ...i, name: action.name } : i
                ),
              }
            : g
        ),
      };
    }

    case 'TOGGLE_ITEM_CHECK': {
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId
            ? {
                ...g,
                items: g.items.map((i) =>
                  i.id === action.itemId ? { ...i, checked: !i.checked } : i
                ),
              }
            : g
        ),
      };
    }

    case 'REORDER_ITEMS': {
      const group = state.groups.find((g) => g.id === action.groupId);
      if (!group) return state;
      const oldIdx = group.items.findIndex((i) => i.id === action.activeId);
      const newIdx = group.items.findIndex((i) => i.id === action.overId);
      if (oldIdx < 0 || newIdx < 0) return state;
      const newItems = arrayMove(group.items, oldIdx, newIdx);
      return {
        ...state,
        groups: state.groups.map((g) => (g.id === action.groupId ? { ...g, items: newItems } : g)),
      };
    }

    case 'MOVE_ITEM_TO_GROUP': {
      const { itemId, fromGroupId, toGroupId, overItemId } = action;
      const fromGroup = state.groups.find((g) => g.id === fromGroupId);
      const toGroup = state.groups.find((g) => g.id === toGroupId);
      if (!fromGroup || !toGroup) return state;

      const item = fromGroup.items.find((i) => i.id === itemId);
      if (!item) return state;

      const newFromItems = fromGroup.items.filter((i) => i.id !== itemId);
      let newToItems = toGroup.items.filter((i) => i.id !== itemId);

      if (overItemId) {
        const overIdx = newToItems.findIndex((i) => i.id === overItemId);
        if (overIdx >= 0) {
          newToItems = [...newToItems.slice(0, overIdx), item, ...newToItems.slice(overIdx)];
        } else {
          newToItems = [...newToItems, item];
        }
      } else {
        newToItems = [...newToItems, item];
      }

      return {
        ...state,
        groups: state.groups.map((g) => {
          if (g.id === fromGroupId) return { ...g, items: newFromItems };
          if (g.id === toGroupId) return { ...g, items: newToItems };
          return g;
        }),
      };
    }

    case 'IMPORT_STATE': {
      return action.state;
    }

    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function findGroupOfItem(state: AppState, itemId: string): string | undefined {
  return state.groups.find((g) => g.items.some((i) => i.id === itemId))?.id;
}
