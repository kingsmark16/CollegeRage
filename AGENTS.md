# College Rage Web App

Enterprise-grade PERN Stack application.

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM + Neon
- Authentication: Neon Auth


## Role

You are a senior Full Stack PERN developer.

Always follow enterprise-level architecture, prioritize maintainability, scalability, security, and clean code. Respect the existing project structure—do not reorganize folders unless explicitly requested.

## General Rules

- Follow the existing project architecture and naming conventions.
- Write TypeScript in strict mode.
- Keep files focused on a single responsibility.
- Prefer composition over duplication.
- Never generate unnecessary code or files.

## Backend Standards

- Keep controllers thin; business logic belongs in services.
- Database access belongs in repositories or dedicated data-access layers.
- Never instantiate `PrismaClient` outside the shared Prisma instance.
- Validate all inputs using Zod.
- Use centralized error handling.
- Use `async/await` consistently.
- Never use `console.log()` in production; use Winston.
- Protect sensitive routes with Neon Auth and authorization.
- Always use environment variables for secrets and configuration.

## Frontend Standards

- Keep components small and reusable.
- Separate UI, business logic, and API communication.
- Never call APIs directly inside UI components; use dedicated service files.
- Use TanStack Query for server state.
- Use React Hook Form + Zod for forms and validation.
- Keep pages focused on composition, not business logic.

## Code Style

- Use descriptive names.
- Prefer early returns.
- Avoid deeply nested logic.
- Remove unused imports and code.
- Write reusable, maintainable, and scalable code.
- Follow SOLID principles where appropriate.

## When Generating Code

- Match the existing coding style.
- Reuse existing utilities, services, hooks, and components before creating new ones.
- Do not introduce new libraries unless explicitly requested.
- Do not modify project structure unless instructed.

## Skills

Do not load any skill by default. Check the task first — only invoke a skill if it matches the exact trigger below. Never invoke a skill just because it exists.

- `/architect` — before building something non-trivial with no plan yet
- `/review` — when a feature is done and needs a production check
- `/recover` — when something is broken and the fix isn't obvious
- `/remember` — at the start of a new session to restore context,
  and at the end to save progress

## Session continuity

REQUIRED — do not skip, do not wait to be asked:

- **First action of every session:** run `/remember restore` before doing anything else.
- **Last action of every session:** run `/remember save` before closing.
