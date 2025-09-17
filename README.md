# FinSight - Personal Finance Management App

A modern, full-stack personal finance application built with Next.js, Supabase, and OpenAI integration. Track your financial goals, get AI-powered financial advice, and manage your financial journey all in one place.

## 🚀 Live Demo

[View Live Demo](https://your-app-name.vercel.app) *(Update with your Vercel URL)*

## ✨ Features

- **User Authentication** - Secure signup/login with Supabase Auth
- **Financial Goal Tracking** - Set and monitor short-term, medium-term, and long-term financial goals
- **AI Financial Advisor** - Get personalized financial advice powered by OpenAI GPT-3.5
- **Progress Visualization** - Track your progress with intuitive charts and metrics
- **Responsive Design** - Beautiful, modern UI that works on all devices
- **Dark/Light Mode** - Toggle between themes for comfortable viewing
- **Real-time Updates** - Instant updates across all your devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons

### Backend
- **Supabase** - Backend-as-a-Service (Database, Auth, Real-time)
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Secure data access

### AI Integration
- **OpenAI GPT-3.5** - AI-powered financial advice
- **Rate Limiting** - Cost protection and abuse prevention

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend hosting

## 📁 Project Structure

```
finsight/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── chat/           # AI chat interface
│   │   ├── dashboard/      # Main dashboard
│   │   ├── goals/          # Goals management
│   │   └── profile/        # User profile
│   ├── components/         # Reusable React components
│   ├── lib/               # Utility functions and configurations
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── migrations/        # Database migration files
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/finsight.git
   cd finsight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPEN_AI_KEY=your_openai_api_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/` in order:
     - `20240320000000_create_tables_fixed.sql`
     - `20240320000000_create_goal_progress.sql`
     - `20240320000000_add_delete_user_function.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Key Tables

- **user_profiles** - User information and preferences
- **goal_progress** - Financial goals and progress tracking
- **conversations** - AI chat conversation history
- **messages** - Individual chat messages

### Security

- Row Level Security (RLS) enabled on all tables
- User data isolation and protection
- Secure authentication with Supabase Auth

## 🔧 API Endpoints

- `POST /api/chat` - AI chat functionality
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]/messages` - Get conversation messages

## 🛡️ Security Features

- **Rate Limiting** - 3 requests/minute, 10 requests/day per user
- **Input Validation** - Message length limits and sanitization
- **Authentication** - Secure user authentication with Supabase
- **Data Protection** - Row Level Security for database access

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference support
- **Smooth Animations** - Framer Motion integration
- **Loading States** - User feedback during operations
- **Error Handling** - Graceful error messages

## 📱 Screenshots

*Add screenshots of your app here*

## 🤝 Contributing

This is a portfolio project, but feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [OpenAI](https://openai.com) for the AI capabilities
- [Vercel](https://vercel.com) for the deployment platform
- [Tailwind CSS](https://tailwindcss.com) for the styling framework

---

**Note**: This is a portfolio project demonstrating full-stack development skills. The AI chat feature has rate limits to prevent excessive API costs.