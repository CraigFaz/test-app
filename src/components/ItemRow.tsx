import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../types';
import { useStore } from '../store';
import { useSelection } from '../SelectionContext';

interface Props {
  item: Item;
  groupId: string;
  overlay?: boolean;
}

export function ItemRow({ item, groupId, overlay = false }: Props) {
  const { dispatch } = useStore();
  const { selectedIds, toggleSelection, isSelecting } = useSelection();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = selectedIds.has(item.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: 'item', groupId },
    disabled: overlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.name) {
      dispatch({ type: 'UPDATE_ITEM_NAME', groupId, itemId: item.id, name: trimmed });
    } else {
      setEditValue(item.name);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditValue(item.name); setEditing(false); }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'item-row',
        overlay ? 'item-row--overlay' : '',
        isDragging ? 'item-row--dragging' : '',
        selected ? 'item-row--selected' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        className={`selection-toggle${selected ? ' selection-toggle--selected' : ''}${isSelecting ? ' selection-toggle--visible' : ''}`}
        onClick={() => toggleSelection(item.id)}
        aria-label={selected ? 'Deselect item' : 'Select item'}
        title={selected ? 'Deselect' : 'Select'}
        tabIndex={-1}
      >
        {selected && (
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <button
        ref={setActivatorNodeRef}
        className="drag-handle"
        aria-label="Drag to reorder"
        {...listeners}
        {...attributes}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>

      <input
        type="checkbox"
        className="item-checkbox"
        checked={item.checked}
        onChange={() => dispatch({ type: 'TOGGLE_ITEM_CHECK', groupId, itemId: item.id })}
        aria-label={`Check ${item.name}`}
      />

      {editing ? (
        <input
          ref={inputRef}
          className="item-name-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span
          className={`item-name${item.checked ? ' item-name--checked' : ''}`}
          onDoubleClick={() => { setEditValue(item.name); setEditing(true); }}
          title="Double-tap to rename"
        >
          {item.name}
        </span>
      )}

      {!editing && (
        <div className="item-actions">
          <button
            className="icon-btn icon-btn--edit"
            onClick={() => { setEditValue(item.name); setEditing(true); }}
            aria-label="Rename item"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="icon-btn icon-btn--delete"
            onClick={() => dispatch({ type: 'DELETE_ITEM', groupId, itemId: item.id })}
            aria-label="Delete item"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
