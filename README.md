# Who Is Right

A React web application that uses Large Language Models to determine who is right between two answers to a question.

## 🚀 Project Status

This project is currently in development. The basic React setup is complete, and we're ready to start building the user interface.

## 📋 Features (Planned)

- Submit a question with two competing answers
- LLM-powered analysis to determine which answer is more correct
- Clean, responsive user interface
- Secure API key handling
- Rate limiting to control costs
- Support for multiple LLM providers

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An API key from your chosen LLM provider

### Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API key

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔐 Security Notes

- Never commit your `.env` file to git
- Keep your API keys secure
- Consider implementing usage limits to control costs

## 🏗️ Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API calls and utilities
│   └── styles/         # CSS/styling files
├── public/             # Static assets
└── .env.example        # Environment variables template
```

## 📖 Development

See `TODO.md` for detailed development phases and tasks.

## 🚀 Getting Started

This project uses Vite for fast development and building. After setup, you can:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
