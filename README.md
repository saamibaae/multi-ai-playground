
# Multi-AI Chat Platform

⚡ **Entire codebase generated using AI agents inside Cursor.**

A modern, responsive chat platform that enables seamless conversations with multiple AI providers simultaneously. Built with React, Vite, Tailwind CSS, and Firebase for a lightning-fast, secure, and scalable experience.

![Multi-AI Chat Platform](https://img.shields.io/badge/Built%20with-AI%20Agents-blue?style=for-the-badge&logo=cursor)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12.1.0-FFCA28?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.13-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🤖 **Multi-AI Support**: Chat with OpenAI GPT, Google Gemini, Anthropic Claude, and Zhipu AI simultaneously
- 🔐 **Secure Authentication**: Google OAuth integration with Firebase Auth
- 🔑 **API Key Management**: Secure storage and management of API keys with Firebase Firestore
- 💬 **Persistent Chat History**: All conversations saved to Firebase with cross-device synchronization
- 🎨 **Modern UI/UX**: Clean, responsive design with Tailwind CSS and smooth animations
- 📱 **Mobile Responsive**: Optimized for all screen sizes
- ⚡ **Real-time Sync**: Instant synchronization across devices and browser tabs
- 🌙 **Dark Mode Ready**: Prepared for dark theme implementation
- 🔄 **Offline Support**: Graceful fallback to localStorage when offline
- 🚪 **Easy Logout**: Multiple logout options with confirmation dialogs

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1, Vite 5.4.8, TypeScript
- **Styling**: Tailwind CSS 3.4.13 with custom animations
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **AI Providers**: OpenAI, Google Gemini, Anthropic Claude, Zhipu AI
- **State Management**: React Context API
- **Routing**: React Router DOM 6.26.2
- **Icons**: Lucide React
- **Testing**: Vitest, Testing Library
- **Build Tools**: Vite, ESLint, PostCSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- API keys for desired AI providers

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/saamibaae/multi-ai-chat-platform.git
   cd multi-ai-chat-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### API Keys Setup

The app supports entering API keys directly in the UI:

1. Sign in with Google
2. Navigate to Settings (`/apikey`)
3. Enter your API keys for desired providers:
   - **OpenAI**: Get from [OpenAI API Keys](https://platform.openai.com/api-keys)
   - **Google Gemini**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **Anthropic Claude**: Get from [Anthropic Console](https://console.anthropic.com/)
   - **Zhipu AI**: Get from [Zhipu AI Platform](https://open.bigmodel.cn/)

> **Note**: API keys are securely stored in Firebase Firestore and synchronized across your devices. The `.env.local` file is optional for personal development use.

## 🔥 Firebase Deployment

### Step-by-Step Deployment Guide

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   - Choose "Hosting: Configure files for Firebase Hosting"
   - Select your existing Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: **Yes**
   - Set up automatic builds and deploys with GitHub: **Optional**

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

6. **Access your deployed app**
   
   Your app will be available at: `https://your-project-id.web.app`

### Production Configuration

The app is pre-configured for production deployment with:

- ✅ Optimized build output in `/dist`
- ✅ Single-page app routing configuration
- ✅ Firebase Hosting rules
- ✅ Firestore security rules
- ✅ Environment variable support

## 📁 Project Structure

```
multi-ai-chat-platform/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Chat/          # Chat-related components
│   │   ├── Layout/        # Navigation and layout
│   │   └── Settings/      # Settings and configuration
│   ├── context/           # React Context providers
│   │   ├── ApiKeyContext.jsx    # API key management
│   │   ├── AuthContext.jsx      # Authentication
│   │   └── ChatContext.jsx      # Chat state management
│   ├── pages/             # Main page components
│   ├── adapters/          # AI provider adapters
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── styles/            # Global styles
├── public/                # Static assets
├── firestore.rules        # Firestore security rules
├── firebase.json          # Firebase configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run validate-firebase` - Validate Firebase configuration

## 🛡️ Security

- **Firebase Security Rules**: Strict rules ensuring users can only access their own data
- **API Key Protection**: Keys stored securely in Firestore, never in client-side code
- **Authentication Required**: All features require Google OAuth authentication
- **HTTPS Only**: Deployed with Firebase Hosting using HTTPS by default

## 🤝 Contributing

This project was entirely generated using AI agents, but contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cursor AI**: This entire codebase was generated using AI agents inside Cursor
- **OpenAI**: GPT integration
- **Google**: Gemini AI and Firebase services
- **Anthropic**: Claude AI integration
- **Zhipu AI**: AI model integration
- **React Team**: Amazing framework
- **Vite Team**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/multi-ai-chat-platform/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

**⚡ Remember: This entire codebase was generated using AI agents inside Cursor - showcasing the power of AI-assisted development!**

Made with ❤️ and 🤖 AI

