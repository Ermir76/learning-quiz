import React from 'react';
// Keep the original icons you already have
import { CodeIcon, HistoryIcon, ScienceIcon } from '../components/Icons';

// ==================================================================================
// NEW ICONS FOR EACH CATEGORY
// These are simple SVG components to replace the placeholders.
// ==================================================================================

const iconStyle = "h-12 w-12 text-slate-400";

const LiteratureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const MathIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7l3 3m0 0l3-3m-3 3v4m0 0H9m3 0h3m-3 4.5a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v6.5zM15 12a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v3z" />
    <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GeographyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.25 9.75h17.5M3.25 14.25h17.5M12 3.25c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9 4.5-4.03 4.5-9-2.015-9-4.5-9z" />
  </svg>
);

const ArtsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.572l-7.5-7.5" />
  </svg>
);

const SportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
  </svg>
);

const TechnologyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6.343A5.657 5.657 0 0117.657 12 5.657 5.657 0 0112 17.657 5.657 5.657 0 016.343 12 5.657 5.657 0 0112 6.343z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l.01.01M15 9l.01.01M10.5 13.5l3-3" />
  </svg>
);

const HealthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const BusinessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075a2.275 2.275 0 01-2.275 2.275H5.925a2.275 2.275 0 01-2.275-2.275V14.15M15.75 14.15v2.232a2.25 2.25 0 01-1.125 1.949l-3.375 1.956a2.25 2.25 0 01-2.25 0L5.625 18.331a2.25 2.25 0 01-1.125-1.95V14.15m0-3.375l3.375-1.956a2.25 2.25 0 012.25 0l3.375 1.956m-9.75 0l3.375-1.956a2.25 2.25 0 012.25 0l3.375 1.956" />
  </svg>
);


// ==================================================================================
// UPDATED CATEGORY DATA
// The list of all categories the AI can create, now with unique icons.
// ==================================================================================
const initialCategoriesData = [
  { id: 'cat1', name: 'Programming', description: 'Quizzes on C#, Python, web development, and more.', icon: <CodeIcon /> },
  { id: 'cat2', name: 'History', description: 'From ancient times to the modern era.', icon: <HistoryIcon /> },
  { id: 'cat3', name: 'Science', description: 'Quizzes about biology, physics, and chemistry.', icon: <ScienceIcon /> },
  { id: 'cat4', name: 'Literature', description: 'Explore classic and modern literature.', icon: <LiteratureIcon /> },
  { id: 'cat5', name: 'Mathematics', description: 'Test your knowledge of mathematical concepts.', icon: <MathIcon /> },
  { id: 'cat6', name: 'Geography', description: 'Discover the world and its features.', icon: <GeographyIcon /> },
  { id: 'cat7', name: 'Arts', description: 'Quizzes on painting, music, and culture.', icon: <ArtsIcon /> },
  { id: 'cat8', name: 'Sports', description: 'Challenge your sports trivia knowledge.', icon: <SportsIcon /> },
  { id: 'cat9', name: 'Technology', description: 'From the internet to artificial intelligence.', icon: <TechnologyIcon /> },
  { id: 'cat10', name: 'Health', description: 'Learn about the human body and wellness.', icon: <HealthIcon /> },
  { id: 'cat11', name: 'Business', description: 'Quizzes on economics and entrepreneurship.', icon: <BusinessIcon /> },
];

// ==================================================================================
// INITIAL QUIZ DATA
// This is now empty, so the app starts with no pre-made quizzes.
// All quizzes will be generated by the AI and loaded from localStorage.
// ==================================================================================
const initialQuizzesData = {};

export { initialCategoriesData, initialQuizzesData };
