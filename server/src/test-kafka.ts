import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

// When running on the host machine, connect via localhost:29092
const bootstrapServer = process.env.KAFKA_BOOTSTRAP_SERVERS_TEST || 'localhost:29092';

const kafka = new Kafka({
  clientId: 'kafka-local-tester',
  brokers: [bootstrapServer],
});

const producer = kafka.producer();

async function runTest() {
  console.log(`🔌 Connecting test producer to Kafka at ${bootstrapServer}...`);
  await producer.connect();
  console.log('✅ Connected successfully!');

  // The exact payload specified in the guide
  const mockPayload = {
    userId: '123',
    courseId: 'DS101',
    amount: 4999,
    timestamp: new Date().toISOString(),
  };

  console.log('📤 Sending course-purchase event to Kafka:', mockPayload);
  
  await producer.send({
    topic: 'course-purchase',
    messages: [
      { value: JSON.stringify(mockPayload) },
    ],
  });

  console.log('🎉 Event sent successfully! Check the backend container logs for verification.');
  await producer.disconnect();
}

runTest().catch((err) => {
  console.error('❌ Failed to run Kafka test:', err);
  process.exit(1);
});
