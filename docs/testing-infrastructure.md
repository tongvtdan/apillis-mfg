# Testing Infrastructure Documentation

## Overview

Factory Pulse implements a comprehensive testing infrastructure using modern testing tools and best practices to ensure code quality, prevent regressions, and maintain system reliability.

## Testing Stack

### Core Testing Framework
- **Vitest**: Modern testing framework with native TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **JSDOM**: Browser environment simulation for component testing
- **@testing-library/jest-dom**: Extended matchers for DOM assertions

### Test Scripts

```bash
# Development testing (watch mode)
npm test

# Single test run (CI/CD friendly)
npm run test:run

# Interactive testing UI
npm run test:ui

# Test coverage reports
npm run test:coverage
```

## Test Structure

### Directory Organization
```
src/test/
├── setup.ts                           # Test environment configuration
├── mocks/
│   ├── supabase.ts                    # Supabase client mocking
│   └── project-data.ts                # Realistic test data
├── e2e/
│   └── project-lifecycle.test.ts      # End-to-end testing
├── integration/
│   └── project-components.test.tsx    # Component integration tests
└── validation/
    └── database-validation.test.ts    # Database constraint testing

src/components/project/__tests__/
├── ProjectTable.test.tsx              # Project table component tests
├── ProjectDetail.test.tsx             # Project detail component tests
└── ProjectIntakeForm.test.tsx         # Project form component tests

src/services/__tests__/
└── projectService.test.ts             # Service layer testing

src/types/__tests__/
└── project.test.ts                    # TypeScript interface validation
```

## Test Categories

### 1. Unit Tests
**Purpose**: Test individual functions and components in isolation

**Coverage**:
- TypeScript interface validation
- Utility function testing
- Individual component behavior
- Service method testing

**Example**:
```typescript
describe('ProjectStatus validation', () => {
  it('should accept valid status values', () => {
    expect(isValidProjectStatus('active')).toBe(true)
    expect(isValidProjectStatus('completed')).toBe(true)
  })

  it('should reject invalid status values', () => {
    expect(isValidProjectStatus('archived')).toBe(false)
  })
})
```

### 2. Component Tests
**Purpose**: Test React components with realistic user interactions

**Coverage**:
- Component rendering
- User interactions (clicks, form submissions)
- State management
- Props handling
- Error boundaries

**Example**:
```typescript
describe('ProjectTable', () => {
  it('should render project data correctly', () => {
    render(<ProjectTable />, { wrapper: TestWrapper })
    
    expect(screen.getByText('P-25013001')).toBeInTheDocument()
    expect(screen.getByText('Test Manufacturing Project')).toBeInTheDocument()
  })

  it('should handle sorting by priority', async () => {
    render(<ProjectTable />, { wrapper: TestWrapper })
    
    fireEvent.click(screen.getByText('Priority'))
    
    await waitFor(() => {
      expect(screen.getByText('Priority').closest('th')).toHaveAttribute('aria-sort')
    })
  })
})
```

### 3. Integration Tests
**Purpose**: Test component interactions and data flow

**Coverage**:
- Component communication
- State synchronization
- API integration
- Workflow testing

**Example**:
```typescript
describe('Project Management Integration', () => {
  it('should create and display new project', async () => {
    render(<ProjectManagementApp />, { wrapper: TestWrapper })
    
    // Fill out project form
    fireEvent.change(screen.getByLabelText('Project Title'), {
      target: { value: 'New Test Project' }
    })
    
    // Submit form
    fireEvent.click(screen.getByText('Create Project'))
    
    // Verify project appears in table
    await waitFor(() => {
      expect(screen.getByText('New Test Project')).toBeInTheDocument()
    })
  })
})
```

### 4. End-to-End Tests
**Purpose**: Test complete user workflows from start to finish

**Coverage**:
- Complete project lifecycle
- Multi-step workflows
- User authentication flows
- Cross-component interactions

**Example**:
```typescript
describe('Project Lifecycle E2E', () => {
  it('should complete full project workflow', async () => {
    // 1. Create project
    await createProject('E2E Test Project')
    
    // 2. Progress through stages
    await advanceProjectStage('Technical Review')
    await advanceProjectStage('Supplier RFQ')
    
    // 3. Complete project
    await completeProject()
    
    // 4. Verify final state
    expect(await getProjectStatus()).toBe('completed')
  })
})
```

### 5. Database Validation Tests
**Purpose**: Validate database constraints and schema alignment

**Coverage**:
- Foreign key constraints
- Data type validation
- Required field validation
- Enum constraint testing

**Example**:
```typescript
describe('Database Constraints', () => {
  it('should enforce project status enum constraints', async () => {
    const invalidProject = { ...mockProject, status: 'invalid_status' }
    
    await expect(createProject(invalidProject)).rejects.toThrow(
      'invalid input value for enum project_status'
    )
  })
})
```

## Test Data Management

### Mock Data Strategy
- **Realistic Data**: Test data mirrors actual database schema
- **Relationship Integrity**: Foreign keys and relationships maintained
- **Edge Cases**: Include boundary conditions and error scenarios
- **Data Isolation**: Each test uses independent data sets

### Supabase Mocking
```typescript
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    // ... complete API coverage
  })),
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    // ... authentication methods
  }
}
```

## Test Environment Setup

### Browser API Mocking
```typescript
// Mock matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})

// Mock ResizeObserver for component resize testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Test Wrappers
```typescript
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

## Testing Best Practices

### 1. Test Organization
- **Descriptive Names**: Clear test descriptions that explain expected behavior
- **Logical Grouping**: Related tests grouped in describe blocks
- **Setup/Cleanup**: Proper test isolation with beforeEach/afterEach
- **Async Handling**: Proper async/await usage for asynchronous operations

### 2. Assertion Strategy
- **User-Centric**: Test what users see and interact with
- **Specific Assertions**: Precise expectations rather than broad checks
- **Error Testing**: Test both success and failure scenarios
- **Accessibility**: Include ARIA attributes and screen reader compatibility

### 3. Mock Management
- **Minimal Mocking**: Mock only what's necessary for test isolation
- **Realistic Responses**: Mock responses should match real API behavior
- **State Management**: Proper mock state reset between tests
- **Error Simulation**: Mock error conditions for robust error handling tests

### 4. Performance Considerations
- **Fast Execution**: Tests should run quickly for rapid feedback
- **Parallel Execution**: Tests designed to run independently
- **Resource Cleanup**: Proper cleanup to prevent memory leaks
- **Selective Testing**: Ability to run specific test suites

## Coverage Goals

### Target Coverage Metrics
- **Line Coverage**: 80%+ for critical business logic
- **Branch Coverage**: 75%+ for conditional logic
- **Function Coverage**: 90%+ for public APIs
- **Component Coverage**: 100% for critical UI components

### Coverage Areas
- **Project Management**: Complete CRUD operations and workflow
- **Authentication**: User login, permissions, and security
- **Data Validation**: Form validation and constraint checking
- **Error Handling**: Error boundaries and recovery mechanisms
- **Real-time Updates**: Subscription and cache management

## Continuous Integration

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm run test:run
    - run: npm run test:coverage
```

### Quality Gates
- **Test Pass Rate**: 100% test pass required for deployment
- **Coverage Threshold**: Minimum coverage requirements enforced
- **Performance Benchmarks**: Test execution time monitoring
- **Regression Detection**: Automated detection of breaking changes

## Debugging and Troubleshooting

### Test Debugging
```bash
# Run specific test file
npm test -- ProjectTable.test.tsx

# Run tests with debugging
npm test -- --inspect-brk

# Run tests with coverage
npm run test:coverage

# Interactive test UI
npm run test:ui
```

### Common Issues
1. **Async Timing**: Use `waitFor` for asynchronous operations
2. **Mock Persistence**: Ensure mocks are reset between tests
3. **DOM Cleanup**: Proper component unmounting after tests
4. **Environment Variables**: Mock environment-specific configurations

## Future Enhancements

### Planned Improvements
- **Visual Regression Testing**: Screenshot comparison for UI consistency
- **Performance Testing**: Load testing for database operations
- **API Integration Testing**: Real Supabase endpoint testing
- **Mobile Testing**: Responsive design and touch interaction testing
- **Accessibility Testing**: Automated accessibility compliance checking

### Monitoring and Metrics
- **Test Execution Time**: Performance monitoring for test suite
- **Flaky Test Detection**: Identification of unreliable tests
- **Coverage Trends**: Historical coverage tracking
- **Quality Metrics**: Code quality and maintainability scoring

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Resources
- `src/test/setup.ts` - Test environment configuration
- `src/test/mocks/` - Mock implementations and test data
- `package.json` - Test script definitions and dependencies
- `vitest.config.ts` - Vitest configuration and settings

---

*Last Updated: 2025-08-30*
*Version: 1.0*