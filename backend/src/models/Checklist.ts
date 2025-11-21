import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export interface IChecklist extends Document {
  title: string;
  description?: string;
  items: IChecklistItem[];
  owner: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedBy: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
}, { _id: false });

const ChecklistSchema = new Schema<IChecklist>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  items: [ChecklistItemSchema],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

export default mongoose.model<IChecklist>('Checklist', ChecklistSchema);
