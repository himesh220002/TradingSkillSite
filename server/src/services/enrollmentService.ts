import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Transaction from '../models/Transaction.js';

export interface AutoEnrollInput {
  userId: string;
  courseId: string;
  paymentMethod: string;
  amount: number;
  transactionId: string;
}

export const processAutoEnrollment = async (input: AutoEnrollInput) => {
  const { userId, courseId, paymentMethod, amount, transactionId } = input;

  // 1. Find next "Upcoming" batch for this course that isn't full
  const nextBatch = await Batch.findOne({ 
    courseId, 
    status: 'Upcoming',
    $expr: { $lt: [{ $size: "$students" }, "$maxStudents"] }
  }).sort({ startDate: 1 });

  if (!nextBatch) {
    throw new Error('No upcoming batches found with available seats.');
  }

  // 2. Check if user already in this batch
  const alreadyEnrolled = nextBatch.students.some((s: any) => s.toString() === userId);
  if (alreadyEnrolled) {
    throw new Error('User is already enrolled in the next upcoming batch.');
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

  // 5. If online, add to batch immediately
  if (paymentMethod === 'online') {
    nextBatch.students.push(userId as any);
    nextBatch.studentCount = nextBatch.students.length;
    await nextBatch.save();

    await User.findByIdAndUpdate(userId, { 
      $addToSet: { enrolledBatches: nextBatch._id } 
    });
  }

  return { enrollment, batch: nextBatch };
};
