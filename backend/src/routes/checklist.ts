import { Router, Request, Response } from 'express';
import Checklist from '../models/Checklist';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Get all checklists for current user
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const checklists = await Checklist.find({
      $or: [{ owner: userId }, { sharedWith: userId }]
    }).populate('owner', 'name email picture')
      .populate('sharedWith', 'name email picture');

    res.json(checklists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklists' });
  }
});

// Get single checklist
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      $or: [{ owner: userId }, { sharedWith: userId }]
    }).populate('owner', 'name email picture')
      .populate('sharedWith', 'name email picture');

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// Create new checklist
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const { title, description, items } = req.body;

    const checklist = await Checklist.create({
      title,
      description,
      items: items || [],
      owner: userId,
      sharedWith: [],
    });

    await checklist.populate('owner', 'name email picture');
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checklist' });
  }
});

// Update checklist
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const { title, description, items } = req.body;

    const checklist = await Checklist.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ owner: userId }, { sharedWith: userId }]
      },
      { title, description, items },
      { new: true, runValidators: true }
    ).populate('owner', 'name email picture')
      .populate('sharedWith', 'name email picture');

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// Delete checklist
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;

    const checklist = await Checklist.findOneAndDelete({
      _id: req.params.id,
      owner: userId // Only owner can delete
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found or unauthorized' });
    }

    res.json({ message: 'Checklist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
});

// Share checklist with users
router.post('/:id/share', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const { userIds } = req.body;

    const checklist = await Checklist.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { $addToSet: { sharedWith: { $each: userIds } } },
      { new: true }
    ).populate('owner', 'name email picture')
      .populate('sharedWith', 'name email picture');

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found or unauthorized' });
    }

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to share checklist' });
  }
});

export default router;
