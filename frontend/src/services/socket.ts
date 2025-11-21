import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinChecklist(checklistId: string): void {
    this.socket?.emit('join-checklist', checklistId);
  }

  leaveChecklist(checklistId: string): void {
    this.socket?.emit('leave-checklist', checklistId);
  }

  emitChecklistUpdate(checklistId: string, checklist: any): void {
    this.socket?.emit('checklist-updated', { checklistId, checklist });
  }

  emitItemToggle(checklistId: string, itemId: string, completed: boolean, completedBy?: string): void {
    this.socket?.emit('item-toggled', { checklistId, itemId, completed, completedBy });
  }

  onChecklistChanged(callback: (checklist: any) => void): void {
    this.socket?.on('checklist-changed', callback);
  }

  onItemChanged(callback: (data: any) => void): void {
    this.socket?.on('item-changed', callback);
  }

  offChecklistChanged(callback: (checklist: any) => void): void {
    this.socket?.off('checklist-changed', callback);
  }

  offItemChanged(callback: (data: any) => void): void {
    this.socket?.off('item-changed', callback);
  }
}

export default new SocketService();
