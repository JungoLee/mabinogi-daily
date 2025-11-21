import React, { useState, useEffect } from 'react';
import { Checklist, CreateChecklistData } from '../types';
import { checklistService } from '../services/api';
import { ChecklistCard } from '../components/ChecklistCard';
import { ChecklistDetail } from '../components/ChecklistDetail';
import { useSocket } from '../hooks/useSocket';
import { User } from '../types';

interface HomeProps {
  user: User;
  onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDescription, setNewChecklistDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const { connected } = useSocket();

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const data = await checklistService.getAll();
      setChecklists(data);
    } catch (error) {
      console.error('Failed to load checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim()) return;

    const data: CreateChecklistData = {
      title: newChecklistTitle,
      description: newChecklistDescription,
      items: [],
    };

    try {
      const newChecklist = await checklistService.create(data);
      setChecklists([...checklists, newChecklist]);
      setNewChecklistTitle('');
      setNewChecklistDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create checklist:', error);
    }
  };

  const handleUpdateChecklist = (updated: Checklist) => {
    setChecklists(
      checklists.map((c) => (c._id === updated._id ? updated : c))
    );
  };

  const handleDeleteChecklist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this checklist?')) return;

    try {
      await checklistService.delete(id);
      setChecklists(checklists.filter((c) => c._id !== id));
      setSelectedChecklist(null);
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #ddd',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>Mabinogi Daily Checklist</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {connected ? (
              <span style={{ color: '#4caf50', fontSize: '12px' }}>● Connected</span>
            ) : (
              <span style={{ color: '#f44336', fontSize: '12px' }}>● Disconnected</span>
            )}
          </div>
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          )}
          <span>{user.name}</span>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>My Checklists</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            + New Checklist
          </button>
        </div>

        {checklists.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              color: '#666',
            }}
          >
            <p>No checklists yet. Create your first one!</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {checklists.map((checklist) => (
              <ChecklistCard
                key={checklist._id}
                checklist={checklist}
                onClick={() => setSelectedChecklist(checklist)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Create New Checklist</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Title
              </label>
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Enter checklist title"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Description (optional)
              </label>
              <textarea
                value={newChecklistDescription}
                onChange={(e) => setNewChecklistDescription(e.target.value)}
                placeholder="Enter checklist description"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChecklist}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedChecklist && (
        <ChecklistDetail
          checklist={selectedChecklist}
          onUpdate={handleUpdateChecklist}
          onClose={() => setSelectedChecklist(null)}
          currentUserName={user.name}
        />
      )}
    </div>
  );
};
