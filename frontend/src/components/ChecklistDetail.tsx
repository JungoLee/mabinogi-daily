import React, { useState, useEffect } from 'react';
import { Checklist, ChecklistItem } from '../types';
import { checklistService } from '../services/api';
import socketService from '../services/socket';

interface ChecklistDetailProps {
  checklist: Checklist;
  onUpdate: (checklist: Checklist) => void;
  onClose: () => void;
  currentUserName: string;
}

export const ChecklistDetail: React.FC<ChecklistDetailProps> = ({
  checklist: initialChecklist,
  onUpdate,
  onClose,
  currentUserName,
}) => {
  const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    // Join checklist room
    socketService.joinChecklist(checklist._id);

    // Listen for real-time updates
    const handleChecklistChanged = (updatedChecklist: Checklist) => {
      setChecklist(updatedChecklist);
      onUpdate(updatedChecklist);
    };

    const handleItemChanged = (data: {
      itemId: string;
      completed: boolean;
      completedBy?: string;
    }) => {
      setChecklist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === data.itemId
            ? {
                ...item,
                completed: data.completed,
                completedBy: data.completedBy,
                completedAt: data.completed ? new Date() : undefined,
              }
            : item
        ),
      }));
    };

    socketService.onChecklistChanged(handleChecklistChanged);
    socketService.onItemChanged(handleItemChanged);

    return () => {
      socketService.leaveChecklist(checklist._id);
      socketService.offChecklistChanged(handleChecklistChanged);
      socketService.offItemChanged(handleItemChanged);
    };
  }, [checklist._id, onUpdate]);

  const handleToggleItem = async (itemId: string) => {
    const item = checklist.items.find((i) => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;
    const updatedItems = checklist.items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            completed: newCompleted,
            completedBy: newCompleted ? currentUserName : undefined,
            completedAt: newCompleted ? new Date() : undefined,
          }
        : i
    );

    try {
      const updated = await checklistService.update(checklist._id, {
        items: updatedItems,
      });
      setChecklist(updated);
      onUpdate(updated);

      // Emit socket event for real-time update
      socketService.emitItemToggle(
        checklist._id,
        itemId,
        newCompleted,
        newCompleted ? currentUserName : undefined
      );
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false,
    };

    const updatedItems = [...checklist.items, newItem];

    try {
      const updated = await checklistService.update(checklist._id, {
        items: updatedItems,
      });
      setChecklist(updated);
      onUpdate(updated);
      setNewItemText('');

      // Emit socket event for real-time update
      socketService.emitChecklistUpdate(checklist._id, updated);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = checklist.items.filter((i) => i.id !== itemId);

    try {
      const updated = await checklistService.update(checklist._id, {
        items: updatedItems,
      });
      setChecklist(updated);
      onUpdate(updated);

      // Emit socket event for real-time update
      socketService.emitChecklistUpdate(checklist._id, updated);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{checklist.title}</h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
            }}
          >
            ×
          </button>
        </div>

        {checklist.description && (
          <p style={{ color: '#666', marginBottom: '24px' }}>{checklist.description}</p>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Add new item..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleAddItem}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checklist.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: item.completed ? '#f0f0f0' : '#fff',
              }}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleItem(item.id)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#666' : '#000',
                  }}
                >
                  {item.text}
                </div>
                {item.completed && item.completedBy && (
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Completed by {item.completedBy}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {checklist.sharedWith.length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              Shared with:
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {checklist.sharedWith.map((user) => (
                <div
                  key={user._id}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {user.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
