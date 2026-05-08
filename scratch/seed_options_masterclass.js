import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../src/models/Course.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-skill-trainer';

const optionsMasterclass = {
  title: "Options Trading Masterclass: Intermediate to Pro",
  subtitle: "Master the Greek Engine, Complex Spreads, and Algorithmic Execution.",
  description: "This intermediate-level Options Trading Masterclass is designed for traders who have a grasp of the basics (Calls, Puts, and Strike Prices) and are ready to master professional risk management and multi-leg strategies. Learn how to transition from guessing direction to trading probability and sensitivity.",
  price: 499,
  discountPrice: 299,
  level: "Intermediate",
  duration: "12 Weeks",
  category: "Options Trading",
  instructor: "Krishna",
  learningObjectives: [
    "Master the Greek Engine: Delta, Gamma, Theta, and Vega",
    "Construct complex Vertical and Horizontal Spread architectures",
    "Implement Market Neutral strategies like Straddles and Iron Condors",
    "Utilize Quantitative Analysis and Data Visualization for an edge",
    "Execute Algorithmic strategies and Portfolio Defensive Adjustments"
  ],
  curriculum: [
    {
      title: "Chapter 1: The Greek Engine & Dynamic Risk",
      lessons: [
        {
          title: "Module 1.1: Advanced Delta & Gamma Scaling",
          duration: "45 mins",
          notes: "Mastering the sensitivity of option pricing through Delta and Gamma.",
          contentBlocks: [
            {
              type: 'heading',
              content: 'Understanding Delta as a Hedge Ratio'
            },
            {
              type: 'paragraph',
              content: 'Delta represents the rate of change between the option price and a $1 change in the underlying asset. In professional trading, it is viewed as a hedge ratio—telling you exactly how many shares of stock you need to offset your option exposure.'
            },
            {
              type: 'image',
              content: 'Delta Scaling Visual',
              metadata: {
                url: 'https://images.unsplash.com/photo-1611974717482-58317f93535a?auto=format&fit=crop&q=80&w=1200',
                caption: 'Visualizing Delta sensitivity across different strike prices.'
              }
            },
            {
              type: 'heading',
              content: 'Gamma Risk at Expiration'
            },
            {
              type: 'paragraph',
              content: 'Gamma is the rate of change in Delta. As expiration approaches, Gamma for At-The-Money (ATM) options explodes, creating significant price sensitivity. This is often called "Gamma Risk" and requires precise management.'
            },
            {
              type: 'graph',
              content: 'Gamma Profile Chart',
              metadata: {
                graphType: 'GAMMA_CURVE',
                caption: 'The Gamma Spike: Notice how ATM options become hyper-sensitive near expiration.'
              }
            },
            {
              type: 'algorithm',
              content: 'def calculate_gamma_exposure(delta_change, price_step):\n    return delta_change / price_step',
              metadata: {
                language: 'python'
              }
            },
            {
              type: 'question',
              content: 'What happens to the Gamma of an ATM option as time to expiration decreases?',
              metadata: {
                options: ['It decreases to zero', 'It remains constant', 'It increases exponentially', 'It becomes negative'],
                correctAnswer: 'It increases exponentially'
              }
            }
          ]
        },
        {
          title: "Module 1.2: Theta Decay & Time Erosion",
          duration: "40 mins",
          notes: "Exploiting the non-linear nature of time decay.",
          contentBlocks: [
            {
              type: 'heading',
              content: 'The Non-Linear Acceleration of Theta'
            },
            {
              type: 'paragraph',
              content: 'Time decay is not a straight line. It accelerates as an option gets closer to expiration, especially in the final 30 days. This provides a strategic edge for option sellers.'
            },
            {
              type: 'graph',
              content: 'Theta Decay Visualization',
              metadata: {
                graphType: 'THETA_DECAY',
                caption: 'Profit/Loss impact over time: The 45-day to 21-day sweet spot.'
              }
            },
            {
              type: 'note',
              content: 'Professional Tip: Most premium sellers target the 45 DTE (Days to Expiration) window to capture the rapid acceleration of Theta while maintaining manageable risk.'
            }
          ]
        }
      ]
    },
    {
      title: "Chapter 2: Vertical & Horizontal Spread Architecture",
      lessons: [
        {
          title: "Module 2.1: Credit & Debit Spreads",
          duration: "50 mins",
          notes: "Building multi-leg strategies for defined risk trading.",
          contentBlocks: [
            {
              type: 'heading',
              content: 'The Architecture of a Vertical Spread'
            },
            {
              type: 'paragraph',
              content: 'A vertical spread involves buying and selling options of the same type and expiration but at different strike prices. This "caps" your maximum gain and maximum loss, creating a high-probability defined-risk trade.'
            },
            {
              type: 'image',
              content: 'Bull Call Payoff Diagram',
              metadata: {
                url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200',
                caption: 'Bull Call Spread: Defined Risk vs. Capped Reward.'
              }
            },
            {
              type: 'graph',
              content: 'Interactive Payoff Engine',
              metadata: {
                graphType: 'PAYOFF_INTERACTIVE',
                caption: 'Adjust the sliders to see how your break-even point moves with different strike selections.'
              }
            }
          ]
        }
      ]
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Course.deleteOne({ title: optionsMasterclass.title });
    
    const newCourse = new Course(optionsMasterclass);
    await newCourse.save();

    console.log('Options Trading Masterclass (Dynamic Blocks) seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
