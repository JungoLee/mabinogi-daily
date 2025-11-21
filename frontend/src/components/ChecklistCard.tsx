import React from 'react';
import { Checklist } from '../types';

interface ChecklistCardProps {
  checklist: Checklist;
  onClick: () => void;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist, onClick }) => {
  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        backgroundColor: '#fff',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{checklist.title}</h3>
      {checklist.description && (
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
          {checklist.description}
        </p>
      )}
      <div style={{ marginBottom: '8px' }}>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#4caf50',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
        <span>{completedCount} / {totalCount} completed</span>
        <span>Owner: {checklist.owner.name}</span>
      </div>
      {checklist.sharedWith.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Shared with {checklist.sharedWith.length} user(s)
        </div>
      )}
    </div>
  );
};
