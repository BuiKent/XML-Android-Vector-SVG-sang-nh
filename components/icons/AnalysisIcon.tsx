
import React from 'react';

export const AnalysisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
    <rect x="8" y="1" width="8" height="4" rx="1" ry="1" />
    <path d="m12 16 2 2 4-4" />
    <path d="M9 8h6" />
    <path d="M9 12h2" />
  </svg>
);
