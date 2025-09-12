# Contributing to MCP Server for FAQsimple

Thank you for your interest in contributing to the MCP Server for FAQsimple! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions of all kinds:

- 🐛 **Bug reports and fixes**
- ✨ **New features and enhancements**
- 📖 **Documentation improvements**
- 🧪 **Tests and test improvements**
- 🎨 **Code quality improvements**

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git
- A FAQsimple account for testing (optional but recommended)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mcp-server-faqsimple.git
   cd mcp-server-faqsimple
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your FAQsimple API key (optional for development)
   export FAQSIMPLE_API_KEY="fs.your.test.key.here"
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
# or  
git checkout -b docs/documentation-improvement
```

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements

### 2. Make Changes

- Write clear, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Testing

Run the full test suite before submitting:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

### 4. Commit Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add search result caching for improved performance"

# Follow conventional commits format:
# feat: new feature
# fix: bug fix
# docs: documentation changes
# style: formatting, missing semicolons, etc
# refactor: code refactoring
# test: adding tests
# chore: maintenance tasks
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Detailed description of what was changed and why
- References to any related issues
- Screenshots for UI changes (if applicable)

## 🧪 Testing Guidelines

### Test Structure

We use Jest for testing. Tests should be placed in `__tests__` directories or use `.test.ts` suffix.

```bash
src/
  __tests__/
    faqsimple-api.test.ts
    index.test.ts
  faqsimple-api.ts
  index.ts
```

### Writing Tests

1. **Unit Tests** - Test individual functions and classes
   ```typescript
   describe('FAQsimpleAPI', () => {
     it('should initialize with valid API key', () => {
       const api = new FAQsimpleAPI({ apiKey: 'fs.test.key' });
       expect(api).toBeDefined();
     });
   });
   ```

2. **Integration Tests** - Test MCP server functionality
   ```typescript
   describe('MCP Server Integration', () => {
     it('should handle search_faqs tool call', async () => {
       // Test implementation
     });
   });
   ```

3. **Mock External APIs** - Don't make real API calls in tests
   ```typescript
   jest.mock('node-fetch');
   ```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Aim for >80% code coverage
- Tests should be fast and reliable
- Use descriptive test names

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all source code
- Follow existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises when possible

### Code Example

```typescript
/**
 * Search for FAQ content across all accessible FAQs
 * @param query - Search query string
 * @param limit - Maximum number of results to return
 * @returns Promise resolving to search results
 */
async searchFAQs(query: string, limit: number = 10): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const results = await this.performSearch(query);
    return results.slice(0, limit);
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}
```

### File Organization

```
src/
├── index.ts          # Main server entry point
├── faqsimple-api.ts  # FAQsimple API client
├── types.ts          # TypeScript type definitions
└── __tests__/        # Test files
    ├── faqsimple-api.test.ts
    └── index.test.ts
```

## 📖 Documentation

### Code Documentation

- Use JSDoc comments for all public functions and classes
- Include parameter and return type descriptions
- Add usage examples for complex functions

### README Updates

When adding features, update:
- Feature list
- Usage examples
- Configuration options
- API documentation

### Changelog

Add entries to `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

### Added
- New search result caching functionality

### Changed
- Improved error handling for API timeouts

### Fixed
- Fixed issue with special characters in search queries
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs actual behavior
4. **Environment details** (Node.js version, OS, etc.)
5. **Error messages** or logs
6. **Minimal code example** if applicable

### Feature Requests

For feature requests, please:

1. **Describe the feature** and its use case
2. **Explain why** it would be valuable
3. **Consider implementation** challenges
4. **Provide examples** of how it would work

## 🔍 Code Review Process

### What We Look For

- **Correctness** - Does the code work as intended?
- **Performance** - Is it efficient and scalable?
- **Security** - Are there any security concerns?
- **Maintainability** - Is the code readable and well-structured?
- **Testing** - Are there adequate tests?
- **Documentation** - Is it properly documented?

### Review Guidelines

- Reviews should be constructive and helpful
- Ask questions rather than making demands
- Suggest improvements with reasoning
- Acknowledge good work
- Be patient and respectful

## 🛡️ Security

### Reporting Security Issues

Please **DO NOT** report security vulnerabilities through GitHub issues.

Instead, email security concerns to: [security@example.com]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fixes (if any)

### Security Best Practices

- Never commit API keys or secrets
- Validate all user inputs
- Use environment variables for configuration
- Follow principle of least privilege
- Keep dependencies updated

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backward-compatible functionality
- **PATCH** version for backward-compatible bug fixes

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release commit
4. Tag the release
5. Publish to npm
6. Create GitHub release

## 📞 Getting Help

### Community

- **GitHub Discussions** - Ask questions and share ideas
- **GitHub Issues** - Report bugs and request features

### Documentation

- **README.md** - Getting started and usage
- **API Documentation** - Detailed API reference
- **FAQsimple Docs** - Official FAQsimple documentation

## 📜 Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

---

Thank you for contributing to MCP Server for FAQsimple! 🎉