# 🤝 Contributing to Multi-AI Chat Platform

Thank you for your interest in contributing to this project! 

⚡ **Note**: This entire codebase was generated using AI agents inside Cursor, but we welcome human contributions to improve and extend the platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed
- Firebase account
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/multi-ai-chat-platform.git
   cd multi-ai-chat-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🛠️ Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled automatically
- **Tailwind CSS**: Use utility classes for styling
- **Component Structure**: Follow existing patterns

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Main page components  
├── context/       # React Context providers
├── hooks/         # Custom React hooks
├── adapters/      # AI provider integrations
├── utils/         # Utility functions
└── styles/        # Global styles
```

### Naming Conventions

- **Components**: PascalCase (`ChatMessage.jsx`)
- **Files**: camelCase (`useAuth.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **CSS Classes**: Tailwind utilities

## 📝 How to Contribute

### 1. Issues

Before creating a new issue:
- Search existing issues to avoid duplicates
- Use the provided issue templates
- Include detailed reproduction steps
- Add relevant labels

### 2. Pull Requests

#### Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow existing patterns
   - Add tests for new features

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```
   
   Use conventional commit messages:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

#### PR Guidelines

- **Title**: Clear, descriptive title
- **Description**: Explain what changes you made and why
- **Screenshots**: Include before/after screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Clearly mark any breaking changes

### 3. Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists
- Describe the use case clearly
- Explain how it fits with the project goals
- Consider implementation complexity

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test ChatMessage.test.jsx
```

### Writing Tests

- Write tests for new components and functions
- Use Testing Library best practices
- Mock external dependencies (Firebase, AI APIs)
- Test user interactions and edge cases

### Test Structure

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })
})
```

## 🔧 Technical Details

### Architecture

- **Frontend**: React 19 with TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom components
- **Build Tool**: Vite for fast development and builds
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **AI Integration**: Multiple provider adapters

### Key Components

- **AuthContext**: Manages user authentication
- **ApiKeyContext**: Handles API key storage and management
- **ChatContext**: Manages chat state and history
- **AI Adapters**: Interfaces for different AI providers

### Performance Considerations

- Lazy loading for components
- Efficient re-renders with proper dependency arrays
- Optimized Firebase queries
- Proper error boundaries

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**
   - OS and version
   - Browser and version
   - Node.js version

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots or videos

3. **Additional Context**
   - Console errors
   - Network requests
   - Firebase logs

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- 🔧 Bug fixes and stability improvements
- 📱 Mobile responsiveness enhancements
- ♿ Accessibility improvements
- 🧪 Test coverage expansion

### Medium Priority
- 🌙 Dark mode implementation
- 🌍 Internationalization (i18n)
- 📊 Analytics and monitoring
- 🔍 Search functionality

### Low Priority
- 🎨 UI/UX enhancements
- 📖 Documentation improvements
- 🚀 Performance optimizations
- 🔌 New AI provider integrations

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Firebase Documentation](https://firebase.google.com/docs)

### AI Provider APIs
- [OpenAI API](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Zhipu AI API](https://open.bigmodel.cn/dev/api)

## 💬 Community

- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Code Review**: All PRs receive thorough code review

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- README acknowledgments section

---

**Thank you for helping make this AI-generated project even better!** 🤖❤️

⚡ Remember: While this codebase was generated by AI agents in Cursor, human creativity and expertise make it truly great!
