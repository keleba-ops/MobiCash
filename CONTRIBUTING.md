# Contributing to MobiCash Agent

Thank you for your interest in contributing to MobiCash Agent! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Use the bug report template if available
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

### Suggesting Features

1. Check existing issues for similar requests
2. Describe the feature and its benefits
3. Provide examples or mockups if possible
4. Explain how it fits the project's goals

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m 'Add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 💻 Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/mobicash-agent.git
cd mobicash-agent

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests (when available)
npm test

# Build for production
npm run build
```

## 📋 Code Style Guidelines

### TypeScript
- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow React best practices

### CSS/Tailwind
- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain responsive design
- Use consistent spacing and colors

### File Organization
- Components in `src/components/`
- Utilities in `src/utils/`
- Types in `src/types.ts`
- Store logic in `src/store.ts`

## 🧪 Testing

Before submitting a PR:
- Test all affected features manually
- Ensure no console errors
- Test on multiple screen sizes
- Verify theme changes work correctly
- Check dark mode compatibility

## 📝 Commit Messages

Use conventional commits format:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## 🔍 Code Review Process

1. All PRs require review before merging
2. Address review comments promptly
3. Keep PRs focused and small when possible
4. Update documentation if needed

## 🎨 Design Guidelines

- Follow existing design patterns
- Maintain consistency with current UI
- Ensure accessibility (WCAG 2.1 AA)
- Support both light and dark modes
- Test on mobile and desktop

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Document new features in README
- Update API documentation if applicable

## ❓ Questions?

Feel free to open an issue for clarification or reach out to the maintainers.

## 🙏 Recognition

Contributors will be added to the contributors list in README.md.

Thank you for helping make MobiCash Agent better!

---

© 2024 Verge Dynamics
