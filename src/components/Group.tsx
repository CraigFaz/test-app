import React, { useState, useRef, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Group as GroupType } from '../types';
import { useStore } from '../store';
import { ItemRow } from './ItemRow';
import { ColorPickerModal } from './ColorPickerModal';

interface Props {
  group: GroupType;
  activeItemId?: string | null;
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function Group({ group }: Props) {
  const { dispatch } = useStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(group.title);
  const addInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group' },
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: group.id,
    data: { type: 'group', groupId: group.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const { r, g, b } = group.color;
  const headerTextColor = getLuminance(r, g, b) > 0.5 ? '#000000' : '#ffffff';

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (showAddItem && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddItem]);

  function commitTitle() {
    const trimmed = titleValue.trim();
    dispatch({ type: 'UPDATE_GROUP_TITLE', groupId: group.id, title: trimmed || 'Untitled' });
    setEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') { setTitleValue(group.title); setEditingTitle(false); }
  }

  function handleAddItem() {
    const trimmed = newItemName.trim();
    if (trimmed) {
      dispatch({ type: 'ADD_ITEM', groupId: group.id, name: trimmed });
      setNewItemName('');
      setShowAddItem(false);
    }
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAddItem();
    if (e.key === 'Escape') { setNewItemName(''); setShowAddItem(false); }
  }

  const itemIds = group.items.map((i) => i.id);
  const checkedCount = group.items.filter((i) => i.checked).length;

  return (
    <div ref={setSortableRef} style={style} className={`group${isDragging ? ' group--dragging' : ''}`}>
      {/* Group Header */}
      <div
        className="group-header"
        style={{
          background: `rgb(${r},${g},${b})`,
          color: headerTextColor,
          '--header-text': headerTextColor,
        } as React.CSSProperties}
      >
        <button
          ref={setActivatorNodeRef}
          className="drag-handle drag-handle--group"
          aria-label="Drag group"
          style={{ color: headerTextColor }}
          {...listeners}
          {...attributes}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>

        <button
          className="collapse-btn"
          style={{ color: headerTextColor }}
          onClick={() => dispatch({ type: 'TOGGLE_GROUP_COLLAPSE', groupId: group.id })}
          aria-label={group.collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            style={{ transform: group.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className="group-title-area">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="group-title-input"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              style={{ color: headerTextColor, borderColor: headerTextColor }}
            />
          ) : (
            <span
              className="group-title"
              onDoubleClick={() => { setTitleValue(group.title); setEditingTitle(true); }}
              title="Double-tap to rename"
            >
              {group.title}
            </span>
          )}
          <span className="group-count" style={{ color: headerTextColor, opacity: 0.7 }}>
            {checkedCount}/{group.items.length}
          </span>
        </div>

        <div className="group-header-actions">
          <button
            className="icon-btn"
            style={{ color: headerTextColor }}
            onClick={() => { setTitleValue(group.title); setEditingTitle(true); }}
            aria-label="Rename group"
            title="Rename group"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="icon-btn"
            style={{ color: headerTextColor }}
            onClick={() => setShowColorPicker(true)}
            aria-label="Change colour"
            title="Change colour"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" />
              <circle cx="8.5" cy="7.5" r="1" /><circle cx="6.5" cy="12.5" r="1" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </button>
          <button
            className="icon-btn"
            style={{ color: headerTextColor }}
            onClick={() => setShowAddItem((v) => !v)}
            aria-label="Add item"
            title="Add item"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            className="icon-btn icon-btn--delete"
            style={{ color: headerTextColor }}
            onClick={() => {
              if (window.confirm(`Delete group "${group.title}" and all its items?`)) {
                dispatch({ type: 'DELETE_GROUP', groupId: group.id });
              }
            }}
            aria-label="Delete group"
            title="Delete group"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Item Row */}
      {showAddItem && (
        <div className="add-item-row">
          <input
            ref={addInputRef}
            className="add-item-input"
            placeholder="Item name…"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleAddKeyDown}
          />
          <button className="btn btn--primary btn--sm" onClick={handleAddItem}>Add</button>
          <button className="btn btn--secondary btn--sm" onClick={() => { setNewItemName(''); setShowAddItem(false); }}>
            Cancel
          </button>
        </div>
      )}

      {/* Items */}
      {!group.collapsed && (
        <div ref={setDropRef} className="group-items">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {group.items.map((item) => (
              <ItemRow key={item.id} item={item} groupId={group.id} />
            ))}
          </SortableContext>
          {group.items.length === 0 && (
            <div className="group-empty">Drop items here</div>
          )}
        </div>
      )}

      {/* Colour Picker Modal */}
      {showColorPicker && (
        <ColorPickerModal
          initial={group.color}
          onApply={(color) => dispatch({ type: 'UPDATE_GROUP_COLOR', groupId: group.id, color })}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
}
