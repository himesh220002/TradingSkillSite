"use client"

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Layers, 
  HelpCircle, 
  Table as TableIcon, 
  Activity, 
  Info,
  ChevronRight
} from 'lucide-react';
import { Mermaid } from '@/components/Mermaid';

// Hardcoded details database for high-fidelity architecture walkthroughs
const DATA: Record<string, {
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  chart: string;
  tableHeaders: string[];
  tableRows: string[][];
  concepts: { title: string; desc: string; category: string }[];
}> = {
  'payment-enrollment-flow': {
    title: 'Razorpay & Kafka Enrollment Flow',
    subtitle: 'Event-Driven Transaction Pipeline',
    badge: 'Core Automation',
    summary: 'A visual walkthrough showing how the user payment interacts with Razorpay, validates the cryptographically signed response, publishes purchase events to Kafka, and triggers automatic batch creation & student enrollment.',
    chart: `
sequenceDiagram
    autonumber
    actor User as 👤 Student Client
    participant FE as 🖥️ Next.js Web UI
    participant BE as ⚙️ Express Backend
    participant RZP as 💳 Razorpay Gateway
    participant KFK as 📁 Kafka Cluster
    participant DB as 💾 MongoDB

    User->>FE: Enters Payment Page (USD)
    FE->>BE: GET /api/payments/config & create-order
    Note over BE: 1. Converts USD to INR via Live API<br/>2. Calls Razorpay API
    BE->>RZP: Create Order Request (INR)
    RZP-->>BE: Returns Order ID
    BE-->>FE: Returns Order details & Key ID
    FE->>FE: Displays converted INR & loads script
    User->>FE: Clicks "Finalize Connection"
    FE->>RZP: Opens Razorpay Checkout Modal
    User->>RZP: Enters credentials & pays
    RZP-->>FE: Returns Payment ID & Signature

    rect rgb(16, 185, 129, 0.05)
        FE->>BE: POST /api/payments/verify
        Note over BE: Cryptographically validates<br/>HMAC-SHA256 signature
        BE->>KFK: Publishes 'course-purchase' event
        BE-->>FE: Returns 202 Accepted (Processing)
    end

    rect rgb(59, 130, 246, 0.05)
        Note over KFK, DB: Kafka Consumer reads event asynchronously
        KFK->>BE: Triggers Enrollment consumer
        BE->>DB: Finds/Auto-creates Batch (+5 Days)<br/>Clones course topics to Batch
        BE->>DB: Saves Enrollment & Transaction
        BE-->>FE: Webhook backup fallback trigger
        BE-->>User: Websocket push notification: Welcome to class!
    end
    `,
    tableHeaders: ['Feature Layer', 'Interactive Modal Flow', 'Direct QR Scan Flow', 'Webhook Recovery Flow'],
    tableRows: [
      ['User Interaction', 'User clicks Pay, modal opens in-browser', 'User scans QR on mobile directly', 'None (asynchronous system event)'],
      ['Signature Verification', 'Cryptographic HMAC-SHA256 client payload', 'Manual input ref or webhook match', 'Razorpay header signature matching'],
      ['Processing Speed', 'Synchronous API verification, fast redirect', 'Asynchronous polling status check', 'Asynchronous server-to-server webhook'],
      ['Reliability Guard', 'Fails if tab is closed mid-transaction', 'Handles disconnected client state', 'Guarantees enrollment if client disconnects']
    ],
    concepts: [
      { title: 'HMAC-SHA256 Cryptography', desc: 'Secure signature matching using our key secret ensures that payment responses received from the browser are authentic.', category: 'Security' },
      { title: 'Kafka Decoupling', desc: 'By writing purchase events to Kafka, the HTTP client gets an instant success redirect while MongoDB batch operations happen in the background.', category: 'Infrastructure' },
      { title: 'Auto-Batch Allocation', desc: 'If no upcoming batch exists, the engine dynamically creates one scheduled 5 days from today, auto-populating topics from course metadata.', category: 'Automation' },
      { title: 'Webhook Recovery & Polling', desc: 'Webhooks catch payments where clients drop. Next.js polls the status every 3 seconds to auto-transition the user once verified.', category: 'Network' }
    ]
  },
  'contact-form-flow': {
    title: 'Course Contact Form Flow',
    subtitle: 'Local Docker vs Production API Routing',
    badge: 'API Gateway',
    summary: 'Expose the technical route divergence mapping. Renders both Scenario A (live production web host) and Scenario B (local sandbox Docker volumes) side-by-side.',
    chart: `
sequenceDiagram
    autonumber
    actor User as 👤 User Client
    participant FE as 🖥️ Next.js Frontend
    participant Prod as 🌐 Production API (https://tradingskill.com/api)
    participant Local as 💻 Local API (http://localhost:5000/api)

    User->>FE: Fills Contact Form & clicks "Send"
    FE->>FE: Captures state & stringifies JSON payload

    rect rgb(20, 184, 166, 0.05)
        note right of FE: Scenario A: Live Web Host
        FE->>Prod: POST /contact (Headers: application/json)
        Prod-->>FE: 200 OK (Enters system DB / sends email)
    end

    rect rgb(99, 102, 241, 0.05)
        note right of FE: Scenario B: Local Docker Sandbox
        FE->>Local: POST /contact (Headers: application/json)
        Local-->>FE: 200 OK (Logs locally in console)
    end

    FE->>User: Displays "Message Sent" feedback animation
    `,
    tableHeaders: ['Step Element', 'Production Deployment (https)', 'Local Development (http)'],
    tableRows: [
      ['Protocol Security', 'Encrypted TLS/SSL (HTTPS)', 'Unencrypted local network stream (HTTP)'],
      ['Domain Resolution', 'DNS points to public router IP', 'Hosts file maps localhost → loopback 127.0.0.1'],
      ['Port Forwarding', 'Server listens on standard 443 proxy ports', 'Direct mapping to internal container port 5000'],
      ['Payload Format', 'Production minified JSON string stream', 'Raw readable format payload']
    ],
    concepts: [
      { title: 'Reverse Proxy', desc: 'A production server redirects incoming traffic on port 443 to the node process running inside docker.', category: 'Deployment' },
      { title: 'Port Mapping', desc: 'In docker-compose.yml, "5000:5000" exposes port 5000 of the container onto the developers local machine.', category: 'Networking' },
      { title: 'CORS Headers', desc: 'Backend restricts request origin domain, allowing localhost in dev but locking it down to official domain in production.', category: 'Security' }
    ]
  },
  'weather-api-flow': {
    title: 'Weather API Request Flow',
    subtitle: 'External Integration Sequence',
    badge: 'Microservices',
    summary: 'A flow demonstrating how the application queries external weather services, processes credentials, and handles weather payload delivery to client components.',
    chart: `
sequenceDiagram
    autonumber
    participant Client as 🖥️ Next.js Web client
    participant Server as ⚙️ App Express Server
    participant Weather as ⛅ OpenWeather API

    Client->>Server: GET /api/weather?city=Katihar
    Note over Server: Fetches WEATHER_API_KEY<br/>from secure .env variables
    Server->>Weather: GET /weather?q=Katihar&appid=KEY&units=metric
    Note over Weather: 1. Validates API Token<br/>2. Compiles location coordinates<br/>3. Computes temperature & wind metric
    Weather-->>Server: 200 OK (JSON Payload)
    Note over Server: Filters and caches payload<br/>to prevent API rate limits
    Server-->>Client: 200 OK (Filtered Weather JSON)
    Client->>Client: Renders custom weather card in UI
    `,
    tableHeaders: ['Metric', 'Internal App APIs', 'External Weather API'],
    tableRows: [
      ['Network Protocol', 'Direct Express REST endpoint', 'Third-party HTTPS cloud service'],
      ['Access Key Security', 'Bearer session cookie / JWT token', 'Static appid API query string key'],
      ['Rate Limits', 'Custom local rate-limit middleware', 'Strict commercial tier limits (e.g. 60 req/min)'],
      ['Response Format', 'Database custom models', 'OpenWeather standard structure']
    ],
    concepts: [
      { title: 'API Key Masking', desc: 'Never expose API secrets to browsers; proxy the request through the Express backend so credentials remain hidden.', category: 'Security' },
      { title: 'Response Cache', desc: 'Save weather metrics in memory or Redis for 10 minutes to avoid redundant billing and microservice API limits.', category: 'Performance' },
      { title: 'Units Serialization', desc: 'Converting Kelvin temperature data from the raw weather payload to Celsius on the server before client rendering.', category: 'Formatting' }
    ]
  },
  'mongodb-crud-flow': {
    title: 'MongoDB CRUD Flow',
    subtitle: 'Controller to Persistence Tier Lifecycle',
    badge: 'Persistence Tier',
    summary: 'Maps frontend React component forms to Express routes, middleware validations, and Mongoose driver operations interacting directly with the MongoDB database cluster.',
    chart: `
flowchart TD
    subgraph Frontend [Client UI Engine]
        UI[React Form Component]
    end

    subgraph Controller [Express API Router & Controllers]
        Router{HTTP Route Match}
        Router -->|POST| C[Create: .create]
        Router -->|GET| R[Read: .find / .findById]
        Router -->|PUT/PATCH| U[Update: .findByIdAndUpdate]
        Router -->|DELETE| D[Delete: .deleteOne]
    end

    subgraph Mongoose [Object Document Mapper]
        Schema[Schema Verification & Middleware]
    end

    subgraph DataStore [Persistence Layer]
        DB[(MongoDB Cluster)]
    end

    UI -->|HTTP Request / JSON Payload| Router
    C --> Schema
    R --> Schema
    U --> Schema
    D --> Schema
    
    Schema -->|Mongoose CRUD Driver API| DB
    DB ===>|Returns Query Document Stream| Controller
    Controller ===>|HTTP Response / JSON Output| UI

    classDef orange fill:#fff7ed,stroke:#ea580c,stroke-width:2px;
    classDef blue fill:#eff6ff,stroke:#2563eb,stroke-width:2px;
    classDef green fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    class Router orange;
    class UI blue;
    class DB green;
    `,
    tableHeaders: ['CRUD Operation', 'HTTP Route', 'Mongoose Command', 'Database Effect'],
    tableRows: [
      ['Create', 'POST /api/batches', 'new Batch(data).save()', 'Inserts a new document into collection'],
      ['Read', 'GET /api/batches/:id', 'Batch.findById(id)', 'Queries collection index for matching documents'],
      ['Update', 'PATCH /api/batches/:id', 'Batch.findByIdAndUpdate(id)', 'Modifies specific document fields in-place'],
      ['Delete', 'DELETE /api/batches/:id', 'Batch.deleteOne({ _id: id })', 'Evicts document from database index']
    ],
    concepts: [
      { title: 'ODM Validation', desc: 'Mongoose checks data types, required fields, and validations before forwarding queries to the database cluster.', category: 'Validation' },
      { title: 'Mongoose Pre-Save Hook', desc: 'Automatically recalculates completion metrics and percentages before the document hits database storage.', category: 'Database' },
      { title: 'Indexes', desc: 'Object IDs automatically act as primary keys in MongoDB, ensuring constant-time lookup performance.', category: 'Performance' }
    ]
  }
};

export default function ArchitectureDetail() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'diagram' | 'details' | 'comparison'>('diagram');

  const slug = params.slug as string;
  const data = DATA[slug];

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic">Blueprint Not Found</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">The requested systems walkthrough doesn't exist.</p>
          <Link href="/architecture" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest text-xs border border-emerald-500/20 px-6 py-3 rounded-full bg-emerald-500/5">
            <ArrowLeft className="w-4 h-4" /> Back to blueprints
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/architecture" 
            className="group inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            Blueprint Dashboard
          </Link>

          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <Activity className="w-3 h-3 animate-pulse" />
            {data.badge}
          </span>
        </div>

        {/* Title Header */}
        <div className="space-y-4">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">{data.subtitle}</div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{data.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-3xl leading-relaxed">{data.summary}</p>
        </div>

        {/* Dynamic Controls / Tabs */}
        <div className="flex border-b border-black/5 dark:border-white/5 gap-6">
          {[
            { id: 'diagram', label: 'Flow Diagram', icon: Layers },
            { id: 'details', label: 'Core Concepts', icon: Info },
            { id: 'comparison', label: 'Comparison Matrix', icon: TableIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 font-black uppercase tracking-widest text-[10px] border-b-2 transition-all relative ${
                  activeTab === tab.id 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Display Window */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden relative">
          
          {/* Flow Diagram Tab */}
          {activeTab === 'diagram' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <Mermaid chart={data.chart} />
            </div>
          )}

          {/* Core Concepts Tab */}
          {activeTab === 'details' && (
            <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-6 duration-300">
              {data.concepts.map((concept, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 border border-black/5 dark:border-white/5 space-y-3 shadow-inner hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full">
                      {concept.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-800 text-sm font-black italic">#{idx + 1}</span>
                  </div>
                  <h3 className="text-md font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                    {concept.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {concept.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Matrix Tab */}
          {activeTab === 'comparison' && (
            <div className="overflow-x-auto rounded-3xl border border-black/5 dark:border-white/5 shadow-inner animate-in fade-in duration-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-black/5 dark:border-white/5">
                    {data.tableHeaders.map((header, idx) => (
                      <th key={idx} className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 bg-slate-50/50 dark:bg-transparent">
                  {data.tableRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/20 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className={`p-5 text-xs font-medium ${cellIdx === 0 ? 'font-black text-slate-800 dark:text-white uppercase tracking-wider text-[10px]' : 'text-slate-500 dark:text-slate-400'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
