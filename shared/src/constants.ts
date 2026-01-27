// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Branding
export const BRAND = {
  name: '4hacks Learning',
  shortName: '4hacks',
  tagline: 'Learn, Build, and Compete in One Platform',
  description: 'Your complete learning ecosystem for mastering skills, earning certifications, and applying them in real hackathons.',
};

// Colors (Retro Brutalism Style)
export const COLORS = {
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#A3E635', // Lime green from Figma
  accentPink: '#EC4899', // Pink
  accentPurple: '#8B5CF6', // Purple
  accentYellow: '#FACC15', // Yellow
  background: '#FFFFFF',
  backgroundAlt: '#FDF4FF', // Light pink background
  text: '#000000',
  textMuted: '#6B7280',
  border: '#000000',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

// Course Categories
export const COURSE_CATEGORIES = [
  'DeFi',
  'Blockchain',
  'Wallets',
  'Smart Contracts',
  'Web3',
  'NFTs',
  'DAOs',
  'Security',
  'Frontend',
  'Backend',
] as const;

// Course Tags
export const COURSE_TAGS = [
  'Hedera',
  'Ethereum',
  'Solana',
  'React',
  'Next.js',
  'Node.js',
  'TypeScript',
  'Rust',
  'Solidity',
  'DeFi',
  'NFT',
  'DAO',
] as const;

// Quiz Constants
export const QUIZ_CONSTANTS = {
  DEFAULT_PASSING_SCORE: 70,
  MIN_PASSING_SCORE: 50,
  MAX_PASSING_SCORE: 100,
  DEFAULT_TIME_LIMIT: 30, // minutes
  MAX_TIME_LIMIT: 180, // minutes
};

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
  MAX_LIMIT: 100,
};

// File Upload
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/zip'],
};

// Certificate
export const CERTIFICATE_CONSTANTS = {
  CODE_LENGTH: 12,
  CODE_PREFIX: '4H',
};

// University/Company Partners
export const PARTNERS = [
  { name: 'Harvard University', logo: '/partners/harvard.png' },
  { name: 'Stanford', logo: '/partners/stanford.png' },
  { name: 'Google', logo: '/partners/google.png' },
  { name: 'Tokopedia', logo: '/partners/tokopedia.png' },
  { name: 'University of Cambridge', logo: '/partners/cambridge.png' },
  { name: 'Oxford', logo: '/partners/oxford.png' },
  { name: 'Microsoft', logo: '/partners/microsoft.png' },
  { name: 'Amazon', logo: '/partners/amazon.png' },
  { name: 'Samsung', logo: '/partners/samsung.png' },
];

// Target Audience
export const TARGET_AUDIENCE = [
  'Hackers',
  'Professionals',
  'Students',
  'Career switchers',
  'Hackathon organizers',
];

// Why Learn on 4hacks
export const WHY_4HACKS = [
  {
    title: 'Built For Hackers',
    description: 'Content designed around real hackathon challenges, not abstract theory.',
  },
  {
    title: 'Hands-on learning',
    description: 'Every course includes practical exercises, projects, and real-world scenarios.',
  },
  {
    title: 'Recognized certifications',
    description: 'Earn certifications you can showcase on your 4hacks profile and share with employers.',
  },
];

// Community Stats
export const COMMUNITY_STATS = {
  members: '50K+',
  countries: '120+',
  support: '24/7',
};

// FAQ
export const FAQ_ITEMS = [
  {
    question: 'Is 4hacks Education free?',
    answer: 'We offer both free and premium courses. Many foundational courses are completely free, while advanced certifications may require a one-time payment.',
  },
  {
    question: 'Do I need prior experience to start?',
    answer: 'Not at all! We have courses for all skill levels, from complete beginners to advanced developers. Each course clearly indicates the required prerequisites.',
  },
  {
    question: 'How are the courses different from traditional online courses?',
    answer: 'Our courses are specifically designed around hackathon challenges and real-world Web3 projects. You learn by building, not just watching.',
  },
  {
    question: 'What kind of certifications do you offer?',
    answer: 'We offer skill-based certifications in various Web3 technologies including DeFi, smart contracts, blockchain development, and more. Each certification validates practical skills through hands-on assessments.',
  },
  {
    question: 'Are the certifications recognized?',
    answer: 'Yes! Our certifications are recognized by hackathon organizers and Web3 companies. They appear on your 4hacks profile and can be verified by anyone using our verification system.',
  },
];

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/4hacks',
  discord: 'https://discord.gg/4hacks',
  linkedin: 'https://linkedin.com/company/4hacks',
  github: 'https://github.com/4hacks',
};

// Footer Links
export const FOOTER_LINKS = {
  product: [
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Courses', href: '/courses' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'BUIDLs', href: '/buidls' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Community', href: '/community' },
    { label: 'Support', href: '/support' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Partners', href: '/partners' },
    { label: 'Press', href: '/press' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Licenses', href: '/licenses' },
  ],
};
