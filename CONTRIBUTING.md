# Contributing to MCP Portfolio

First off, thank you for considering contributing to MCP Portfolio! It's people like you that make this project better.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-portfolio.git
cd mcp-portfolio

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/mcp-portfolio.git

# Install dependencies
cd server && npm install
cd ../app && npm install
```

### Development Workflow

1. **Create a branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**

   - Write code
   - Add tests
   - Update documentation

3. **Test your changes**

   ```bash
   cd server
   npm test
   npm run lint
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**

   ```bash
   git push origin feature/my-feature
   ```

6. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

### Coding Standards

#### JavaScript/TypeScript

- Use ES6+ features
- Follow existing code style
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

#### Testing

- Write unit tests for new features
- Maintain test coverage above 70%
- Use descriptive test names
- Mock external dependencies

#### Documentation

- Update README if adding features
- Add JSDoc comments
- Update API documentation
- Include examples

## Project Structure

```
server/
├── src/
│   ├── config/        # Configuration files
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── tools/         # Tool handlers
│   └── validators/    # Schema validators
└── __tests__/         # Test files

app/
├── app/              # Next.js app directory
├── components/       # React components
└── lib/              # Utility functions
```

## Adding a New Tool

1. **Create handler** in `server/src/tools/handlers/`

   ```javascript
   const myToolHandler = async ({ input }) => {
     // Implementation
     return { result: "success" };
   };
   module.exports = myToolHandler;
   ```

2. **Register tool** in `server/src/tools/registry.js`

   ```javascript
   my_tool: {
     name: 'my_tool',
     description: 'Description of what it does',
     schema: {
       type: 'object',
       properties: { /* ... */ },
       required: []
     },
     metadata: {
       cost: 'low',
       estimatedLatency: '100ms',
       requiredPermissions: ['user']
     },
     handler: myToolHandler
   }
   ```

3. **Add tests** in `server/__tests__/`

   ```javascript
   describe("my_tool", () => {
     it("should execute successfully", async () => {
       // Test implementation
     });
   });
   ```

4. **Update documentation**
   - Add tool to README
   - Document input/output
   - Add usage examples

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tools.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

```javascript
describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it("should do something specific", async () => {
    // Arrange
    const input = {
      /* test data */
    };

    // Act
    const result = await functionToTest(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples

```
feat: add email notification tool

Implements email sending capability using SendGrid API.
Includes retry logic and error handling.

Closes #123
```

```
fix: resolve rate limiting issue

Rate limiter was not properly resetting window.
Updated to use sliding window algorithm.
```

## Review Process

1. **Automated Checks**

   - CI/CD pipeline must pass
   - Tests must pass
   - Code coverage maintained
   - No linting errors

2. **Code Review**

   - At least one maintainer approval
   - Address review comments
   - Keep discussions focused

3. **Merge**
   - Squash and merge
   - Clean commit history
   - Update CHANGELOG

## Getting Help

- Check [documentation](docs/)
- Search [existing issues](https://github.com/YOUR_USERNAME/mcp-portfolio/issues)
- Ask in [discussions](https://github.com/YOUR_USERNAME/mcp-portfolio/discussions)

## Recognition

Contributors will be recognized in:

- README contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉
