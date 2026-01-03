# Contributing to UGC Ticketing

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ugc-ticketing.git
cd ugc-ticketing

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests

Example: `feature/add-email-notifications`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(tickets): add bulk status update
fix(auth): resolve token refresh issue
docs(readme): update installation steps
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass: `npm run test`
4. Ensure no lint errors: `npm run lint`
5. Ensure types are correct: `npm run typecheck`
6. Update CHANGELOG.md
7. Request review from maintainers

## Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful comments
- Use descriptive variable names

## Testing

- Write unit tests for utilities
- Write integration tests for API routes
- Write component tests for UI
- Aim for >60% coverage
```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## Documentation

- Update README.md for user-facing changes
- Update API_DOCUMENTATION.md for API changes
- Add JSDoc comments for functions
- Update types in `/src/types`

## Questions?

Open an issue or contact the maintainers.