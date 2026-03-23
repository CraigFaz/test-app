export interface Item {
  id: string;
  name: string;
  checked: boolean;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface Group {
  id: string;
  title: string;
  color: RGBColor;
  collapsed: boolean;
  items: Item[];
}

export interface AppState {
  groups: Group[];
}

export type AppAction =
  | { type: 'ADD_GROUP' }
  | { type: 'DELETE_GROUP'; groupId: string }
  | { type: 'UPDATE_GROUP_TITLE'; groupId: string; title: string }
  | { type: 'UPDATE_GROUP_COLOR'; groupId: string; color: RGBColor }
  | { type: 'TOGGLE_GROUP_COLLAPSE'; groupId: string }
  | { type: 'REORDER_GROUPS'; activeId: string; overId: string }
  | { type: 'ADD_ITEM'; groupId: string; name: string }
  | { type: 'DELETE_ITEM'; groupId: string; itemId: string }
  | { type: 'UPDATE_ITEM_NAME'; groupId: string; itemId: string; name: string }
  | { type: 'TOGGLE_ITEM_CHECK'; groupId: string; itemId: string }
  | { type: 'REORDER_ITEMS'; groupId: string; activeId: string; overId: string }
  | { type: 'MOVE_ITEM_TO_GROUP'; itemId: string; fromGroupId: string; toGroupId: string; overItemId: string | null }
  | { type: 'BULK_MOVE_ITEMS_TO_GROUP'; itemIds: string[]; toGroupId: string }
  | { type: 'BULK_MOVE_ITEMS_TO_POSITION'; itemIds: string[]; position: 'top' | 'bottom' }
  | { type: 'IMPORT_STATE'; state: AppState };
