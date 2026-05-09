import express from 'express';
import StudentProgress from '../models/StudentProgress.js';
import Batch from '../models/Batch.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get student progress for a specific batch
router.get('/:batchId', authMiddleware, async (req: any, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user.id;

    let progress = await StudentProgress.findOne({ userId, batchId });
    
    if (!progress) {
      // Return empty progress if none exists yet
      return res.json({
        userId,
        batchId,
        completedTopics: [],
        progressPercentage: 0
      });
    }

    // Calculate percentage based on batch's total topics
    const batch = await Batch.findById(batchId);
    const totalTopics = batch?.topicProgress?.length || 0;
    const progressPercentage = totalTopics > 0 
      ? Math.round((progress.completedTopics.length / totalTopics) * 100) 
      : 0;

    res.json({
      ...progress.toObject(),
      progressPercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student progress', error });
  }
});

// Toggle topic completion for student
router.patch('/:batchId/topic/:topicId', authMiddleware, async (req: any, res) => {
  try {
    const { batchId, topicId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.user.id;

    let progress = await StudentProgress.findOne({ userId, batchId });

    if (!progress) {
      progress = new StudentProgress({
        userId,
        batchId,
        completedTopics: []
      });
    }

    if (isCompleted) {
      if (!progress.completedTopics.includes(topicId)) {
        progress.completedTopics.push(topicId);
      }
    } else {
      progress.completedTopics = progress.completedTopics.filter(id => id !== topicId);
    }

    progress.lastUpdated = new Date();
    await progress.save();

    // Calculate percentage for response
    const batch = await Batch.findById(batchId);
    const totalTopics = batch?.topicProgress?.length || 0;
    const progressPercentage = totalTopics > 0 
      ? Math.round((progress.completedTopics.length / totalTopics) * 100) 
      : 0;

    res.json({
      ...progress.toObject(),
      progressPercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student progress', error });
  }
});

export default router;
