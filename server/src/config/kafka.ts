import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import { processAutoEnrollment } from '../services/enrollmentService.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Notification from '../models/Notification.js';

const kafkaHost = process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:9092';

const kafka = new Kafka({
  clientId: 'trading-skill-site',
  brokers: [kafkaHost],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'trading-skill-site-group' });

/**
 * Publishes an event to a Kafka topic
 */
export const publishEvent = async (topic: string, data: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }],
    });
    console.log(`📤 [Kafka Producer] Published event to topic [${topic}]:`, data);
  } catch (error) {
    console.error(`❌ [Kafka Producer] Error publishing event to [${topic}]:`, error);
  }
};

/**
 * Initializes and connects Kafka producer and consumer
 */
export const connectKafka = async () => {
  try {
    console.log(`⚙️ Connecting Kafka producer and consumer to bootstrap servers: ${kafkaHost}...`);
    
    await producer.connect();
    console.log('✅ Kafka Producer connected successfully');

    await consumer.connect();
    console.log('✅ Kafka Consumer connected successfully');

    // Subscribe to our three topics
    await consumer.subscribe({ topic: 'course-purchase', fromBeginning: true });
    await consumer.subscribe({ topic: 'enrollments', fromBeginning: true });
    await consumer.subscribe({ topic: 'notification', fromBeginning: true });

    // Run the consumer loop
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payloadStr = message.value?.toString();
        if (!payloadStr) return;

        try {
          const data = JSON.parse(payloadStr);
          console.log(`📥 [Kafka Consumer] Received message on topic [${topic}] at partition ${partition}:`, data);

          if (topic === 'course-purchase') {
            await handleCoursePurchase(data);
          } else if (topic === 'enrollments') {
            await handleEnrollment(data);
          } else if (topic === 'notification') {
            await handleNotification(data);
          }
        } catch (err: any) {
          console.error(`❌ [Kafka Consumer] Error processing message on topic [${topic}]:`, err.message);
        }
      },
    });
    console.log('🚀 Kafka Consumer is listening for events...');
  } catch (error) {
    console.error('❌ Failed to initialize Kafka:', error);
  }
};

/**
 * Handler 1: Handles 'course-purchase' events. 
 * Resolves entities, runs enrollment logic, and publishes to 'enrollments' topic.
 */
const handleCoursePurchase = async (data: any) => {
  const { userId, courseId, amount } = data;
  if (!userId || !courseId) {
    console.warn('⚠️ Missing userId or courseId in course-purchase payload');
    return;
  }

  let finalUserId = userId;
  let finalCourseId = courseId;
  const paymentMethod = data.paymentMethod || 'online';
  const transactionId = data.transactionId || `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  // Fallback for non-ObjectId strings (e.g. "123", "DS101" used for learning/testing)
  // to avoid CastError from Mongoose
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
    console.log(`ℹ️ [Enrollment Worker] Payload contains test IDs (userId: "${userId}", courseId: "${courseId}"). Mapping to active database entities...`);
    
    // Find or create dummy course
    let course = await Course.findOne();
    if (!course) {
      course = await new Course({
        title: 'Demo Trading Masterclass',
        description: 'Demo course created automatically for Kafka testing',
        price: 4999,
        duration: '6 weeks',
        level: 'Intermediate',
        topics: [{ name: 'Introduction to Markets', order: 1 }]
      }).save();
      console.log(`🆕 [Enrollment Worker] Created demo course in DB: ${course._id}`);
    }
    finalCourseId = course._id.toString();

    // Find or create dummy user
    let user = await User.findOne();
    if (!user) {
      user = await new User({
        username: 'kafka_student',
        password: 'password123',
        role: 'student'
      }).save();
      console.log(`🆕 [Enrollment Worker] Created demo student in DB: ${user._id}`);
    }
    finalUserId = user._id.toString();

    // Ensure there is an upcoming batch for this course
    let batch = await Batch.findOne({ courseId: finalCourseId, status: 'Upcoming' });
    if (!batch) {
      batch = await new Batch({
        batchName: 'Kafka Learning Batch A',
        courseId: finalCourseId,
        startDate: new Date(Date.now() + 86400000 * 5),
        endDate: new Date(Date.now() + 86400000 * 25),
        maxStudents: 15,
        students: [],
        status: 'Upcoming',
        topicProgress: [{ topicId: 'topic-1', name: 'Setup environment', isCompleted: false }]
      }).save();
      console.log(`🆕 [Enrollment Worker] Created demo batch in DB: ${batch._id}`);
    }
  }

  console.log(`⚡ [Enrollment Worker] Processing enrollment database transaction for User: ${finalUserId}, Course: ${finalCourseId}...`);
  
  const { enrollment, batch } = await processAutoEnrollment({
    userId: finalUserId,
    courseId: finalCourseId,
    paymentMethod,
    amount: amount || 4999,
    transactionId,
  });

  console.log(`✅ [Enrollment Worker] Successfully enrolled student in Batch: "${batch.batchName}"`);

  // Publish to 'enrollments' topic
  await publishEvent('enrollments', {
    userId: finalUserId,
    courseId: finalCourseId,
    batchId: batch._id,
    enrollmentId: enrollment._id,
    amount: amount || 4999,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handler 2: Handles 'enrollments' events.
 * Triggers mock Email Confirmation, Payment Reconciliation, and publishes 'notification' event.
 */
const handleEnrollment = async (data: any) => {
  const { userId, courseId, amount, batchId } = data;

  // 1. Simulate Email Confirmation
  console.log(`\n📧 [Email Worker] === SENDING ENROLLMENT EMAIL ===`);
  console.log(`   To User ID: ${userId}`);
  console.log(`   Subject: Course Enrollment Confirmed!`);
  console.log(`   Message: Congratulations! You have been successfully enrolled in course [${courseId}] in Batch [${batchId}]. Welcome to your learning journey!`);
  console.log(`   ==============================================\n`);

  // 2. Simulate Payment Reconciliation
  console.log(`💳 [Reconciliation Worker] === RECONCILING PAYMENT ===`);
  console.log(`   User: ${userId}`);
  console.log(`   Course: ${courseId}`);
  console.log(`   Reconciled Amount: $${(amount / 100).toFixed(2)}`);
  console.log(`   Reconciliation Status: SUCCESS (Settled & Audited)`);
  console.log(`   ====================================================\n`);

  // 3. Publish to 'notification' topic
  await publishEvent('notification', {
    userId,
    title: 'Welcome to your Course!',
    message: `Your enrollment in Course ${courseId} is complete.`,
    type: 'success',
  });
};

/**
 * Handler 3: Handles 'notification' events.
 * Writes the notification to MongoDB.
 */
const handleNotification = async (data: any) => {
  const { userId, title, message, type } = data;
  if (!userId || !title || !message) {
    console.warn('⚠️ Missing fields in notification event');
    return;
  }

  console.log(`🔔 [Notification Worker] Processing app notification for user: ${userId}`);

  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'info',
    });
    await notification.save();
    console.log(`💾 [Notification Worker] Persisted notification to MongoDB (ID: ${notification._id})`);
  } catch (err: any) {
    console.error('❌ [Notification Worker] Failed to save notification to MongoDB:', err.message);
  }
};
