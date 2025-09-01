# **AI Developer Tool Guide: A Practical Handbook for Modern App Development**

> *Empowering engineers with AI-powered workflows across React, iOS, and Flutter ecosystems*

---

## **Preface**

As software development evolves, so do the tools and methodologies that drive it. Artificial intelligence is no longer a futuristic concept—it’s an essential collaborator in building robust, scalable, and maintainable applications.

This book synthesizes best practices, architectural strategies, debugging techniques, and delivery pipelines across three major platforms—**React with TypeScript**, **iOS with Swift/SwiftUI**, and **Flutter**—using AI developer tools like **Lovable**, **Cursor**, **Kiro**, **Qoder**, **Gemini**, and **GitHub Copilot**.

Each chapter is structured to guide developers through real-world scenarios using targeted prompts that generate actionable outputs. Whether you're implementing a new feature, refactoring legacy code, or setting up CI/CD pipelines, this guide provides ready-to-use templates and strategies optimized for collaboration with AI.

---

# **Chapter 1 — React with TypeScript (Web)**

Modern web development demands type safety, performance, and maintainability. With React 18 and TypeScript 5.x, teams can build scalable frontends—especially when augmented by AI tools that enforce best practices and accelerate delivery.

## **1.1 Best Practices Primer**

Establishing a strong foundation ensures consistency, reduces bugs, and improves team velocity.

### ✅ Standards

- **Folder Structure**:  
  ```
  src/
  ├── features/       # Feature-based modules
  ├── shared/         # Reusable components, hooks, utils
  ├── services/       # API clients, data fetching
  ├── types/          # Global interfaces and type guards
  ├── components/     # Presentational components
  ├── store/          # State management (RTK/Zustand)
  └── App.tsx
  ```

- **Typing Patterns**:
  - Use `strict: true` in `tsconfig.json`
  - Prefer `interface` for public APIs; `type` for unions/complex types
  - Discriminated unions for state modeling
  - Never use `any`; use `unknown` + type guards

- **Hooks**:
  - Custom hooks start with `use`
  - Avoid side effects in render phase
  - Always validate dependency arrays

- **Error Boundaries & Suspense**:
  - Wrap async components in `<Suspense fallback={...}>`
  - Implement `ErrorBoundary` for graceful error handling

- **Data Fetching**:
  - Use **React Query** for server state
  - Keep local/UI state separate

- **Accessibility**:
  - Semantic HTML
  - ARIA labels
  - Keyboard navigation
  - Focus management

- **Security**:
  - Sanitize user input
  - Avoid `dangerouslySetInnerHTML`
  - Set CSP headers
  - Audit dependencies regularly

### 📋 Checklist for PR Reviews

| Item                                                | Check |
| --------------------------------------------------- | ----- |
| No `any` types                                      | ✅     |
| All async operations handled (loading/error states) | ✅     |
| Proper use of `useMemo`, `useCallback`              | ✅     |
| Accessible markup (ARIA, labels, tab order)         | ✅     |
| Tests cover edge cases                              | ✅     |
| No console logs in production code                  | ✅     |
| ESLint/Prettier formatting applied                  | ✅     |

---

### 💡 Sample Prompts

#### **Lovable – Prompt 1: Best Practices Primer**
```markdown
Role: Senior React + TypeScript engineer.  
Goal: Review and enforce modern best practices for a React 18 app using TypeScript 5.x.

Context:
- Key libs: react-router, Zustand, Tailwind, React Query, Vitest + RTL
- tsconfig: strict true

Task:
1) Summarize recommended standards for this stack.
2) Provide a concise checklist for PR reviews.
3) Show 2–3 idiomatic code examples.
4) Include common pitfalls and how to avoid them.
```

#### **Cursor – Prompt 1 (Optimized)**
```markdown
Act as a React+TS reviewer. Scan the current files I select. Summarize issues and propose fixes using modern best practices. Output:
1) “Findings” (by file)
2) “Fix Plan” (ordered)
3) Minimal patch per file in `diff` blocks
4) Tests to add/update
```

#### **Kiro – Prompt 1**
```markdown
You are a React+TS standards guide. Produce a concise standards doc with:
- Folder conventions, naming, barrel files policy
- Types-first patterns (discriminated unions, exhaustive switch)
- Hooks conventions
- Data layer best practices
- a11y and security checklists
Include 2–3 code snippets for each section.
```

---

## **1.2 Feature/Component Generator**

Build production-ready features with type-first design, accessibility, and testing baked in.

### 🧱 Example: Product List with Filters & Pagination

#### **File Tree Proposal**
```bash
src/
├── features/
│   └── product-list/
│       ├── ProductList.tsx
│       ├── useProductList.ts
│       ├── ProductService.ts
│       ├── ProductList.test.tsx
│       └── types.ts
```

#### **Implementation Code**

**`types.ts`**
```ts
export type SortDirection = 'asc' | 'desc';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price';
  sortDirection?: SortDirection;
}

export type ProductListState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: Product[];
  total: number;
  page: number;
  limit: number;
  error?: string;
};
```

**`ProductService.ts`**
```ts
import { z } from 'zod';
import { fetchApi } from '@/services/fetchClient';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
});

const ProductsResponseSchema = z.object({
  data: z.array(ProductSchema),
  total: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;

export const fetchProducts = async (
  filters: ProductFilters,
  page: number,
  limit: number
): Promise<z.infer<typeof ProductsResponseSchema>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null)
    ),
  });

  const res = await fetchApi(`/api/products?${params}`);
  const json = await res.json();

  return ProductsResponseSchema.parse(json);
};
```

**`useProductList.ts`**
```ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductFilters, fetchProducts } from './ProductService';

export const useProductList = (initialFilters?: ProductFilters) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {});

  const query = useQuery({
    queryKey: ['products', filters, page],
    queryFn: () => fetchProducts(filters, page, 10),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    ...query,
    page,
    setPage,
    filters,
    setFilters,
  };
};
```

**`ProductList.tsx`**
```tsx
import { useProductList } from './useProductList';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorDisplay } from '@/shared/components/ErrorDisplay';

export const ProductList = () => {
  const { data, status, error, filters, setFilters, page, setPage } = useProductList();

  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <ErrorDisplay message={error?.message} />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* Filters */}
      <div className="mb-6 space-y-2">
        <input
          placeholder="Search..."
          value={filters.search || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="border p-2 rounded"
          aria-label="Search products"
        />
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>

      {/* Results */}
      {data?.data.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="space-y-2">
          {data?.data.map(product => (
            <li key={product.id} className="border p-3 rounded">
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex gap-2 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">{page}</span>
        <button
          disabled={!data || data.data.length < 10}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### ✅ Acceptance Criteria

- Strongly typed models ✅
- Accessibility: keyboard nav, ARIA ✅
- Performance: memoization, virtualization (if >100 rows) ✅
- Tests: unit + RTL integration ✅

---

### 💡 Sample Prompts

#### **Lovable – Prompt 2: Feature/Component Generator**
```markdown
Goal: Implement a production-ready feature with types-first design.

Context:
- Feature: ProductList with filters and pagination
- Data source: REST, endpoint: GET /api/products
- State: Zustand
- UI: Tailwind

Deliver:
1) File tree proposal
2) Implementation code
3) Tests
4) Notes on edge cases
5) Follow-up tasks
```

#### **Gemini – Prompt 2**
```markdown
Implement [feature] with typed data access (fetch/axios), schema validation, resilient UI states, tests, and performance notes. Return complete file contents and a small usage example.
```

---

## **1.3 Debug & Fix**

Quickly diagnose and resolve issues with minimal disruption.

### 🔍 Root Cause Summary

> _"The component re-renders infinitely because `useEffect` dependency array includes an object created inline."_

### 🛠️ Fix Patch

```diff
--- src/features/product-list/useProductList.ts
+++ src/features/product-list/useProductList.ts
@@ -5,7 +5,7 @@
 export const useProductList = (initialFilters?: ProductFilters) => {
   const [page, setPage] = useState(1);
   const [filters, setFilters] = useState<ProductFilters>(initialFilters || {});
-
+  const filterKey = JSON.stringify(filters);
   const query = useQuery({
     queryKey: ['products', filters, page],
     queryFn: () => fetchProducts(filters, page, 10),
```

➡️ **Better Fix**: Use stable references or derive keys outside objects.

```ts
const query = useQuery({
  queryKey: ['products', filters.search, filters.category, filters.minPrice, page],
  queryFn: () => fetchProducts(filters, page, 10),
});
```

### ✅ Tests to Add

```ts
test('should not refetch when filters object changes but values are same', async () => {
  const { result, rerender } = renderHook((props) => useProductList(props), {
    initialProps: { search: 'a' },
  });

  await act(async () => {
    rerender({ search: 'a' }); // same value, new object
  });

  expect(fetchProducts).toHaveBeenCalledTimes(1);
});
```

---

### 💡 Sample Prompts

#### **Qoder – Prompt 3**
```markdown
Triaging [bug]: Provide reproduction, likely cause, fix patch, and regression tests. Add a guard (type or runtime) to prevent recurrence.
```

#### **Copilot – Prompt 3**
```markdown
Given these logs and files, identify the root cause and propose a minimal change. Provide test updates and a verification checklist.
```

---

## **1.4 Refactor & Architecture Strategy**

Improve scalability and maintainability over time.

### 🎯 Target Architecture

- **Feature-based folder structure**
- **Clear separation**: server state (React Query) vs UI state (Zustand)
- **Reusable hooks**
- **Error boundaries + Suspense shells**

### 🛠️ Stepwise Refactor Plan

1. **Extract shared components** (`LoadingSpinner`, `ErrorDisplay`)
2. **Move services into `/services`**
3. **Introduce React Query** for all API calls
4. **Add ErrorBoundary** around async routes
5. **Split large components** using `React.lazy` + `Suspense`

### ⚖️ Risk Matrix

| Risk                   | Likelihood | Impact | Mitigation                    |
| ---------------------- | ---------- | ------ | ----------------------------- |
| Breaking API contracts | Medium     | High   | Wrap changes in feature flags |
| Increased bundle size  | Low        | Medium | Use code-splitting            |
| Team learning curve    | High       | Medium | Pair programming, docs        |

---

### 💡 Sample Prompts

#### **Lovable – Prompt 4**
```markdown
Refactor toward scalable patterns with measurable benefits.

Context:
- Pain points: prop drilling, tangled effects
- Constraints: no breaking API

Propose:
1) Architecture target
2) Stepwise refactor plan
3) Sample refactor
4) Risk matrix
5) Metrics to track
```

#### **Cursor – Prompt 4 (Optimized)**
```markdown
Refactor [module/path] to reduce re-renders and side effects. Keep public API stable. Provide:
- Before/after overview
- Small sequential diffs (step 1..n)
- Bench notes
Include tests updated as needed.
```

---

## **1.5 Dev Strategy & Quality Gates**

Ensure high-quality, secure, and accessible releases.

### 🔄 CI Pipeline Steps

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test:unit -- --coverage
      - run: pnpm build
```

### 📜 Scripts

```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "build": "vite build"
}
```

### ✅ Quality Gates

| Gate          | Tool                                 |
| ------------- | ------------------------------------ |
| Type Safety   | `tsc --strict`                       |
| Linting       | ESLint + Prettier                    |
| Test Coverage | ≥ 80%                                |
| Accessibility | `axe-playwright` or RTL a11y queries |
| Security      | `npm audit`, Snyk, CSP headers       |

---

### 💡 Sample Prompts

#### **Gemini – Prompt 5**
```markdown
Create a delivery plan: scripts, CI matrix (Node versions), caching, coverage thresholds, accessibility checks, and release steps. Return as checklists + snippets.
```

#### **Qoder – Prompt 5**
```markdown
Propose CI/CD improvements (caching, parallel test shards), dependency audit, and pre-merge quality gates. Include ready-to-paste config snippets.
```

---

# **Chapter 2 — iOS with Swift/SwiftUI**

Building native iOS apps with modern Swift, SwiftUI, and AI assistance enables faster iteration and fewer runtime errors.

## **2.1 Best Practices Primer**

### ✅ Standards

- **Architecture**: MVVM with protocol-oriented DI
- **Concurrency**: `async/await`, `Task`, `@MainActor`
- **Data**: `URLSession` + `Codable`, or `SwiftData`
- **Testing**: `XCTest`, snapshot testing

### 🧩 Patterns

- **View/ViewModel Separation**:
  ```swift
  @MainActor class ProductListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var error: Error?

    func loadProducts() async {
      isLoading = true
      do {
        let fetched = try await ProductService.shared.fetch()
        products = fetched
      } catch {
        self.error = error
      }
      isLoading = false
    }
  }
  ```

- **Dependency Injection**:
  ```swift
  protocol ProductServiceProtocol {
    func fetch() async throws -> [Product]
  }

  @MainActor class ProductListViewModel {
    private let service: ProductServiceProtocol
    init(service: ProductServiceProtocol) {
      self.service = service
    }
  }
  ```

- **Navigation**:
  Use `NavigationStack` for deep linking and programmatic navigation.

---

### 💡 Sample Prompts

#### **Lovable – Prompt 1**
```markdown
Role: Senior iOS engineer.  
Goal: Swift 5.9+, SwiftUI (iOS 17+) best practices.

Deliver:
1) Standards
2) Patterns: View/ViewModel, DI, navigation
3) Code snippets
4) a11y and performance checklist
5) Security checklist
```

#### **Copilot – Prompt 1**
```markdown
Review this Swift/SwiftUI repo for state/concurrency issues and a11y gaps. Provide specific fixes and code examples I can paste. Keep it pragmatic.
```

---

## **2.2 Feature/Screen Generator**

### Example: Product List Screen

#### **File Tree**
```
Features/
└── ProductList/
    ├── ProductListView.swift
    ├── ProductListViewModel.swift
    └── ProductService.swift
```

#### **Code**

**`ProductListView.swift`**
```swift
struct ProductListView: View {
  @StateObject private var viewModel = ProductListViewModel()

  var body: some View {
    NavigationStack {
      List(viewModel.products) { product in
        Text(product.name)
      }
      .navigationTitle("Products")
      .task {
        await viewModel.loadProducts()
      }
      .overlay {
        if viewModel.isLoading {
          ProgressView("Loading...")
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(.ultraThinMaterial)
        }
      }
      .alert("Error", isPresented: .constant(viewModel.error != nil)) {
        Button("OK") { viewModel.error = nil }
      } message: {
        Text(viewModel.error?.localizedDescription ?? "")
      }
    }
  }
}
```

---

### 💡 Sample Prompts

#### **Gemini – Prompt 2**
```markdown
Create [feature/screen] with data flow via ViewModel, async network, and robust states. Provide tests and a preview harness showcasing error/loading.
```

#### **Kiro – Prompt 2**
```markdown
Implement [feature] with ViewModel and typed services. Provide SwiftUI views, ViewModel, service, and tests. Include error/empty states.
```

---

## **2.3 Debug & Fix**

### Common Crash: Main Actor Violation

> **Symptom**: "Publishers cannot land on the main thread if current thread is not main."

### ✅ Fix

Annotate view model with `@MainActor`.

```diff
- class ProductListViewModel: ObservableObject {
+ @MainActor class ProductListViewModel: ObservableObject {
```

Add test:
```swift
func testViewModelUpdatesOnMainActor() async throws {
  let vm = ProductListViewModel()
  await vm.loadProducts()
  XCTAssertTrue(Thread.isMainThread)
}
```

---

### 💡 Sample Prompt

**Cursor – Prompt 3 (Optimized)**
```markdown
Given crash logs and files, produce:
- Root cause summary
- Minimal fix as ```diff
- Regression tests
- Manual validation steps
```

---

## **2.4 Refactor & Architecture Strategy**

### Goal: Reduce SwiftUI Invalidations

- Split large views
- Use `@StateObject` correctly
- Pass bindings instead of full models
- Adopt `Identifiable` protocol

---

### 💡 Sample Prompt

**Kiro – Prompt 4**
```markdown
Restructure to feature-based folders and MVVM. Define a migration plan and refactor one module as a reference implementation.
```

---

## **2.5 Dev Strategy & Quality Gates**

### CI Steps
```bash
xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Fastlane Lane
```ruby
lane :test do
  scan(scheme: "MyApp")
end
```

### SwiftLint Rules
```yaml
disabled_rules:
  - force_cast
  - large_tuple
```

---

# **Chapter 3 — Flutter (Cross-Platform)**

Flutter enables beautiful, high-performance apps across iOS and Android from a single codebase.

## **3.1 Best Practices Primer**

### ✅ Core Principles

- **State Management**: Prefer **Riverpod** or **Bloc**
- **Routing**: Use `go_router`
- **Models**: Immutable via `freezed` + `json_serializable`
- **Performance**: Use `const` constructors, `keys`, `RepaintBoundary`
- **a11y**: Semantics, dynamic type support
- **Security**: Secure storage, sanitize platform channel data

### 📁 Folder Structure
```
lib/
├── features/
│   └── product_list/
│       ├── presentation/
│       ├── domain/
│       └── data/
├── core/
│   ├── widgets/
│   ├── utils/
│   └── error/
└── main.dart
```

---

### 💡 Sample Prompt

**Gemini – Prompt 1**
```markdown
Generate a Flutter best-practices guide for Dart 3.x, including state patterns, navigation with go_router, performance, a11y, and security. Provide code samples and pitfalls.
```

---

## **3.2 Feature/Screen Generator**

### Example: Product List

#### **Model (freezed)**
```dart
@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    required String name,
    required double price,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
}
```

#### **Provider (Riverpod)**
```dart
final productsProvider = FutureProvider<List<Product>>((ref) async {
  return ref.watch(productRepositoryProvider).fetchProducts();
});
```

#### **Widget**
```dart
class ProductList extends ConsumerWidget {
  const ProductList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);

    return products.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Text('Error: $err'),
      data: (items) => ListView.builder(
        itemCount: items.length,
        itemBuilder: (ctx, i) => ListTile(title: Text(items[i].name)),
      ),
    );
  }
}
```

---

## **3.3 Debug & Fix**

### Symptom: Infinite Rebuilds

> Caused by calling `ref.watch(provider)` inside build method without memoization.

### ✅ Fix

Use `ref.watch(provider.select(...))` to limit rebuilds.

```diff
- final products = ref.watch(productsProvider);
+ final productNames = ref.watch(productsProvider.select((data) => data.map((p) => p.name)));
```

---

## **3.4 Refactor & Architecture Strategy**

### Target: Repository Pattern

```dart
abstract class ProductRepository {
  Future<List<Product>> fetchProducts();
}

class ProductRepositoryImpl implements ProductRepository {
  final Dio dio;
  ProductRepositoryImpl(this.dio);

  @override
  Future<List<Product>> fetchProducts() async {
    final res = await dio.get('/products');
    return (res.data as List).map((e) => Product.fromJson(e)).toList();
  }
}
```

---

## **3.5 Dev Strategy & Quality Gates**

### CI Snippet (`codemagic.yaml`)
```yaml
workflows:
  flutter-workflow:
    scripts:
      - flutter pub get
      - flutter analyze
      - flutter test --coverage
      - flutter build apk
```

### Lint Rules (`analysis_options.yaml`)
```yaml
linter:
  rules:
    - use_build_context_synchronously
    - avoid_print
    - prefer_const_constructors
```

---

# **Conclusion**

AI is not replacing developers—it’s empowering them.

By combining deep platform expertise with well-crafted prompts, teams can:
- Enforce consistency
- Accelerate feature delivery
- Reduce bugs
- Improve quality

Use this guide as a living document. Customize the prompts, evolve your standards, and integrate AI into your daily workflow.

> **The future of development is collaborative intelligence.**

--- 

*© 2025 AI Developer Tool Guide. All rights reserved.*



---
# The AI Developer Tool Prompt Book

***Generated by GPT 5 Pro***

A practical, copy-pasteable guide for React + TypeScript, iOS Swift/SwiftUI, and Flutter


---

## Table of Contents
- [Introduction](#introduction)
- [How to Use This Book](#how-to-use-this-book)
- [Chapter 1 — React with TypeScript (Web)](#chapter-1--react-with-typescript-web)
  - [Tool: Lovable](#tool-lovable-react)
  - [Tool: Cursor](#tool-cursor-react)
  - [Tool: Kiro](#tool-kiro-react)
  - [Tool: Qoder](#tool-qoder-react)
  - [Tool: Gemini](#tool-gemini-react)
  - [Tool: Copilot](#tool-copilot-react)
- [Chapter 2 — iOS with Swift/SwiftUI](#chapter-2--ios-with-swiftswiftui)
  - [Tool: Lovable](#tool-lovable-ios)
  - [Tool: Cursor](#tool-cursor-ios)
  - [Tool: Kiro](#tool-kiro-ios)
  - [Tool: Qoder](#tool-qoder-ios)
  - [Tool: Gemini](#tool-gemini-ios)
  - [Tool: Copilot](#tool-copilot-ios)
- [Chapter 3 — Flutter (Cross-Platform)](#chapter-3--flutter-cross-platform)
  - [Tool: Lovable](#tool-lovable-flutter)
  - [Tool: Cursor](#tool-cursor-flutter)
  - [Tool: Kiro](#tool-kiro-flutter)
  - [Tool: Qoder](#tool-qoder-flutter)
  - [Tool: Gemini](#tool-gemini-flutter)
  - [Tool: Copilot](#tool-copilot-flutter)
- [Appendix A — How to Use These Prompts Effectively](#appendix-a--how-to-use-these-prompts-effectively)
- [Appendix B — Summary](#appendix-b--summary)
- [Version & Source Information](#version--source-information)

---

## Introduction
This book compiles actionable, tool-specific prompts to accelerate high-quality app development across three stacks: React + TypeScript, iOS with Swift/SwiftUI, and Flutter. Each chapter provides best-practice primers, feature generation, debugging, refactoring/architecture, and delivery/quality strategies. The content emphasizes strong typing, testing, accessibility, performance, and security across platforms.

You can paste these prompts directly into your chosen AI coding assistant. Where noted, fill in placeholders like [feature], [state_mgmt], or [error] with your project details. For tools that can produce patches, prompts are optimized to return minimal, reviewable diffs and directly pasteable code.

---

## How to Use This Book
- Replace placeholders like [feature], [state_mgmt], [error], [files], and [repo specifics] with your project context.
- Paste minimal but relevant files or paths to ground the assistant’s output.
- Ask for small, incremental diffs and corresponding tests to keep pull requests reviewable.
- Keep and evolve a shared “Standards” document per platform as the project matures.

---

## Chapter 1 — React with TypeScript (Web)

### Tool: Lovable (React)
- Purpose: End-to-end React + TypeScript guidance spanning best practices, feature generation, debugging, refactoring, and delivery.

#### Prompt 1 — Best Practices Primer
````text
Role: Senior React + TypeScript engineer. Goal: Review and enforce modern best practices for a React 18 app using TypeScript 5.x.

Context:
- Project summary: [brief description]
- Key libs: [react-router or next/router], [state: Redux Toolkit/Zustand/Context], [styling: Tailwind/CSS Modules], [data: React Query/Apollo], [test: Vitest/Jest + RTL]
- tsconfig: strict true

Task:
1) Summarize recommended standards for this stack (folder structure, typing patterns, hooks, error boundaries, Suspense, data fetching, state management, accessibility, security).
2) Provide a concise checklist for PR reviews.
3) Show 2–3 idiomatic code examples (Typed hooks, discriminated unions, error boundary + Suspense, typed API client with Zod).
4) Include common pitfalls and how to avoid them.

Output:
- “Standards” bullets
- “Checklist”
- “Examples” with code blocks (TypeScript)
- “Pitfalls + fixes”
````

#### Prompt 2 — Feature/Component Generator
````text
Role: Feature engineer. Goal: Implement a production-ready feature with types-first design.

Context:
- Feature: [e.g., ProductList with filters and pagination]
- Data source: [REST/GraphQL], endpoint/schema: [paste], types: [paste or ask to infer]
- State: [Redux Toolkit/Zustand/Context] (use if already in repo; else local state)
- UI: [Tailwind/CSS Modules], design tokens: [link/summary]

Acceptance Criteria:
- Strongly typed models, no any
- Accessibility: keyboard, ARIA, focus management
- Performance: memoization, virtualization if >100 rows, code-splitting
- Tests: unit + RTL integration

Deliver:
1) File tree proposal
2) Implementation code (components, hooks, services)
3) Tests (Vitest/Jest + RTL)
4) Notes on edge cases, error states, empty states
5) Follow-up tasks

Return code as complete files with import paths relative to src/.
````

#### Prompt 3 — Debug & Fix
````text
Role: Debugger. Goal: Diagnose and fix an issue quickly with minimal changes.

Inputs:
- Symptom: [describe]
- Repro steps: [steps]
- Error logs/stack: [paste]
- Related files: [paths + snippets]

Do:
1) Hypothesis list (ranked)
2) Minimal failing reproducible snippet
3) Targeted fix (patch diff for affected files) + explanation
4) Add/Update tests that would have caught this
5) Regression checklist

Output:
- “Root cause summary”
- Unified diff patch in ```diff blocks
- “Tests”
- “Verification steps”
````

#### Prompt 4 — Refactor & Architecture Strategy
````text
Role: Architect. Goal: Refactor toward scalable patterns with measurable benefits.

Context:
- Pain points: [e.g., prop drilling, tangled effects, flaky data fetching]
- Constraints: [timebox, no breaking API]
- Non-functional goals: [performance, readability, testability]

Propose:
1) Architecture target (e.g., feature-based folders, hooks-first data, error boundaries, React Query for server state)
2) Stepwise refactor plan (1–2 day increments)
3) Sample refactor of one representative module (before/after with typed interfaces)
4) Risk matrix + mitigation
5) Metrics to track (bundle size, render counts via why-did-you-render, test coverage)

Deliver:
- Plan
- Example code
- Checklist
````

#### Prompt 5 — Dev Strategy & Quality Gates
````text
Role: Tech lead. Goal: Establish quality gates and delivery strategy.

Context:
- CI: [GitHub Actions/Circle], Node: [version], Package manager: [pnpm/npm/yarn]
- Lint/Format: ESLint + Prettier
- Tests: [Vitest/Jest], Coverage target: [e.g., 80%]
- Release: [envs, feature flags]

Deliver:
1) Pre-commit and CI pipeline steps (lint, typecheck, test, build)
2) Minimal configs (sample .eslintrc.js, script targets)
3) Security hygiene (CSP headers, sanitize HTML, dependency audit)
4) Accessibility gate (axe check, RTL a11y queries)
5) Rollback plan

Output:
- CI snippet (YAML)
- Scripts
- Checklists
````

---

### Tool: Cursor (React)
- Purpose: Cursor-optimized prompts for diffs, small atomic changes, and context-aware modifications.

#### Prompt 1 — Best Practices Primer (Cursor-optimized)
````text
Act as a React+TS reviewer. Scan the current files I select. Summarize issues and propose fixes using modern best practices (strict typing, idiomatic hooks, Suspense/error boundaries, server-state vs UI-state, a11y, security). Output:
1) “Findings” (by file)
2) “Fix Plan” (ordered)
3) Minimal patch per file in ```diff blocks (no ellipses)
4) Tests to add/update
Keep changes small and directly applicable as patches.
````

#### Prompt 2 — Feature/Component Generator (Cursor-optimized)
````text
Goal: Implement [feature]. Read the selected files for context. Provide:
1) Proposed file/folder plan
2) Code for new/updated files (complete content)
3) ```diff patches for modifications
4) RTL tests
5) Post-merge checklist
Honor existing patterns (styling, state). Keep diffs atomic.
````

#### Prompt 3 — Debug & Fix (Cursor-optimized)
````text
Given the selected stack traces and files, produce:
1) Root cause analysis (1–2 paragraphs)
2) Failing test that reproduces
3) Minimal fix as ```diff
4) Verification steps
No placeholder code. Don’t rename files unless necessary.
````

#### Prompt 4 — Incremental Refactor (Cursor-optimized)
````text
Refactor [module/path] to reduce re-renders and side effects. Keep public API stable. Provide:
- Before/after overview
- Small sequential diffs (step 1..n) with commit messages
- Bench notes (what improves and why)
Include tests updated as needed.
````

#### Prompt 5 — Dev Strategy & Quality Gates (Cursor-optimized)
````text
Set up typecheck/lint/test/build in CI for this repo. Read package.json and workflows. Return:
- Updated scripts
- Workflow YAML diff
- ESLint config tuned for React+TS
- Pre-commit steps
Ensure commands actually run in this repo.
````

---

### Tool: Kiro (React)
- Purpose: Standards, feature scaffolding, debugging, refactoring, and delivery guidance with concise code samples.

#### Prompt 1 — Best Practices Primer
````text
You are a React+TS standards guide. Produce a concise standards doc with:
- Folder conventions, naming, barrel files policy
- Types-first patterns (discriminated unions, exhaustive switch)
- Hooks conventions (no side effects in render, dependency arrays)
- Data layer best practices (React Query/GraphQL)
- a11y checklist
- Security checklist
Include 2–3 code snippets for each major section.
````

#### Prompt 2 — Feature/Component Generator
````text
Build [feature]. Constraints: TS strict, a11y, tests, minimal deps. Provide:
- Data types + schema validation (Zod if available)
- Component(s) + custom hooks
- Error/loading/empty states
- RTL tests
- Follow-up tasks
````

#### Prompt 3 — Debug & Fix
````text
Given [error], [stack], and [files], output:
- Diagnosis
- Fix with code
- Post-fix tests
- Preventive guardrails (lint rules, type tweaks)
````

#### Prompt 4 — Refactor & Architecture
````text
Refactor toward feature-based structure and clear state boundaries (server vs UI). Provide:
- Target structure tree
- Migration steps
- Example refactor
- Risks and rollbacks
````

#### Prompt 5 — Dev Strategy
````text
Define delivery plan: CI steps, PR template, code review rubric, release checklist (semantic versioning, changelog), and observability hooks (basic logging, error boundary reporting).
````

---

### Tool: Qoder (React)
- Purpose: Repo-tailored best practices, feature builds, debugging, performance refactors, and CI/CD improvements.

#### Prompt 1 — Best Practices Primer
````text
Create a React+TS best-practices guide tailored to this repo:
- Identify anti-patterns present
- Show corrected patterns with code
- Provide quick wins vs longer-term actions
````

#### Prompt 2 — Feature/Component Generator
````text
Implement [feature] using current conventions. Deliver components, hooks, services, and tests. Include prop types, memoization strategy, and a11y plan.
````

#### Prompt 3 — Debug & Fix
````text
Triaging [bug]: Provide reproduction, likely cause, fix patch, and regression tests. Add a guard (type or runtime) to prevent recurrence.
````

#### Prompt 4 — Refactor & Architecture
````text
Reduce bundle and re-render costs. Suggest code-splitting points, memoization, React.lazy, Suspense-based data boundaries. Provide diffs for 1–2 modules and measured impact approximations.
````

#### Prompt 5 — Dev Strategy
````text
Propose CI/CD improvements (caching, parallel test shards), dependency audit, and pre-merge quality gates. Include ready-to-paste config snippets.
````

---

### Tool: Gemini (React)
- Purpose: Modern React+TS guidance with rationale, full-file outputs, and checklists.

#### Prompt 1 — Best Practices Primer
````text
Generate a modern React+TS guide: strict TS, hooks patterns, server-state vs UI-state, Suspense/ErrorBoundary usage, a11y, security. Provide short rationale + examples. Optimize for Vite or Next.js (detect from package.json I’ll paste).
````

#### Prompt 2 — Feature/Component Generator
````text
Implement [feature] with typed data access (fetch/axios), schema validation, resilient UI states, tests, and performance notes. Return complete file contents and a small usage example.
````

#### Prompt 3 — Debug & Fix
````text
Analyze [error/logs/snippets]. Provide root cause, minimal fix, and tests. Include a one-paragraph “why this failed” explanation for future devs.
````

#### Prompt 4 — Refactor & Architecture
````text
Propose an incremental plan to adopt React Query (if applicable), error boundaries, and Suspense for data. Include sample refactor of one screen with before/after code and risks.
````

#### Prompt 5 — Dev Strategy
````text
Create a delivery plan: scripts, CI matrix (Node versions), caching, coverage thresholds, accessibility checks, and release steps. Return as checklists + snippets.
````

---

### Tool: Copilot (React)
- Purpose: Concise, pragmatic prompts for Copilot Chat and code generation.

#### Prompt 1 — Best Practices Primer (Copilot Chat)
````text
Act as a React+TS reviewer for this repo. Summarize current issues and propose fixes aligned with strict typing, hooks hygiene, a11y, and security. Provide code examples I can paste. Keep answers concise and practical.
````

#### Prompt 2 — Feature/Component Generator
````text
Build [feature] with TypeScript strict mode, minimal deps, and RTL tests. Provide full file contents and a usage example. Prefer current project patterns.
````

#### Prompt 3 — Debug & Fix
````text
Given these logs and files, identify the root cause and propose a minimal change. Provide test updates and a verification checklist.
````

#### Prompt 4 — Refactor & Architecture
````text
Suggest a stepwise refactor to reduce re-renders and clarify state boundaries. Provide 2–3 small patches with explanations.
````

#### Prompt 5 — Dev Strategy
````text
Propose scripts, lint rules, CI steps, and a PR checklist tuned for this repo. Include ready-to-paste config.
````

---

## Chapter 2 — iOS with Swift/SwiftUI

### Tool: Lovable (iOS)
- Purpose: Swift/SwiftUI standards, feature builds, debugging, refactoring, and delivery.

#### Prompt 1 — Best Practices Primer
````text
Role: Senior iOS engineer. Goal: Swift 5.9+, SwiftUI (iOS 17+) best practices.

Context:
- Architecture: MVVM with protocol-oriented DI
- Concurrency: async/await, Task, actors where appropriate
- Data: URLSession + Codable (or SwiftData/Core Data if present)
- Tests: XCTest, ViewInspector/snapshot (if available)

Deliver:
1) Standards (file structure, naming, access control, test strategy)
2) Patterns: View/ViewModel separation, State management (@StateObject, @ObservedObject), navigation, dependency injection
3) Code snippets demonstrating patterns
4) a11y and performance checklist (Instruments, Previews)
5) Security checklist (Keychain, ATS, privacy)
````

#### Prompt 2 — Feature/Screen Generator
````text
Implement [feature/screen]. Use MVVM, async/await networking, and SwiftUI best practices.

Acceptance:
- View updates driven by @StateObject ViewModel
- Robust error/loading/empty handling
- Unit tests for ViewModel, UI tests for navigation and critical flows
- Accessibility: labels, traits, Dynamic Type

Deliver:
- File tree
- SwiftUI views + ViewModel + service
- Tests (XCTest)
- Notes on performance and edge cases
````

#### Prompt 3 — Debug & Fix
````text
Inputs: Crash log / stack trace [paste], repro steps, code snippets.

Do:
1) Triage and root cause hypothesis
2) Minimal code fix with explanation
3) Add tests to reproduce the issue
4) Instruments/metrics suggestion to validate improvements
````

#### Prompt 4 — Refactor & Architecture Strategy
````text
Refactor to clarify data flow and reduce SwiftUI invalidations:
- Convert to MVVM where missing
- Use immutable model structs, let where possible
- Annotate with @MainActor as needed
- Split large views; pass bindings correctly; use Identifiable
Provide before/after code and migration steps.
````

#### Prompt 5 — Dev Strategy & Quality Gates
````text
Provide:
- CI steps (xcodebuild, test, codesign placeholders)
- Fastlane lanes outline
- Lint/format (SwiftLint/SwiftFormat) rules
- a11y checklist and snapshot testing guidance
- Release checklist (entitlements, privacy strings, TestFlight rollout)
````

---

### Tool: Cursor (iOS)
- Purpose: Cursor-optimized Swift/SwiftUI prompts for diffs and incremental improvements.

#### Prompt 1 — Best Practices Primer (Cursor-optimized)
````text
Scan selected Swift and SwiftUI files. Report:
- Concurrency issues (escaping closures, main actor hops)
- State usage problems (@State vs @StateObject vs @ObservedObject)
- Navigation and deep-linking issues
- Performance anti-patterns (heavy body, onAppear loops)
Provide minimal ```diff patches per file and tests to cover.
````

#### Prompt 2 — Feature/Screen Generator (Cursor-optimized)
````text
Implement [screen]. Keep existing architecture. Provide:
- View + ViewModel + Service code
- Small diffs for touched files
- XCTest for ViewModel and critical flows
- Accessibility notes
````

#### Prompt 3 — Debug & Fix (Cursor-optimized)
````text
Given crash logs and files, produce:
- Root cause summary
- Minimal fix as ```diff
- Regression tests
- Manual validation steps (Previews + device)
````

#### Prompt 4 — Incremental Refactor (Cursor-optimized)
````text
Refactor [module] to MVVM and structured concurrency. Provide sequential diffs with short commit messages and rationale. Keep API stable.
````

#### Prompt 5 — Dev Strategy (Cursor-optimized)
````text
Update CI to run unit/UI tests on iOS simulators. Provide workflow YAML diff and Fastlane lane samples. Ensure commands align with this project’s structure.
````

---

### Tool: Kiro (iOS)
- Purpose: Consolidated Swift/SwiftUI standards, feature scaffolding, debugging, architecture, and delivery.

#### Prompt 1 — Best Practices Primer
````text
Produce a Swift/SwiftUI standard doc: MVVM, protocol-based DI, async/await, error handling, navigation, accessibility, security. Include example code for each pattern.
````

#### Prompt 2 — Feature/Screen Generator
````text
Implement [feature] with ViewModel and typed services. Provide SwiftUI views, ViewModel, service, and tests. Include error/empty states.
````

#### Prompt 3 — Debug & Fix
````text
Analyze [stack trace/logs] and [files]. Provide minimal fix, tests, and “avoid next time” guidance (actors, isolation annotations, ownership).
````

#### Prompt 4 — Refactor & Architecture
````text
Restructure to feature-based folders and MVVM. Define a migration plan and refactor one module as a reference implementation.
````

#### Prompt 5 — Dev Strategy
````text
Offer CI steps, lint rules (SwiftLint/SwiftFormat), test coverage targets, and release checklist. Provide ready-to-paste snippets.
````

---

### Tool: Qoder (iOS)
- Purpose: Repo-specific audits, feature delivery, debugging, performance optimization, and release flow.

#### Prompt 1 — Best Practices Primer
````text
Tailor best practices to this codebase: identify anti-patterns in SwiftUI and concurrency. Show corrected examples, a11y/security checklist, and quick wins vs long-term improvements.
````

#### Prompt 2 — Feature/Screen Generator
````text
Add [screen], using MVVM and async/await networking. Provide code and tests. Include preview setups for rapid iteration.
````

#### Prompt 3 — Debug & Fix
````text
Triage [bug]. Provide reproduction, fix, tests, and Instruments plan (time profiler or allocations) to confirm the improvement.
````

#### Prompt 4 — Refactor & Architecture
````text
Optimize rendering: use smaller views, EquatableView where applicable, and derived state. Provide before/after code and measurable impact guidance.
````

#### Prompt 5 — Dev Strategy
````text
Set up CI (build/test), static analysis, code signing placeholders, and TestFlight release steps with checklists.
````

---

### Tool: Gemini (iOS)
- Purpose: Modern iOS 17+ practices, succinct code samples, pitfalls, and delivery checklists.

#### Prompt 1 — Best Practices Primer
````text
Generate a modern Swift/SwiftUI practices guide for iOS 17+: MVVM, async/await, actors, navigation, a11y, security. Include concise code samples (View+ViewModel+Service) and common pitfalls.
````

#### Prompt 2 — Feature/Screen Generator
````text
Create [feature/screen] with data flow via ViewModel, async network, and robust states. Provide tests and a preview harness showcasing error/loading.
````

#### Prompt 3 — Debug & Fix
````text
Given crash logs and code, provide root cause, minimal fix, and tests. Explain the concurrency or state misuse briefly.
````

#### Prompt 4 — Refactor & Architecture
````text
Propose progressive adoption of actors and @MainActor where needed, and clear isolation boundaries. Provide example refactor for one data flow.
````

#### Prompt 5 — Dev Strategy
````text
Propose scripts and CI steps, lint rules, and release checklist (entitlements, privacy, ATS). Return as checklists + snippets.
````

---

### Tool: Copilot (iOS)
- Purpose: Pragmatic Copilot Chat prompts for Swift/SwiftUI repos.

#### Prompt 1 — Best Practices Primer (Copilot Chat)
````text
Review this Swift/SwiftUI repo for state/concurrency issues and a11y gaps. Provide specific fixes and code examples I can paste. Keep it pragmatic.
````

#### Prompt 2 — Feature/Screen Generator
````text
Build [screen] with SwiftUI + MVVM + async/await. Provide View, ViewModel, Service, and tests. Include preview sample data.
````

#### Prompt 3 — Debug & Fix
````text
Identify the root cause from these logs and code. Provide a minimal fix and tests. Add annotations (@MainActor, nonisolated) if applicable.
````

#### Prompt 4 — Refactor & Architecture
````text
Suggest a 2–3 step refactor to make rendering predictable and reduce invalidations. Provide small patches with explanations.
````

#### Prompt 5 — Dev Strategy
````text
Provide CI steps, lint configuration, and a release checklist customized for our project, with ready-to-paste configs.
````

---

## Chapter 3 — Flutter (Cross-Platform)

### Tool: Lovable (Flutter)
- Purpose: Flutter standards, feature generation, debugging, refactors, and delivery gates.

#### Prompt 1 — Best Practices Primer
````text
Role: Senior Flutter engineer. Goal: Dart 3.x + Flutter 3.x best practices.

Context:
- State: [Riverpod/Bloc/Provider]
- Routing: [go_router]
- Networking: [dio/http]
- Codegen: [freezed, json_serializable] if applicable
- Tests: flutter_test, integration_test, golden_toolkit

Deliver:
1) Standards (folder structure, state patterns, immutability)
2) Performance checklist (const constructors, keys, RepaintBoundary)
3) a11y checklist (Semantics, large fonts, contrast)
4) Security basics (secure storage, platform channels hygiene)
5) Code samples for each section
````

#### Prompt 2 — Feature/Screen Generator
````text
Implement [screen/feature]. Use [state_mgmt], go_router, and typed models.

Acceptance:
- Immutable models (freezed) with JSON serialization
- Error/loading/empty UI states
- Unit + widget tests; optional golden test
- Performance: const where possible, avoid rebuilds, keys

Deliver:
- File tree
- Widgets + state providers/cubits
- Services (dio) + repository pattern
- Tests and a usage snippet
````

#### Prompt 3 — Debug & Fix
````text
Inputs: Error logs, repro steps, code snippets.

Do:
1) Hypotheses (ranked)
2) Minimal failing test (widget/unit)
3) Fix with code (show exact diffs or complete files)
4) Verification steps (profile mode, performance overlay)
5) Regression tests
````

#### Prompt 4 — Refactor & Architecture Strategy
````text
Refactor to feature-based modules, repository pattern, and clear state boundaries. Provide:
- Target structure
- Stepwise migration plan
- Example refactor (before/after)
- Risks, rollbacks, and metrics (frame drops, build counts)
````

#### Prompt 5 — Dev Strategy & Quality Gates
````text
Provide:
- CI steps (flutter analyze, test with coverage, build)
- Fastlane or codemagic.yaml outline
- Lints: enable recommended lints, pedantic equivalent
- Pre-commit hooks
- Release checklist (iOS/Android signing, flavors, store assets)
````

---

### Tool: Cursor (Flutter)
- Purpose: Cursor-optimized prompts for diffs, tests, and performance changes.

#### Prompt 1 — Best Practices Primer (Cursor-optimized)
````text
Scan selected Dart files. Report:
- Rebuild hot spots (lack of const, broad listeners)
- State misuses (provider scope, Riverpod ref.watch misuse)
- Navigation pitfalls in go_router
Provide minimal ```diff patches and tests to validate changes.
````

#### Prompt 2 — Feature/Screen Generator (Cursor-optimized)
````text
Implement [feature] using existing state management. Return:
- New files (full content)
- Diffs for modified files
- Unit/widget tests and optional golden test
Keep imports and style consistent with the repo.
````

#### Prompt 3 — Debug & Fix (Cursor-optimized)
````text
Given logs and files, produce root cause, minimal fix as ```diff, a failing test first, and validation steps (profile + performance overlay). Keep changes small.
````

#### Prompt 4 — Incremental Refactor (Cursor-optimized)
````text
Refactor [module] to reduce rebuilds (extract widgets, keys, selectors). Provide sequential diffs with short commit messages and rationale.
````

#### Prompt 5 — Dev Strategy (Cursor-optimized)
````text
Update CI to run analyze/test/build with caching. Provide workflow YAML diffs and lint rules aligned to analysis_options.yaml.
````

---

### Tool: Kiro (Flutter)
- Purpose: Flutter standards, feature generation, debugging, architecture, and CI/release steps.

#### Prompt 1 — Best Practices Primer
````text
Create a Flutter standards doc: folder structure, state patterns (Riverpod/Bloc), immutability, navigation, a11y, performance, security. Include code samples.
````

#### Prompt 2 — Feature/Screen Generator
````text
Build [screen] with [state_mgmt], go_router, dio, and freezed models. Include tests and golden where valuable. Provide full file contents.
````

#### Prompt 3 — Debug & Fix
````text
Analyze [error] with snippets. Provide minimal fix, failing test first, and rebuild/perf validation checklist.
````

#### Prompt 4 — Refactor & Architecture
````text
Move to repository pattern and feature modules. Provide migration plan and example refactor.
````

#### Prompt 5 — Dev Strategy
````text
Propose CI, linting, and release steps. Include config snippets for analysis_options.yaml and workflows.
````

---

### Tool: Qoder (Flutter)
- Purpose: Repo audits, feature builds, bug triage, performance upgrades, and CI/CD patterns.

#### Prompt 1 — Best Practices Primer
````text
Audit this Flutter repo for state misuse, rebuild hotspots, and navigation issues. Provide quick wins, longer-term improvements, and sample patches.
````

#### Prompt 2 — Feature/Screen Generator
````text
Implement [feature] consistent with current patterns. Provide widgets, state, services, and tests with concise examples.
````

#### Prompt 3 — Debug & Fix
````text
Triage [bug]. Provide repro, fix, and tests. Add guardrails (e.g., selectors, separation of concerns) to prevent recurrence.
````

#### Prompt 4 — Refactor & Architecture
````text
Optimize performance: const constructors, keys, selective rebuilds, RepaintBoundary. Provide before/after code and measurement tips.
````

#### Prompt 5 — Dev Strategy
````text
Set up CI + linting, coverage thresholds, and release pipeline outlines for Android/iOS, with ready-to-use snippets.
````

---

### Tool: Gemini (Flutter)
- Purpose: Dart 3.x/Flutter 3.x best practices and production-ready scaffolding.

#### Prompt 1 — Best Practices Primer
````text
Generate a Flutter best-practices guide for Dart 3.x, including state patterns, navigation with go_router, performance, a11y, and security. Provide code samples and pitfalls.
````

#### Prompt 2 — Feature/Screen Generator
````text
Create [screen/feature] with immutable models (freezed), dio networking, [state_mgmt], and tests (unit/widget + optional golden). Provide full files and a usage example.
````

#### Prompt 3 — Debug & Fix
````text
Given logs/snippets, provide root cause, minimal fix, and tests. Explain in one paragraph how the issue appeared and how the fix prevents it.
````

#### Prompt 4 — Refactor & Architecture
````text
Propose a phased refactor toward repository pattern and finer-grained widgets to reduce rebuilds. Include an example refactor.
````

#### Prompt 5 — Dev Strategy
````text
Provide CI steps, lint rules, and release checklist (keystores, provisioning) tailored to a typical Flutter app. Return as checklists + snippets.
````

---

### Tool: Copilot (Flutter)
- Purpose: Concise Copilot prompts tailored to Flutter repos.

#### Prompt 1 — Best Practices Primer (Copilot Chat)
````text
Review this Flutter repo for performance and state issues. Provide actionable fixes and code I can paste. Keep it concise and focused on high-impact changes.
````

#### Prompt 2 — Feature/Screen Generator
````text
Build [screen] using existing state management and navigation. Provide full file contents and tests, keeping style consistent with the repo.
````

#### Prompt 3 — Debug & Fix
````text
From these logs and files, find the root cause and provide a minimal patch and tests. Include a short verification checklist.
````

#### Prompt 4 — Refactor & Architecture
````text
Suggest 2–3 refactor steps to reduce rebuilds and clarify data flow. Provide small patches and rationale.
````

#### Prompt 5 — Dev Strategy
````text
Provide scripts, CI steps, lint rules, and a release checklist customized to this project, with ready-to-paste configs.
````

---

## Appendix A — How to Use These Prompts Effectively
- Replace placeholders like [feature], [state_mgmt], [error], [files], and [repo specifics] with your project details.
- Paste in the minimum relevant file snippets or paths to ground answers in real context.
- Ask for small, incremental diffs and tests to keep changes reviewable in PRs.
- Maintain a shared “Standards” doc per platform and evolve it as the project matures.

---

## Appendix B — Summary
- Each chapter provides tool-specific, copy-pasteable prompts covering best practices, feature generation, debugging, refactoring/architecture, and delivery strategy.
- Prompts emphasize strong typing, testing, accessibility, performance, and security appropriate to React+TS, Swift/SwiftUI, and Flutter stacks.
- Cursor variants prioritize patch-style outputs; others emphasize concise, directly pasteable code and checklists.

---

## Version & Source Information
- Source: “AI Developer Tool Guide.md” (user-supplied)
- Target platforms and versions reflected in prompts:
  - React 18, TypeScript 5.x
  - Swift 5.9+, iOS 17+ (SwiftUI)
  - Dart 3.x, Flutter 3.x

---

Summary of key points:
- This is a ready-to-use prompt book organized by platform and tool.
- Each section includes precise, practical prompts you can paste as-is after replacing placeholders.
- The content is structured to support best practices end-to-end: standards, features, debugging, refactoring, and delivery.