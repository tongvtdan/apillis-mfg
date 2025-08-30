# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c996c96e-2dfb-4a1a-86ed-069ecd1553f4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c996c96e-2dfb-4a1a-86ed-069ecd1553f4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5: Run tests (optional)
npm test                # Run tests in watch mode
npm run test:run        # Run all tests once
npm run test:ui         # Launch interactive test UI
npm run test:coverage   # Generate coverage reports
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI components  
- **Styling**: Tailwind CSS + DaisyUI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: TanStack Query (React Query) + React Context
- **Testing**: Vitest + React Testing Library + JSDOM
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts + Chart.js
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Testing

This project includes comprehensive testing infrastructure:

- **Unit Tests**: Component and function testing with Vitest
- **Integration Tests**: Component interaction and workflow testing  
- **E2E Tests**: Complete user journey testing
- **Mocking**: Supabase client and browser API mocking
- **Coverage**: Automated test coverage reporting

Run tests with:
```bash
npm test                # Watch mode for development
npm run test:run        # Single run for CI/CD
npm run test:ui         # Interactive test interface
npm run test:coverage   # Coverage reports
```

See [Testing Documentation](docs/testing-infrastructure.md) for detailed information.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c996c96e-2dfb-4a1a-86ed-069ecd1553f4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
