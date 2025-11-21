export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export interface Checklist {
  _id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  owner: User;
  sharedWith: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateChecklistData {
  title: string;
  description?: string;
  items?: ChecklistItem[];
}

export interface UpdateChecklistData {
  title?: string;
  description?: string;
  items?: ChecklistItem[];
}
