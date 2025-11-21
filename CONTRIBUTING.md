# Contributing to NearMe

Thank you for your interest in contributing to NearMe! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search for similar issues before creating a new one
2. **Create a detailed report** - Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information
   - Console errors if any

### Suggesting Features

1. **Check the roadmap** - See if it's already planned
2. **Open a feature request** with:
   - Clear use case description
   - Why it would be valuable
   - Proposed implementation (optional)
   - Mockups or examples (optional)

### Submitting Pull Requests

#### Before You Start

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

**Code Style:**
- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

**React/Next.js Best Practices:**
- Use functional components with hooks
- Prefer server components when possible
- Use client components only when necessary
- Keep components small and reusable
- Use proper TypeScript types

**Styling:**
- Use Tailwind CSS utility classes
- Follow existing spacing/sizing patterns
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

**API Routes:**
- Add proper error handling
- Validate input parameters
- Return consistent JSON responses
- Add rate limiting if needed

#### Testing Your Changes

Before submitting, ensure:

1. **Functionality works** - Test all features thoroughly
2. **No console errors** - Check browser console
3. **Responsive design** - Test on mobile and desktop
4. **Cross-browser** - Test on Chrome, Safari, Firefox
5. **API calls work** - Verify with real API keys
6. **No TypeScript errors** - Run `npm run build`

#### Commit Guidelines

Use conventional commits format:

```bash
feat: add place comparison feature
fix: resolve location detection bug
docs: update API documentation
style: format navigation component
refactor: simplify search logic
test: add unit tests for search API
chore: update dependencies
```

**Good commit messages:**
- `feat: add interactive map view with markers`
- `fix: resolve Mumbai location glitch on navigation`
- `docs: add deployment guide for Railway`

**Bad commit messages:**
- `update`
- `fix bug`
- `changes`

#### Pull Request Process

1. **Update documentation** - Add relevant docs if needed
2. **Update README** - If you added features
3. **Test thoroughly** - Ensure nothing breaks
4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create PR** with:
   - Clear title describing the change
   - Description of what was changed and why
   - Screenshots/videos if UI changed
   - Link to related issue if applicable
   - Checklist of what was tested

**PR Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] No console errors
- [ ] TypeScript compiles

## Screenshots
(if applicable)

## Related Issue
Closes #123
```

### Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## Development Setup

See the main [README.md](./README.md#getting-started) for setup instructions.

### Quick Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/nearme-app.git
cd nearme-app

# Install dependencies
npm install --legacy-peer-deps

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── api/          # API routes
│   ├── page.tsx      # Homepage
│   └── ...
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   └── ...
├── hooks/            # Custom React hooks
└── lib/              # Utility functions
```

## Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI API** - AI search
- **Google Places API** - Place data

## What to Work On

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- UI enhancements
- Bug fixes
- Test coverage

### Priority Areas

1. **Performance optimization** - Caching, loading states
2. **Accessibility** - ARIA labels, keyboard navigation
3. **Mobile UX** - Touch gestures, responsive layouts
4. **Error handling** - Better error messages
5. **Testing** - Unit tests, E2E tests

### Areas Needing Help

- [ ] Add unit tests for API routes
- [ ] Implement Redis caching
- [ ] Add loading skeletons
- [ ] Improve mobile navigation
- [ ] Add keyboard shortcuts
- [ ] Implement map view
- [ ] Add place comparison
- [ ] Build itinerary planner

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Ask in pull request comments

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to NearMe! 🙏
