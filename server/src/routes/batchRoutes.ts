import express from 'express';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get all batches with course details
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().populate('courseId', 'title');
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error });
  }
});

// Create a new batch
router.post('/', async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Fetch course to get the topics checklist
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Initialize topicProgress from course topics
    const topicProgress = course.topics.map((t: any) => ({
      topicId: t._id?.toString() || Math.random().toString(36).substr(2, 9),
      name: t.name,
      isCompleted: false
    }));

    const newBatch = new Batch({
      ...req.body,
      topicProgress
    });

    const savedBatch = await newBatch.save();
    res.status(201).json(savedBatch);
  } catch (error) {
    res.status(400).json({ message: 'Error creating batch', error });
  }
});

// Update batch progress (Toggle topic completion)
router.patch('/:id/topic/:topicId', async (req, res) => {
  try {
    const { id, topicId } = req.params;
    const { isCompleted } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const topicIndex = batch.topicProgress.findIndex(tp => tp.topicId === topicId);
    if (topicIndex === -1) return res.status(404).json({ message: 'Topic not found in batch' });

    // Explicitly set the topic properties
    const updatedTopic = batch.topicProgress[topicIndex];
    if (updatedTopic) {
      updatedTopic.isCompleted = isCompleted;
      if (isCompleted) {
        updatedTopic.completionDate = new Date();
      } else {
        // Use null instead of undefined for better Mongoose compatibility
        updatedTopic.completionDate = null;
      }
      
      // Ensure Mongoose tracks the subdocument change
      batch.markModified('topicProgress');
    }

    await batch.save();
    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: 'Error updating topic progress', error });
  }
});

// Update general batch info
router.put('/:id', async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: 'Error updating batch', error });
  }
});

// Delete batch
router.delete('/:id', async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting batch', error });
  }
});

export default router;
