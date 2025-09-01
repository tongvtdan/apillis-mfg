Chapter 1 — React with TypeScript (Web)

Tool: Lovable
- Prompt 1 — Best Practices Primer
```
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
```

- Prompt 2 — Feature/Component Generator
```
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
```

- Prompt 3 — Debug & Fix
```
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
```

- Prompt 4 — Refactor & Architecture Strategy
```
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
```

- Prompt 5 — Dev Strategy & Quality Gates
```
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
```

Tool: Cursor
- Prompt 1 — Best Practices Primer (Cursor-optimized)
```
Act as a React+TS reviewer. Scan the current files I select. Summarize issues and propose fixes using modern best practices (strict typing, idiomatic hooks, Suspense/error boundaries, server-state vs UI-state, a11y, security). Output:
1) “Findings” (by file)
2) “Fix Plan” (ordered)
3) Minimal patch per file in ```diff blocks (no ellipses)
4) Tests to add/update
Keep changes small and directly applicable as patches.
```

- Prompt 2 — Feature/Component Generator (Cursor-optimized)
```
Goal: Implement [feature]. Read the selected files for context. Provide:
1) Proposed file/folder plan
2) Code for new/updated files (complete content)
3) ```diff patches for modifications
4) RTL tests
5) Post-merge checklist
Honor existing patterns (styling, state). Keep diffs atomic.
```

- Prompt 3 — Debug & Fix (Cursor-optimized)
```
Given the selected stack traces and files, produce:
1) Root cause analysis (1–2 paragraphs)
2) Failing test that reproduces
3) Minimal fix as ```diff
4) Verification steps
No placeholder code. Don’t rename files unless necessary.
```

- Prompt 4 — Incremental Refactor (Cursor-optimized)
```
Refactor [module/path] to reduce re-renders and side effects. Keep public API stable. Provide:
- Before/after overview
- Small sequential diffs (step 1..n) with commit messages
- Bench notes (what improves and why)
Include tests updated as needed.
```

- Prompt 5 — Dev Strategy & Quality Gates (Cursor-optimized)
```
Set up typecheck/lint/test/build in CI for this repo. Read package.json and workflows. Return:
- Updated scripts
- Workflow YAML diff
- ESLint config tuned for React+TS
- Pre-commit steps
Ensure commands actually run in this repo.
```

Tool: Kiro
- Prompt 1 — Best Practices Primer
```
You are a React+TS standards guide. Produce a concise standards doc with:
- Folder conventions, naming, barrel files policy
- Types-first patterns (discriminated unions, exhaustive switch)
- Hooks conventions (no side effects in render, dependency arrays)
- Data layer best practices (React Query/GraphQL)
- a11y checklist
- Security checklist
Include 2–3 code snippets for each major section.
```

- Prompt 2 — Feature/Component Generator
```
Build [feature]. Constraints: TS strict, a11y, tests, minimal deps. Provide:
- Data types + schema validation (Zod if available)
- Component(s) + custom hooks
- Error/loading/empty states
- RTL tests
- Follow-up tasks
```

- Prompt 3 — Debug & Fix
```
Given [error], [stack], and [files], output:
- Diagnosis
- Fix with code
- Post-fix tests
- Preventive guardrails (lint rules, type tweaks)
```

- Prompt 4 — Refactor & Architecture
```
Refactor toward feature-based structure and clear state boundaries (server vs UI). Provide:
- Target structure tree
- Migration steps
- Example refactor
- Risks and rollbacks
```

- Prompt 5 — Dev Strategy
```
Define delivery plan: CI steps, PR template, code review rubric, release checklist (semantic versioning, changelog), and observability hooks (basic logging, error boundary reporting).
```

Tool: Qoder
- Prompt 1 — Best Practices Primer
```
Create a React+TS best-practices guide tailored to this repo:
- Identify anti-patterns present
- Show corrected patterns with code
- Provide quick wins vs longer-term actions
```

- Prompt 2 — Feature/Component Generator
```
Implement [feature] using current conventions. Deliver components, hooks, services, and tests. Include prop types, memoization strategy, and a11y plan.
```

- Prompt 3 — Debug & Fix
```
Triaging [bug]: Provide reproduction, likely cause, fix patch, and regression tests. Add a guard (type or runtime) to prevent recurrence.
```

- Prompt 4 — Refactor & Architecture
```
Reduce bundle and re-render costs. Suggest code-splitting points, memoization, React.lazy, Suspense-based data boundaries. Provide diffs for 1–2 modules and measured impact approximations.
```

- Prompt 5 — Dev Strategy
```
Propose CI/CD improvements (caching, parallel test shards), dependency audit, and pre-merge quality gates. Include ready-to-paste config snippets.
```

Tool: Gemini
- Prompt 1 — Best Practices Primer
```
Generate a modern React+TS guide: strict TS, hooks patterns, server-state vs UI-state, Suspense/ErrorBoundary usage, a11y, security. Provide short rationale + examples. Optimize for Vite or Next.js (detect from package.json I’ll paste).
```

- Prompt 2 — Feature/Component Generator
```
Implement [feature] with typed data access (fetch/axios), schema validation, resilient UI states, tests, and performance notes. Return complete file contents and a small usage example.
```

- Prompt 3 — Debug & Fix
```
Analyze [error/logs/snippets]. Provide root cause, minimal fix, and tests. Include a one-paragraph “why this failed” explanation for future devs.
```

- Prompt 4 — Refactor & Architecture
```
Propose an incremental plan to adopt React Query (if applicable), error boundaries, and Suspense for data. Include sample refactor of one screen with before/after code and risks.
```

- Prompt 5 — Dev Strategy
```
Create a delivery plan: scripts, CI matrix (Node versions), caching, coverage thresholds, accessibility checks, and release steps. Return as checklists + snippets.
```

Tool: Copilot
- Prompt 1 — Best Practices Primer (Copilot Chat)
```
Act as a React+TS reviewer for this repo. Summarize current issues and propose fixes aligned with strict typing, hooks hygiene, a11y, and security. Provide code examples I can paste. Keep answers concise and practical.
```

- Prompt 2 — Feature/Component Generator
```
Build [feature] with TypeScript strict mode, minimal deps, and RTL tests. Provide full file contents and a usage example. Prefer current project patterns.
```

- Prompt 3 — Debug & Fix
```
Given these logs and files, identify the root cause and propose a minimal change. Provide test updates and a verification checklist.
```

- Prompt 4 — Refactor & Architecture
```
Suggest a stepwise refactor to reduce re-renders and clarify state boundaries. Provide 2–3 small patches with explanations.
```

- Prompt 5 — Dev Strategy
```
Propose scripts, lint rules, CI steps, and a PR checklist tuned for this repo. Include ready-to-paste config.
```


Chapter 2 — iOS with Swift/SwiftUI

Tool: Lovable
- Prompt 1 — Best Practices Primer
```
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
```

- Prompt 2 — Feature/Screen Generator
```
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
```

- Prompt 3 — Debug & Fix
```
Inputs: Crash log / stack trace [paste], repro steps, code snippets.

Do:
1) Triage and root cause hypothesis
2) Minimal code fix with explanation
3) Add tests to reproduce the issue
4) Instruments/metrics suggestion to validate improvements
```

- Prompt 4 — Refactor & Architecture Strategy
```
Refactor to clarify data flow and reduce SwiftUI invalidations:
- Convert to MVVM where missing
- Use immutable model structs, let where possible
- Annotate with @MainActor as needed
- Split large views; pass bindings correctly; use Identifiable
Provide before/after code and migration steps.
```

- Prompt 5 — Dev Strategy & Quality Gates
```
Provide:
- CI steps (xcodebuild, test, codesign placeholders)
- Fastlane lanes outline
- Lint/format (SwiftLint/SwiftFormat) rules
- a11y checklist and snapshot testing guidance
- Release checklist (entitlements, privacy strings, TestFlight rollout)
```

Tool: Cursor
- Prompt 1 — Best Practices Primer (Cursor-optimized)
```
Scan selected Swift and SwiftUI files. Report:
- Concurrency issues (escaping closures, main actor hops)
- State usage problems (@State vs @StateObject vs @ObservedObject)
- Navigation and deep-linking issues
- Performance anti-patterns (heavy body, onAppear loops)
Provide minimal ```diff patches per file and tests to cover.
```

- Prompt 2 — Feature/Screen Generator (Cursor-optimized)
```
Implement [screen]. Keep existing architecture. Provide:
- View + ViewModel + Service code
- Small diffs for touched files
- XCTest for ViewModel and critical flows
- Accessibility notes
```

- Prompt 3 — Debug & Fix (Cursor-optimized)
```
Given crash logs and files, produce:
- Root cause summary
- Minimal fix as ```diff
- Regression tests
- Manual validation steps (Previews + device)
```

- Prompt 4 — Incremental Refactor (Cursor-optimized)
```
Refactor [module] to MVVM and structured concurrency. Provide sequential diffs with short commit messages and rationale. Keep API stable.
```

- Prompt 5 — Dev Strategy (Cursor-optimized)
```
Update CI to run unit/UI tests on iOS simulators. Provide workflow YAML diff and Fastlane lane samples. Ensure commands align with this project’s structure.
```

Tool: Kiro
- Prompt 1 — Best Practices Primer
```
Produce a Swift/SwiftUI standard doc: MVVM, protocol-based DI, async/await, error handling, navigation, accessibility, security. Include example code for each pattern.
```

- Prompt 2 — Feature/Screen Generator
```
Implement [feature] with ViewModel and typed services. Provide SwiftUI views, ViewModel, service, and tests. Include error/empty states.
```

- Prompt 3 — Debug & Fix
```
Analyze [stack trace/logs] and [files]. Provide minimal fix, tests, and “avoid next time” guidance (actors, isolation annotations, ownership).
```

- Prompt 4 — Refactor & Architecture
```
Restructure to feature-based folders and MVVM. Define a migration plan and refactor one module as a reference implementation.
```

- Prompt 5 — Dev Strategy
```
Offer CI steps, lint rules (SwiftLint/SwiftFormat), test coverage targets, and release checklist. Provide ready-to-paste snippets.
```

Tool: Qoder
- Prompt 1 — Best Practices Primer
```
Tailor best practices to this codebase: identify anti-patterns in SwiftUI and concurrency. Show corrected examples, a11y/security checklist, and quick wins vs long-term improvements.
```

- Prompt 2 — Feature/Screen Generator
```
Add [screen], using MVVM and async/await networking. Provide code and tests. Include preview setups for rapid iteration.
```

- Prompt 3 — Debug & Fix
```
Triage [bug]. Provide reproduction, fix, tests, and Instruments plan (time profiler or allocations) to confirm the improvement.
```

- Prompt 4 — Refactor & Architecture
```
Optimize rendering: use smaller views, EquatableView where applicable, and derived state. Provide before/after code and measurable impact guidance.
```

- Prompt 5 — Dev Strategy
```
Set up CI (build/test), static analysis, code signing placeholders, and TestFlight release steps with checklists.
```

Tool: Gemini
- Prompt 1 — Best Practices Primer
```
Generate a modern Swift/SwiftUI practices guide for iOS 17+: MVVM, async/await, actors, navigation, a11y, security. Include concise code samples (View+ViewModel+Service) and common pitfalls.
```

- Prompt 2 — Feature/Screen Generator
```
Create [feature/screen] with data flow via ViewModel, async network, and robust states. Provide tests and a preview harness showcasing error/loading.
```

- Prompt 3 — Debug & Fix
```
Given crash logs and code, provide root cause, minimal fix, and tests. Explain the concurrency or state misuse briefly.
```

- Prompt 4 — Refactor & Architecture
```
Propose progressive adoption of actors and @MainActor where needed, and clear isolation boundaries. Provide example refactor for one data flow.
```

- Prompt 5 — Dev Strategy
```
Propose scripts and CI steps, lint rules, and release checklist (entitlements, privacy, ATS). Return as checklists + snippets.
```

Tool: Copilot
- Prompt 1 — Best Practices Primer (Copilot Chat)
```
Review this Swift/SwiftUI repo for state/concurrency issues and a11y gaps. Provide specific fixes and code examples I can paste. Keep it pragmatic.
```

- Prompt 2 — Feature/Screen Generator
```
Build [screen] with SwiftUI + MVVM + async/await. Provide View, ViewModel, Service, and tests. Include preview sample data.
```

- Prompt 3 — Debug & Fix
```
Identify the root cause from these logs and code. Provide a minimal fix and tests. Add annotations (@MainActor, nonisolated) if applicable.
```

- Prompt 4 — Refactor & Architecture
```
Suggest a 2–3 step refactor to make rendering predictable and reduce invalidations. Provide small patches with explanations.
```

- Prompt 5 — Dev Strategy
```
Provide CI steps, lint configuration, and a release checklist customized for our project, with ready-to-paste configs.
```


Chapter 3 — Flutter (Cross-Platform)

Tool: Lovable
- Prompt 1 — Best Practices Primer
```
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
```

- Prompt 2 — Feature/Screen Generator
```
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
```

- Prompt 3 — Debug & Fix
```
Inputs: Error logs, repro steps, code snippets.

Do:
1) Hypotheses (ranked)
2) Minimal failing test (widget/unit)
3) Fix with code (show exact diffs or complete files)
4) Verification steps (profile mode, performance overlay)
5) Regression tests
```

- Prompt 4 — Refactor & Architecture Strategy
```
Refactor to feature-based modules, repository pattern, and clear state boundaries. Provide:
- Target structure
- Stepwise migration plan
- Example refactor (before/after)
- Risks, rollbacks, and metrics (frame drops, build counts)
```

- Prompt 5 — Dev Strategy & Quality Gates
```
Provide:
- CI steps (flutter analyze, test with coverage, build)
- Fastlane or codemagic.yaml outline
- Lints: enable recommended lints, pedantic equivalent
- Pre-commit hooks
- Release checklist (iOS/Android signing, flavors, store assets)
```

Tool: Cursor
- Prompt 1 — Best Practices Primer (Cursor-optimized)
```
Scan selected Dart files. Report:
- Rebuild hot spots (lack of const, broad listeners)
- State misuses (provider scope, Riverpod ref.watch misuse)
- Navigation pitfalls in go_router
Provide minimal ```diff patches and tests to validate changes.
```

- Prompt 2 — Feature/Screen Generator (Cursor-optimized)
```
Implement [feature] using existing state management. Return:
- New files (full content)
- Diffs for modified files
- Unit/widget tests and optional golden test
Keep imports and style consistent with the repo.
```

- Prompt 3 — Debug & Fix (Cursor-optimized)
```
Given logs and files, produce root cause, minimal fix as ```diff, a failing test first, and validation steps (profile + performance overlay). Keep changes small.
```

- Prompt 4 — Incremental Refactor (Cursor-optimized)
```
Refactor [module] to reduce rebuilds (extract widgets, keys, selectors). Provide sequential diffs with short commit messages and rationale.
```

- Prompt 5 — Dev Strategy (Cursor-optimized)
```
Update CI to run analyze/test/build with caching. Provide workflow YAML diffs and lint rules aligned to analysis_options.yaml.
```

Tool: Kiro
- Prompt 1 — Best Practices Primer
```
Create a Flutter standards doc: folder structure, state patterns (Riverpod/Bloc), immutability, navigation, a11y, performance, security. Include code samples.
```

- Prompt 2 — Feature/Screen Generator
```
Build [screen] with [state_mgmt], go_router, dio, and freezed models. Include tests and golden where valuable. Provide full file contents.
```

- Prompt 3 — Debug & Fix
```
Analyze [error] with snippets. Provide minimal fix, failing test first, and rebuild/perf validation checklist.
```

- Prompt 4 — Refactor & Architecture
```
Move to repository pattern and feature modules. Provide migration plan and example refactor.
```

- Prompt 5 — Dev Strategy
```
Propose CI, linting, and release steps. Include config snippets for analysis_options.yaml and workflows.
```

Tool: Qoder
- Prompt 1 — Best Practices Primer
```
Audit this Flutter repo for state misuse, rebuild hotspots, and navigation issues. Provide quick wins, longer-term improvements, and sample patches.
```

- Prompt 2 — Feature/Screen Generator
```
Implement [feature] consistent with current patterns. Provide widgets, state, services, and tests with concise examples.
```

- Prompt 3 — Debug & Fix
```
Triage [bug]. Provide repro, fix, and tests. Add guardrails (e.g., selectors, separation of concerns) to prevent recurrence.
```

- Prompt 4 — Refactor & Architecture
```
Optimize performance: const constructors, keys, selective rebuilds, RepaintBoundary. Provide before/after code and measurement tips.
```

- Prompt 5 — Dev Strategy
```
Set up CI + linting, coverage thresholds, and release pipeline outlines for Android/iOS, with ready-to-use snippets.
```

Tool: Gemini
- Prompt 1 — Best Practices Primer
```
Generate a Flutter best-practices guide for Dart 3.x, including state patterns, navigation with go_router, performance, a11y, and security. Provide code samples and pitfalls.
```

- Prompt 2 — Feature/Screen Generator
```
Create [screen/feature] with immutable models (freezed), dio networking, [state_mgmt], and tests (unit/widget + optional golden). Provide full files and a usage example.
```

- Prompt 3 — Debug & Fix
```
Given logs/snippets, provide root cause, minimal fix, and tests. Explain in one paragraph how the issue appeared and how the fix prevents it.
```

- Prompt 4 — Refactor & Architecture
```
Propose a phased refactor toward repository pattern and finer-grained widgets to reduce rebuilds. Include an example refactor.
```

- Prompt 5 — Dev Strategy
```
Provide CI steps, lint rules, and release checklist (keystores, provisioning) tailored to a typical Flutter app. Return as checklists + snippets.
```

Tool: Copilot
- Prompt 1 — Best Practices Primer (Copilot Chat)
```
Review this Flutter repo for performance and state issues. Provide actionable fixes and code I can paste. Keep it concise and focused on high-impact changes.
```

- Prompt 2 — Feature/Screen Generator
```
Build [screen] using existing state management and navigation. Provide full file contents and tests, keeping style consistent with the repo.
```

- Prompt 3 — Debug & Fix
```
From these logs and files, find the root cause and provide a minimal patch and tests. Include a short verification checklist.
```

- Prompt 4 — Refactor & Architecture
```
Suggest 2–3 refactor steps to reduce rebuilds and clarify data flow. Provide small patches and rationale.
```

- Prompt 5 — Dev Strategy
```
Provide scripts, CI steps, lint rules, and a release checklist customized to this project, with ready-to-paste configs.
```

How to use these prompts effectively
- Replace placeholders like [feature], [state_mgmt], [error], [files], [repo specifics] with your project details.
- Paste in the minimum relevant file snippets or paths to ground the assistant’s answers.
- Ask for small, incremental diffs and tests to keep changes reviewable.
- Keep a shared “Standards” doc per platform and evolve it as the project matures.

Summary
- Each chapter provides tool-specific, copy-pasteable prompts covering best practices, feature generation (code snippets), debugging, refactoring/architecture, and delivery strategy.
- Prompts emphasize strong typing, testing, accessibility, performance, and security appropriate to React+TS, Swift/SwiftUI, and Flutter stacks.
- Cursor variants return patch-style outputs; others emphasize concise, directly pasteable code and checklists.