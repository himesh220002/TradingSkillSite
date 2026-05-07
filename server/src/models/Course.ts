import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  title: string;
  duration: string;
}

export interface ISection {
  title: string;
  lessons: ILesson[];
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface ICourse extends Document {
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  videoPreviewUrl: string;
  price: number;
  discountPrice: number;
  currency: string;
  duration: string;
  level: string;
  category: string;
  features: string[];
  learningObjectives: string[];
  requirements: string[];
  curriculum: ISection[];
  faqs: IFAQ[];
  instructor: string;
  batchTimings: string;
  enrolledStudents: number;
  topics: { name: string; order: number }[];
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  bannerImage: { type: String, default: '/course-masterclass.png' },
  videoPreviewUrl: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  currency: { type: String, default: 'USD' },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  category: { type: String, default: 'Trading' },
  features: [{ type: String }],
  learningObjectives: [{ type: String }],
  requirements: [{ type: String }],
  curriculum: [{
    title: { type: String, required: true },
    lessons: [{
      title: { type: String, required: true },
      duration: { type: String }
    }]
  }],
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  instructor: { type: String, default: 'Krishna Sharma' },
  batchTimings: { type: String },
  enrolledStudents: { type: Number, default: 10 },
  topics: [{
    name: { type: String, required: true },
    order: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICourse>('Course', CourseSchema);
