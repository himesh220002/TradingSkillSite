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

  let nextBatch = await Batch.findOne({ 
    courseId, 
    status: 'Upcoming',
    $expr: { $lt: [{ $size: "$students" }, "$maxStudents"] }
  }).sort({ startDate: 1 });

  // If no upcoming batch exists, auto-create one starting 5 days from now
  if (!nextBatch) {
    console.log(`⚡ [EnrollmentService] No upcoming batch found for course ${courseId}. Auto-creating one...`);

    const course = await Course.findById(courseId);
    const courseName = course?.title || 'Course';

    // Generate a readable batch name: e.g. "Trading Masterclass - Jun 2026 Batch"
    const now = new Date();
    const monthYear = now.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    const batchName = `${courseName} — ${monthYear} Batch`;

    const startDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days
    const endDate  = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000); // +35 days

    nextBatch = await new Batch({
      courseId,
      batchName,
      startDate,
      endDate,
      maxStudents: 30,
      students: [],
      status: 'Upcoming',
      topicProgress: [],
    }).save() as any;

    console.log(`✅ [EnrollmentService] Auto-created batch "${batchName}" (starts ${startDate.toDateString()}), ID: ${nextBatch!._id}`);
  }

  // Ensure typescript knows batch is non-null
  const batch = nextBatch!;

  // 2. Check if user already in this batch
  const alreadyEnrolled = batch.students.some((s: any) => s.toString() === userId);
  if (alreadyEnrolled) {
    throw new Error('User is already enrolled in the next upcoming batch.');
  }

  // 3. Create Enrollment (Ticket)
  const enrollment = new Enrollment({
    userId,
    courseId,
    batchId: batch._id,
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
    batchId: batch._id,
    amount,
    paymentMethod,
    transactionId,
    status: paymentMethod === 'online' ? 'completed' : 'pending'
  });
  await transaction.save();

  // 5. If online, add to batch immediately
  if (paymentMethod === 'online') {
    batch.students.push(userId as any);
    batch.studentCount = batch.students.length;
    await batch.save();

    await User.findByIdAndUpdate(userId, { 
      $addToSet: { enrolledBatches: batch._id } 
    });
  }

  return { enrollment, batch };
};
