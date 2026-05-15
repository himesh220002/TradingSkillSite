import express from 'express';
import CommunityMessage from '../models/CommunityMessage.js';
import User from '../models/User.js';

const router = express.Router();

// Get user limits (MOVE ABOVE batchId route)
router.get('/limits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ID format
    if (!userId || userId.length !== 24) {
       return res.json({
        global: { used: 0, limit: 5, charLimit: 400 },
        batch: { used: 0, limit: 5, charLimit: 500 }
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        global: { used: 0, limit: 5, charLimit: 400 },
        batch: { used: 0, limit: 5, charLimit: 500 }
      });
    }

    const today = new Date().setHours(0,0,0,0);
    const lastReset = new Date(user.lastLimitResetDate || 0).setHours(0,0,0,0);

    if (today > lastReset) {
      user.dailyGlobalChats = 0;
      user.dailyBatchQuestions = 0;
      user.lastLimitResetDate = new Date();
      await user.save();
    }

    res.json({
      global: { used: user.dailyGlobalChats || 0, limit: 5, charLimit: 400 },
      batch: { used: user.dailyBatchQuestions || 0, limit: 5, charLimit: 500 }
    });
  } catch (error) {
    console.error("Limits fetch error:", error);
    res.json({
      global: { used: 0, limit: 5, charLimit: 400 },
      batch: { used: 0, limit: 5, charLimit: 500 }
    });
  }
});

// Admin: Get all questions across all batches
router.get('/admin/all', async (req, res) => {
  try {
    const messages = await CommunityMessage.find({ type: 'Question' })
      .populate('batchId', 'batchName')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin messages', error });
  }
});

// Get messages for a specific room (batch or global)
router.get('/', async (req, res) => {
  try {
    const messages = await CommunityMessage.find({ batchId: null })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community messages', error });
  }
});

router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const filter = batchId === 'global' ? { batchId: null } : { batchId };
    
    const messages = await CommunityMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community messages', error });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  try {
    const { senderId, username, batchId, content, type } = req.body;
    const user = await User.findById(senderId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isGlobal = !batchId || batchId === 'global';
    const charLimit = isGlobal ? 400 : 500;
    const dailyLimit = 5;

    // Reset if new day
    const today = new Date().setHours(0,0,0,0);
    const lastReset = new Date(user.lastLimitResetDate || 0).setHours(0,0,0,0);
    if (today > lastReset) {
      user.dailyGlobalChats = 0;
      user.dailyBatchQuestions = 0;
      user.lastLimitResetDate = new Date();
    }

    // Check limits
    if (isGlobal) {
      if ((user.dailyGlobalChats || 0) >= dailyLimit) {
        return res.status(403).json({ message: 'Global chat limit (5/5) reached for today.' });
      }
      if (content.length > charLimit) {
        return res.status(400).json({ message: `Global chat exceeds ${charLimit} characters.` });
      }
      user.dailyGlobalChats = (user.dailyGlobalChats || 0) + 1;
    } else {
      if ((user.dailyBatchQuestions || 0) >= dailyLimit) {
        return res.status(403).json({ message: 'Batch question limit (5/5) reached for today.' });
      }
      if (content.length > charLimit) {
        return res.status(400).json({ message: `Batch question exceeds ${charLimit} characters.` });
      }
      user.dailyBatchQuestions = (user.dailyBatchQuestions || 0) + 1;
    }

    await user.save();
    
    const newMessage = new CommunityMessage({
      senderId,
      username,
      batchId: isGlobal ? null : batchId,
      content,
      type
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error posting message', error });
  }
});

// Upvote a message
router.patch('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    const message = await CommunityMessage.findById(req.params.id);
    
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const upvoteIndex = message.upvotes.indexOf(userId);
    if (upvoteIndex === -1) {
      message.upvotes.push(userId);
    } else {
      message.upvotes.splice(upvoteIndex, 1); // Toggle off
    }

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error upvoting', error });
  }
});

// Trainer Reply to a Question
router.patch('/:id/reply', async (req, res) => {
  try {
    const { response } = req.body;
    const message = await CommunityMessage.findById(req.params.id);
    
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.type !== 'Question') {
      return res.status(400).json({ message: 'Only questions can be replied to.' });
    }

    message.trainerResponse = response;
    message.isResponded = true;

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to question', error });
  }
});

export default router;
