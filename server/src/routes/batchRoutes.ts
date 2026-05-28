import express from 'express';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { createBatchSchema, enrollStudentSchema, switchStudentSchema, autoEnrollSchema } from '../schemas/batchSchemas.js';
import Enrollment from '../models/Enrollment.js';
import { publishEvent } from '../config/kafka.js';

import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Helper to clean old schedule items and merge with general schedule
const processBatchSchedule = async (batch: any) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. Remove expired specific schedule items
  let changed = false;
  const originalScheduleCount = batch.schedule?.length || 0;
  if (batch.schedule) {
    batch.schedule = batch.schedule.filter((item: any) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(23, 59, 59, 999); // Keep until end of day
      return itemDate >= now;
    });
    if (batch.schedule.length !== originalScheduleCount) changed = true;
  }

  if (changed) await batch.save();

  // 2. Generate merged schedule for next 7 days
  const mergedSchedule = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayName = daysOfWeek[targetDate.getDay()];
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Check for specific override
    const override = batch.schedule?.find((s: any) => 
      new Date(s.date).toISOString().split('T')[0] === targetDateStr
    );

    if (override) {
      mergedSchedule.push({
        date: targetDate,
        startTime: override.startTime,
        endTime: override.endTime,
        type: override.type,
        note: override.note,
        isOverride: true
      });
    } else {
      // Check for general slot
      const generalSlot = batch.generalSchedule?.find((gs: any) => gs.dayOfWeek === dayName);
      if (generalSlot) {
        mergedSchedule.push({
          date: targetDate,
          startTime: generalSlot.startTime,
          endTime: generalSlot.endTime,
          type: generalSlot.type,
          isOverride: false
        });
      }
    }
  }

  return { ...batch.toObject(), combinedSchedule: mergedSchedule };
};

// Get all batches with course details + enrolled students
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('courseId', 'title _id')
      .populate('students', '_id username role');

    // Auto-fix statuses based on date
    const now = new Date();
    const updatedBatches = await Promise.all(batches.map(async (batch) => {
      const batchDate = new Date(batch.startDate);
      let changed = false;
      
      if (batchDate <= now) {
        if (batch.status === 'Upcoming') {
          batch.status = 'Ongoing';
          changed = true;
        }
      } else {
        if (batch.status === 'Ongoing') {
          batch.status = 'Upcoming';
          changed = true;
        }
      }

      if (changed) await batch.save();
      return batch;
    }));

    res.json(await Promise.all(updatedBatches.map(b => processBatchSchedule(b))));
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
    res.json(await processBatchSchedule(batch));
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
    const batch = await Batch.findById(req.params.id).populate('courseId', 'title');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    
    const oldDateStr = new Date(batch.startDate).toDateString();
    const newDateStr = req.body.startDate ? new Date(req.body.startDate).toDateString() : oldDateStr;

    // 1. If date changed, notify students
    if (req.body.startDate && oldDateStr !== newDateStr) {
      const courseTitle = (batch.courseId as any)?.title || 'your course';
      const notifications = batch.students.map(studentId => ({
        userId: studentId,
        title: 'Batch Rescheduled',
        message: `Your batch "${batch.batchName}" for ${courseTitle} has been rescheduled to ${new Date(req.body.startDate).toLocaleDateString()}.`,
        type: 'warning'
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    // 2. Apply updates
    Object.assign(batch, req.body);

    // 3. Auto-fix status if date has passed
    const now = new Date();
    const batchDate = new Date(batch.startDate);
    if (batchDate <= now) {
      if (batch.status === 'Upcoming') batch.status = 'Ongoing';
    } else {
      // If rescheduled to future, move back to Upcoming
      if (batch.status === 'Ongoing') batch.status = 'Upcoming';
    }

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

// ── Auto-Enrollment (Checkout Flow) ─────────────────────────────────────────

router.post('/auto-enroll', validate(autoEnrollSchema), async (req, res) => {
  try {
    const { userId, courseId, paymentMethod, amount, transactionId } = req.body;

    // 1. Find next "Upcoming" batch for this course that isn't full
    const nextBatch = await Batch.findOne({ 
      courseId, 
      status: 'Upcoming',
      $expr: { $lt: [{ $size: "$students" }, "$maxStudents"] }
    }).sort({ startDate: 1 });

    if (!nextBatch) {
      return res.status(404).json({ message: 'No upcoming batches found with available seats.' });
    }

    // 2. Check if user already in this batch
    const alreadyEnrolled = nextBatch.students.some((s: any) => s.toString() === userId);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'User is already enrolled in the next upcoming batch.' });
    }

    // 3. Create Enrollment (Ticket)
    const enrollment = new Enrollment({
      userId,
      courseId,
      batchId: nextBatch._id,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending'
    });
    await enrollment.save();

    // 4. Create Transaction Record (Audit Trail)
    const transaction = new Transaction({
      userId,
      courseId,
      batchId: nextBatch._id,
      amount,
      paymentMethod,
      transactionId,
      status: paymentMethod === 'online' ? 'completed' : 'pending'
    });
    await transaction.save();

    // 4. If online, add to batch immediately
    if (paymentMethod === 'online') {
      nextBatch.students.push(userId);
      nextBatch.studentCount = nextBatch.students.length;
      await nextBatch.save();

      await User.findByIdAndUpdate(userId, { 
        $addToSet: { enrolledBatches: nextBatch._id } 
      });
    }

    res.status(201).json({
      message: paymentMethod === 'online' ? 'Enrollment successful!' : 'Manual payment request received.',
      enrollment,
      batch: nextBatch
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing auto-enrollment', error });
  }
});

// Async Enrollment Endpoint via Kafka
router.post('/auto-enroll-async', validate(autoEnrollSchema), async (req, res) => {
  try {
    const { userId, courseId, paymentMethod, amount, transactionId } = req.body;

    const eventPayload = {
      userId,
      courseId,
      amount,
      paymentMethod,
      transactionId,
      timestamp: new Date().toISOString()
    };

    // Publish to 'course-purchase' topic
    await publishEvent('course-purchase', eventPayload);

    res.status(202).json({
      message: 'Course purchase initiated asynchronously. Processing enrollment...',
      eventPayload
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error initiating async enrollment', error: error.message });
  }
});

export default router;
