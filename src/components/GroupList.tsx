import { useRef, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore, findGroupOfItem } from '../store';
import { SelectionContext } from '../SelectionContext';
import { Group } from './Group';
import { ItemRow } from './ItemRow';
import type { Item } from '../types';

interface GroupListProps {
  search?: string;
}

export function GroupList({ search = '' }: GroupListProps) {
  const { state, dispatch } = useStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const activeItemGroupRef = useRef<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const groupIds = state.groups.map((g) => g.id);
  const searchLower = search.toLowerCase();

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const isSelecting = selectedIds.size > 0;

  function isGroupId(id: string) {
    return state.groups.some((g) => g.id === id);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    if (!isGroupId(id)) {
      activeItemGroupRef.current = findGroupOfItem(state, id) ?? null;
    } else {
      activeItemGroupRef.current = null;
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;
    if (isGroupId(activeId)) return;

    const fromGroupId = activeItemGroupRef.current;
    if (!fromGroupId) return;

    const overData = over.data.current;
    let toGroupId: string | null = null;
    let overItemId: string | null = null;

    if (overData?.type === 'item') {
      toGroupId = overData.groupId as string;
      overItemId = overId;
    } else if (overData?.type === 'group') {
      toGroupId = overId;
    }

    if (toGroupId && toGroupId !== fromGroupId) {
      dispatch({
        type: 'MOVE_ITEM_TO_GROUP',
        itemId: activeId,
        fromGroupId,
        toGroupId,
        overItemId,
      });
      activeItemGroupRef.current = toGroupId;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      activeItemGroupRef.current = null;
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (isGroupId(activeId) && isGroupId(overId)) {
      dispatch({ type: 'REORDER_GROUPS', activeId, overId });
    } else if (!isGroupId(activeId)) {
      const groupId = activeItemGroupRef.current ?? findGroupOfItem(state, activeId);
      const overGroupId = findGroupOfItem(state, overId);
      if (groupId && overGroupId && groupId === overGroupId) {
        dispatch({ type: 'REORDER_ITEMS', groupId, activeId, overId });
      }
    }

    activeItemGroupRef.current = null;
  }

  let activeItem: Item | null = null;
  let activeItemGroupId: string | null = null;
  if (activeId && !isGroupId(activeId as string)) {
    for (const group of state.groups) {
      const found = group.items.find((i) => i.id === activeId);
      if (found) { activeItem = found; activeItemGroupId = group.id; break; }
    }
  }

  return (
    <SelectionContext.Provider value={{ selectedIds, toggleSelection, clearSelection, isSelecting }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
          <div className={`group-list${isSelecting ? ' group-list--selecting' : ''}`}>
            {state.groups.map((group) => {
              const filteredGroup = searchLower
                ? { ...group, items: group.items.filter(i => i.name.toLowerCase().includes(searchLower)) }
                : group;
              if (searchLower && filteredGroup.items.length === 0) return null;
              return (
                <Group key={group.id} group={filteredGroup} activeItemId={activeId as string | null} />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem && activeItemGroupId ? (
            <ItemRow item={activeItem} groupId={activeItemGroupId} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {isSelecting && (
        <div className="selection-bar">
          <span className="selection-bar__count">{selectedIds.size} selected</span>
          <select
            className="selection-bar__group-select"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                dispatch({ type: 'BULK_MOVE_ITEMS_TO_GROUP', itemIds: [...selectedIds], toGroupId: e.target.value });
                clearSelection();
              }
            }}
          >
            <option value="">Move to group…</option>
            {state.groups.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => {
              dispatch({ type: 'BULK_MOVE_ITEMS_TO_POSITION', itemIds: [...selectedIds], position: 'top' });
              clearSelection();
            }}
            title="Move selected to top of their group"
          >
            ↑ Top
          </button>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => {
              dispatch({ type: 'BULK_MOVE_ITEMS_TO_POSITION', itemIds: [...selectedIds], position: 'bottom' });
              clearSelection();
            }}
            title="Move selected to bottom of their group"
          >
            ↓ Bottom
          </button>
          <button
            className="icon-btn selection-bar__clear"
            onClick={clearSelection}
            aria-label="Clear selection"
            title="Clear selection"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </SelectionContext.Provider>
  );
}
