# LLM Rules for kolkrabbi.io

---

## ⚠️ CRITICAL STARTUP PROTOCOL - READ THIS FIRST ⚠️

**WHEN THE USER SAYS "read `LLM_RULES.md`" YOU MUST:**

1. **READ** `/docs/llm-context/AGENT-CONTEXT.md`
2. **READ** the latest session log from `/docs/llm-context/session-log/` (sort by date, most recent first)
3. **STOP** and say "Context loaded. What would you like me to work on?"
4. **WAIT** for the user to specify their task

**DO NOT:**
- Skip reading the context files
- Start working before the user specifies a task

**IF THE USER ASKS "Do you understand?" or "Outline the task?":**
Respond with a clear plan of what you'll do BEFORE taking any action.

---

# LLM Agent Onboarding

Welcome to the **Kolkrabbi Design System** project. This document helps AI agents get oriented and work effectively.

## Quick Start

1. **Read this file** to understand the project structure
2. **Read** `/docs/llm-context/AGENT-CONTEXT.md` for current project state
3. **Check** `/docs/llm-context/session-log/` for the most recent session log
4. **Follow** the conventions and guidelines below

## Project Overview

**Kolkrabbi** is a typography-focused design system using JetBrains Mono as the primary typeface. The system provides:
- Responsive typography scales
- Consistent weight hierarchy
- Standalone CSS (no framework dependencies)
- Interactive styleguide for developers

### Tech Stack
- CSS (standalone, no preprocessor)
- React (for styleguide only)
- JetBrains Mono (local font files)
- Tailwind CSS (for utility composition)
- **Yarn** (package manager - NOT npm)

### Package Manager

**⚠️ IMPORTANT: This project uses Yarn, NOT npm**

- **Run dev server:** `yarn dev`
- **Install dependencies:** `yarn install` or `yarn`
- **Build:** `yarn build`
- **Run tests:** `yarn test` (if configured)

**DO NOT use npm commands** - the project has `yarn.lock`, not `package-lock.json`

## Directory Structure

```
kol-system/
├── design-system/
│   └── typography/
│       └── mono/
│           ├── kol-typography-mono.css    # Main CSS file
│           └── kol-typography-mono.md     # Documentation
├── src/
│   └── components/
│       └── styleguide/
│           └── Typography.jsx             # Interactive demo
├── fonts/
│   └── jetbrains-mono/                    # Font files (.woff2)
├── docs/
│   └── llm-context/                       # AI agent context
│       ├── AGENT-CONTEXT.md               # Current state
│       ├── README.md                      # This directory
│       └── session-log/                   # Session history
└── LLM_RULES.md                           # This file
```

## LLM Context Protocol

This project uses **session logs** to maintain context across agents and sessions.

### Reading Context

**Always read the latest session log** in `/docs/llm-context/session-log/` before starting work. Session logs are named:
- `YYYY-MM-DD-session-description.md`

Sort by date to find the most recent.

### Writing Context

When you complete significant work:
1. Create a new session log in `/docs/llm-context/session-log/`
2. Use the format: `YYYY-MM-DD-brief-description.md`
3. Include:
   - Session metadata (date, agent, summary)
   - Changes made (files, features, fixes)
   - Current state (what works now)
   - Next steps (recommended follow-up)
4. Update `AGENT-CONTEXT.md` if needed

### Session Log Template

```markdown
# Session: [Brief Description]

**Date:** YYYY-MM-DD
**Agent:** [Your identifier]
**Summary:** [One-line description of work done]

## Changes Made

### Files Modified
- path/to/file.ext - [what changed]

### Features Added/Removed
- [Feature description]

## Current State

### Working
- [What's functional now]

### Known Issues
- [Any problems discovered]

## Next Steps

1. [Recommended next task]
2. [Follow-up work]
```

## Working Conventions

### Code Style

- **No over-engineering** - Make only requested changes
- **Remove unused code** - Delete completely, no backwards-compat hacks
- **Edit over create** - Prefer modifying existing files
- **Document intentionally** - Update docs when structure changes
- **Use existing patterns** - Follow established naming and structure

### Typography System

**Weight Hierarchy:**
- 600 (SemiBold) - Display styles
- 500 (Medium) - Headings & helpers
- 400 (Regular) - Body text

**Class Naming:**
- `.kol-display-*` - Hero/section headings
- `.kol-heading-*` - Content headings
- `.kol-text-*` - Body copy
- `.kol-helper-*` - Labels/metadata

**Size Scale:** xl, lg, md, sm, xs, xxs, xxxs

### CSS Rules

- Use `clamp()` for responsive sizing
- Font-family via CSS variable: `var(--kol-font-family-mono)`
- No duplicate classes - use Tailwind utilities for variants
- Line heights: 100% (display), 110-125% (headings), 150-160% (text)

### Git Workflow

- Only commit when explicitly asked
- Write clear, concise commit messages
- Follow existing commit message style
- Never force push or use destructive commands without permission

## Common Tasks

### Adding a Typography Class

1. Read `design-system/typography/mono/kol-typography-mono.css`
2. Add class in appropriate section (Display/Heading/Text/Helper)
3. Follow existing patterns (clamp, font-family variable, etc.)
4. Update `kol-typography-mono.md` documentation
5. Add to `src/components/styleguide/Typography.jsx` if needed

### Removing a Class

1. Search codebase for usage (use Grep tool)
2. Remove from CSS
3. Remove from documentation
4. Remove from styleguide config
5. Document removal in session log

### Updating Documentation

1. Keep CSS and markdown in sync
2. Update version number if structure changes
3. Provide usage examples
4. Document breaking changes

## Questions?

If unclear about:
- **Project conventions** - Check `AGENT-CONTEXT.md`
- **Recent work** - Read latest session log
- **Technical decisions** - Ask the user before proceeding

## Remember

- Read context before making changes
- Follow established patterns
- Document significant work
- Keep CSS and docs synchronized
- Ask when uncertain
