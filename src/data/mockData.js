

export const USERS = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'student@demo.com',
    password: '123456',
    role: 'student',
    avatar: null,
    initials: 'AR',
    joined: 'Sep 2023',
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@demo.com',
    password: '123456',
    role: 'admin',
    avatar: null,
    initials: 'AU',
    joined: 'Jan 2023',
  },
]

export const DOCUMENTS = [
  {
    id: 1,
    name: 'Quantum_Physics_Vol4.pdf',
    subject: 'Physics',
    type: 'PDF',
    size: '4.2MB',
    date: 'Oct 24',
    status: 'Active',
    pages: 88,
    aiSessions: 12,
  },
  {
    id: 2,
    name: 'Machine_Learning_Intro.docx',
    subject: 'AI',
    type: 'DOCX',
    size: '1.1MB',
    date: 'Oct 22',
    status: 'Pending Review',
    pages: 34,
    aiSessions: 8,
  },
  {
    id: 3,
    name: 'Neural_Architecture_2024.pdf',
    subject: 'AI',
    type: 'PDF',
    size: '2.8MB',
    date: 'Oct 20',
    status: 'Active',
    pages: 56,
    aiSessions: 21,
  },
  {
    id: 4,
    name: 'Database_Normalization_Patterns.docx',
    subject: 'Databases',
    type: 'DOCX',
    size: '1.5MB',
    date: 'Oct 18',
    status: 'Active',
    pages: 22,
    aiSessions: 5,
  },
  {
    id: 5,
    name: 'Thermodynamics_Lab_Report.pdf',
    subject: 'Physics',
    type: 'PDF',
    size: '3.1MB',
    date: 'Oct 15',
    status: 'Active',
    pages: 18,
    aiSessions: 3,
  },
]

export const SUBJECTS = [
  { id: 1, name: 'Software Engineering', icon: 'code', docs: 42, newDocs: 5, color: 'blue' },
  { id: 2, name: 'Database Systems', icon: 'database', docs: 28, newDocs: 2, color: 'green' },
  { id: 3, name: 'Artificial Intelligence', icon: 'brain', docs: 56, newDocs: 12, color: 'purple' },
  { id: 4, name: 'Web Development', icon: 'globe', docs: 19, newDocs: 1, color: 'orange' },
]

export const AI_CHAT_MESSAGES = [
  {
    id: 1,
    role: 'user',
    text: 'Summarize this document for me',
  },
  {
    id: 2,
    role: 'assistant',
    text: "Here is a short summary of Quantum_Physics_Vol4.pdf. This volume covers Heisenberg's uncertainty principle, wave-particle duality, and the mathematical foundations of Schrödinger's equation in various potentials...",
  },
]

export const STUDENT_STATS = {
  totalDocuments: 1248,
  newDocuments: 12,
  activeSubjects: 14,
  aiChatSessions: 84,
  recentDownloads: 3,
  storageUsed: 12.4,
  storageTotal: 50,
  storageBreakdown: [
    { type: 'PDF', pct: 60 },
    { type: 'DOCX', pct: 20 },
    { type: 'PPTX', pct: 15 },
  ],
}

export const ADMIN_STATS = {
  totalUsers: 12842,
  userGrowth: '+12%',
  dailyActiveUsers: 2410,
  lockedAccounts: 42,
  totalDocs: '1.2M',
  pendingReview: 18,
  hiddenDocs: 56,
  totalSubjects: 24,
  aiSessions: 45901,
  storageUsed: 4.2,
  storageTotal: 5.6,
}

export const ADMIN_USERS = [
  { id: 1, initials: 'JD', name: 'John Doe',         email: 'john.d@university.edu',   role: 'Student',    status: 'Active',  joined: '2h ago' },
  { id: 2, initials: 'MT', name: 'Mary Taylor',       email: 'm.taylor@tech-institute.com', role: 'Researcher', status: 'Locked',  joined: '5h ago' },
  { id: 3, initials: 'SJ', name: 'Sarah Jenkins',     email: 's.jenkins@academia.ai',    role: 'Researcher', status: 'Active',  joined: '2 mins ago' },
  { id: 4, initials: 'DM', name: 'David Miller',      email: 'david.m@univ.edu',          role: 'Student',    status: 'Locked',  joined: '14h ago' },
  { id: 5, initials: 'ER', name: 'Elena Rodriguez',   email: 'elena.rod@global.ai',       role: 'Admin',      status: 'Active',  joined: 'Just now' },
  { id: 6, initials: 'AR', name: 'Alex Rivers',       email: 'alex.rivers@university.edu',role: 'Student',    status: 'Active',  joined: '1h ago' },
  { id: 7, initials: 'MB', name: 'Michael Brown',     email: 'm.brown@oxford.edu',        role: 'Student',    status: 'Active',  joined: '3h ago' },
]

export const PENDING_DOCS = [
  { id: 1, name: 'Deep Learning Notes',       type: 'PDF',  pages: 42, uploadedBy: 'Alex Rivera',   subject: 'AI',        size: '12.4 MB', date: 'Oct 24, 2023', flag: 'High Report Count' },
  { id: 2, name: 'SQL Optimization Guide',    type: 'DOCX', pages: 12, uploadedBy: 'Sarah Jenkins', subject: 'Databases', size: '2.1 MB',  date: 'Oct 25, 2023', flag: 'Pending Review' },
]

export const TOP_DOCS = [
  { rank: 1, name: 'Neural Networks: Comprehensive Intro', refs: '4.2k', subject: 'AI Subject', type: 'PDF' },
  { rank: 2, name: 'Database Normalization Patterns',       refs: '2.8k', subject: 'Databases',  type: 'DOCX' },
]

export const SUBJECT_ACTIVITY = [
  { icon: 'code',     name: 'Software Eng.',        docs: '1.2k', color: 'blue' },
  { icon: 'database', name: 'Database Systems',     docs: '842',  color: 'green' },
  { icon: 'brain',    name: 'Artificial Intelligence', docs: '2.4k', color: 'purple' },
  { icon: 'globe',    name: 'Web Dev',               docs: '450',  color: 'orange' },
]
