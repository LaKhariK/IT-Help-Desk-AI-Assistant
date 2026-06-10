# ServiceDesk AI

An AI-powered IT Help Desk application inspired by ServiceNow, built with React, Node.js/Express, and Anthropic's Claude API.

## Features

- 🎫 **Incident Management** — Create, track, and resolve IT tickets
- 🤖 **AI Triage** — Claude auto-categorizes tickets and suggests fix steps on submission
- 💬 **AI Chat** — Context-aware assistant for each ticket and a standalone IT chat
- 📚 **Knowledge Base** — AI-powered Q&A against IT documentation
- 📊 **Dashboard** — Live stats and incident overview
- 🔐 **Authentication** — Register and login to access the portal

## Tech Stack

- **Frontend:** React 18
- **Backend:** Node.js, Express
- **AI:** Anthropic Claude (claude-sonnet-4-20250514)

## Setup

```bash
git clone <your-repo>
cd helpdesk2
npm run install:all

cd server
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

cd ..
npm run dev
```

## Built by

LaKhari King — [lakhariking.com](https://lakhariking.com)