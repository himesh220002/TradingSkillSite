import express from 'express';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { createBatchSchema, enrollStudentSchema, switchStudentSchema } from '../schemas/batchSchemas.js';

const router = express.Router();

// Get all batches with course details + enrolled students
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error });
  }
});

// Get single batch
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch', error });
  }
});

// Create a new batch
router.post('/', validate(createBatchSchema), async (req, res) => {
  try {
    const { courseId } = req.body;

    // Fetch course to get the curriculum (topics/subtopics) or flat topics
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Build topicProgress: prefer structured curriculum, fall back to flat topics
    let topicProgress: { topicId: string; name: string; sectionName?: string; isCompleted: boolean }[] = [];

    if (course.curriculum && course.curriculum.length > 0) {
      // Flatten sections→lessons into checklist items: "Topic: Subtopic"
      course.curriculum.forEach((section: any) => {
        if (section.lessons && section.lessons.length > 0) {
          section.lessons.forEach((lesson: any) => {
            topicProgress.push({
              topicId: lesson._id?.toString() || `${section.title}-${lesson.title}-${Math.random().toString(36).substr(2,6)}`,
              name: lesson.title, // Clean lesson title
              sectionName: section.title, // Explicit section name
              isCompleted: false
            });
          });
        } else {
          // Section with no lessons — add section itself as a checklist item
          topicProgress.push({
            topicId: section._id?.toString() || `${section.title}-${Math.random().toString(36).substr(2,6)}`,
            name: section.title,
            sectionName: 'General',
            isCompleted: false
          });
        }
      });
    } else if (course.topics && course.topics.length > 0) {
      // Legacy flat topics fallback
      topicProgress = course.topics.map((t: any) => ({
        topicId: t._id?.toString() || Math.random().toString(36).substr(2, 9),
        name: t.name,
        isCompleted: false
      }));
    }

    if (topicProgress.length === 0) {
      return res.status(400).json({ message: 'Course has no curriculum or topics. Please add content to the course first.' });
    }

    const newBatch = new Batch({ ...req.body, topicProgress, students: [] });
    const savedBatch = await newBatch.save();
    res.status(201).json(savedBatch);
  } catch (error) {
    res.status(400).json({ message: 'Error creating batch', error });
  }
});

// ── Student Enrollment ───────────────────────────────────────────────────────

// Add a student to a batch
router.post('/:id/students', validate(enrollStudentSchema), async (req, res) => {
  try {
    const { userId } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Avoid duplicate enrollment
    const alreadyInBatch = batch.students.some((s: any) => s.toString() === userId);
    if (alreadyInBatch) return res.status(400).json({ message: 'Student already enrolled in this batch' });

    batch.students.push(userId);
    batch.studentCount = batch.students.length;
    await batch.save();

    // Also add batchId to user's enrolledBatches if not already there
    const alreadyEnrolled = user.enrolledBatches.some((b: any) => b.toString() === req.params.id);
    if (!alreadyEnrolled) {
      user.enrolledBatches.push(req.params.id as any);
      await user.save();
    }

    const populated = await Batch.findById(req.params.id)
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error adding student', error });
  }
});

// Switch a student from one batch to another
router.post('/switch-student', validate(switchStudentSchema), async (req, res) => {
  try {
    const { userId, fromBatchId, toBatchId } = req.body;
    if (!userId || !fromBatchId || !toBatchId) {
      return res.status(400).json({ message: 'userId, fromBatchId and toBatchId are required' });
    }
    if (fromBatchId === toBatchId) {
      return res.status(400).json({ message: 'From and To batch cannot be the same' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fromBatch = await Batch.findById(fromBatchId);
    const toBatch   = await Batch.findById(toBatchId);
    if (!fromBatch) return res.status(404).json({ message: 'Source batch not found' });
    if (!toBatch)   return res.status(404).json({ message: 'Destination batch not found' });

    // Remove from source batch
    fromBatch.students = fromBatch.students.filter((s: any) => s.toString() !== userId) as any;
    fromBatch.studentCount = fromBatch.students.length;
    await fromBatch.save();

    // Add to destination batch (guard duplicates)
    const alreadyIn = toBatch.students.some((s: any) => s.toString() === userId);
    if (!alreadyIn) {
      toBatch.students.push(userId);
      toBatch.studentCount = toBatch.students.length;
      await toBatch.save();
    }

    // Sync user.enrolledBatches
    user.enrolledBatches = user.enrolledBatches.filter((b: any) => b.toString() !== fromBatchId) as any;
    const enrolledInTo = user.enrolledBatches.some((b: any) => b.toString() === toBatchId);
    if (!enrolledInTo) user.enrolledBatches.push(toBatchId as any);
    await user.save();

    res.json({ message: 'Student switched successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error switching student', error });
  }
});

// Remove a student from a batch

router.delete('/:id/students/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    batch.students = batch.students.filter((s: any) => s.toString() !== userId) as any;
    batch.studentCount = batch.students.length;
    await batch.save();

    // Remove batchId from user's enrolledBatches
    await User.findByIdAndUpdate(userId, { $pull: { enrolledBatches: id } });

    const populated = await Batch.findById(id)
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error removing student', error });
  }
});

// ── Progress & General Updates ───────────────────────────────────────────────

// Toggle topic completion
router.patch('/:id/topic/:topicId', async (req, res) => {
  try {
    const { id, topicId } = req.params;
    const { isCompleted } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const topicIndex = batch.topicProgress.findIndex(tp => tp.topicId === topicId);
    if (topicIndex === -1) return res.status(404).json({ message: 'Topic not found in batch' });

    const updatedTopic = batch.topicProgress[topicIndex];
    if (updatedTopic) {
      updatedTopic.isCompleted = isCompleted;
      updatedTopic.completionDate = isCompleted ? new Date() : null;
      batch.markModified('topicProgress');
    }

    await batch.save();
    const populated = await Batch.findById(id)
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating topic progress', error });
  }
});

// Update general batch info
router.put('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    
    Object.assign(batch, req.body);
    await batch.save();

    const populated = await Batch.findById(req.params.id)
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating batch', error });
  }
});

// Delete batch
router.delete('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (batch) {
      // Remove batch from all enrolled users
      await User.updateMany(
        { _id: { $in: batch.students } },
        { $pull: { enrolledBatches: batch._id } }
      );
    }
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting batch', error });
  }
});

export default router;
