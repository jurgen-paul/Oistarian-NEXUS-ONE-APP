# Contributing to Oistarian NEXUS ONE APP

Thank you for your interest in contributing to the Oistarian NEXUS ONE APP project! We welcome contributions from the community and appreciate your efforts to help improve this project.

## Code of Conduct
Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

## Getting Started

### Prerequisites
- Familiarity with Git and GitHub
- Node.js v18+ installed
- Understanding of React, TypeScript, and modern web development

### Development Setup
1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/Oistarian-NEXUS-ONE-APP.git
   cd Oistarian-NEXUS-ONE-APP
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/jurgen-paul/Oistarian-NEXUS-ONE-APP.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Making Changes

### Before You Start
- Check existing issues and pull requests to avoid duplicate work
- Create an issue for major features to discuss before implementation
- Keep changes focused and manageable

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/descriptive-name
   ```

2. **Make your changes**:
   - Follow the project's coding style
   - Keep commits atomic and well-described
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   npm run dev
   ```

4. **Commit with conventional messages**:
   ```bash
   git commit -m "feat: add new feature description"
   git commit -m "fix: resolve issue #123"
   ```

5. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push your changes**:
   ```bash
   git push origin feature/descriptive-name
   ```

## Submitting a Pull Request

### PR Guidelines
- **Title**: Use conventional commit format (feat:, fix:, docs:, etc.)
- **Description**: Clearly describe:
  - What problem does this solve?
  - How does it solve it?
  - Any breaking changes?
  - Related issues (use #issue-number)

### PR Template
```markdown
## Description
Brief description of the changes

## Related Issue
Fixes #(issue number)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] I have performed a self-review
- [ ] I have commented complex code sections
- [ ] I have updated documentation
- [ ] I have added tests (if applicable)
- [ ] All tests pass locally
- [ ] No new linting warnings introduced
```

## Code Style & Standards

### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable names
- Keep functions small and focused
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Keep components focused on single responsibility
- Memoize expensive computations
- Use proper prop typing
- Organize component files logically

### CSS/Styling
- Use Tailwind CSS classes
- Follow responsive design principles
- Avoid inline styles
- Use CSS variables for themes

### Example:
```typescript
/**
 * Validates user input and returns error message if invalid
 * @param input - User input to validate
 * @returns Error message or null if valid
 */
function validateInput(input: string): string | null {
  if (!input.trim()) {
    return 'Input cannot be empty';
  }
  return null;
}
```

## Testing

### Writing Tests
- Write unit tests for utilities and business logic
- Write integration tests for components
- Use descriptive test names
- Aim for meaningful coverage, not just percentages
- Test behavior, not implementation

### Running Tests
```bash
npm test
npm run test:coverage
```

## Documentation

### When to Update Docs
- New features should be documented in README.md
- Complex logic should have code comments
- API changes should update relevant docs
- Add examples for new functionality

### Documentation Format
- Use clear, concise language
- Include code examples where helpful
- Link to relevant sections
- Keep docs up-to-date with code changes

## Commit Messages

### Conventional Commits
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, etc.

### Examples
```bash
git commit -m "feat: add user authentication module"
git commit -m "fix: resolve memory leak in event listener"
git commit -m "docs: update setup instructions"
git commit -m "refactor: simplify component logic"
```

## Review Process

### What to Expect
1. Automated checks run (linting, tests, build)
2. Code review by maintainers
3. Feedback and requested changes
4. Approval and merge

### Code Review Etiquette
- Be respectful and constructive
- Ask questions instead of making demands
- Suggest improvements rather than criticisms
- Thank reviewers for their time

## Common Issues & Solutions

### "Your branch is behind upstream"
```bash
git fetch upstream
git rebase upstream/main
git push origin feature/your-feature --force-with-lease
```

### "Merge conflicts"
1. Fetch latest from upstream
2. Resolve conflicts in your editor
3. Stage changes and commit
4. Push your branch

### "Build fails locally but passed CI"
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node version: `node --version`

## Reporting Bugs

### Bug Report Template
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Bug occurs

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots/Logs
Include if relevant

## Environment
- OS: [e.g., macOS 12]
- Node version: [e.g., 18.0.0]
- Browser: [e.g., Chrome 100]
```

## Feature Requests

### Feature Request Template
```markdown
## Description
Clear description of the requested feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives
Other possible approaches

## Additional Context
Any other relevant information
```

## Questions?

- Check the [FAQ](FAQ.md)
- Search existing issues
- Ask in [GitHub Discussions](https://github.com/jurgen-paul/Oistarian-NEXUS-ONE-APP/discussions)
- Contact maintainers

## Acknowledgments

Thank you for contributing! All contributors are recognized and valued. Your efforts help make this project better for everyone.

---

**Happy Contributing! 🎉**