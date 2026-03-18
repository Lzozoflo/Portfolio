# Repository Structure

![alt text](repo_structure.svg)



./Portfolio/  
│  
├── .husky/  # Commit convention
│  
├── .Markdown/  # Markdown file
│  
├── apps/  
│   ├── backend/ # Express + TypeScript  
│   └── frontend/ # React + Vite  
│  
├── infra/  
│   └── nginx/ # Config Nginx  
│  
├── packages/  
│   └── shared/ # Types partagés Front/Back  
│  
├── .env.example  
├── .eslintrc.js  
├── .gitignore  
├── .prettierrc  
├── docker-compose.yml  
├── Makefile  
├── package.json  # Workspace root (npm workspaces)  
└── ReadMe.md

<!-- ├── commitlint.config.js   -->



Flux de trafic : 
Client Browser 
│ ▼ :80 nginx (reverse proxy)
├── /api/* ──────▶ backend:3000 
└── /* ──────▶ frontend:5173 
│ postgres:5432 ◀────────────┘ (réseau Docker interne uniquement)