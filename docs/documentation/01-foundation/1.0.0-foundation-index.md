# 1.0.0 Foundation Index

**Version:** 1.0.0
**Date:** 2025-12-02
**Status:** Active
**Content Type:** reference
**Category:** foundation

---

## Overview

| GitHub | Figma |
|--------|-------|
| [monorepo](https://github.com/Tor-Grimsson/repo-mono) | design file (coming soon) |

This document consolidates the foundational documentation for the kolkrabbi monorepo, covering repository structure, naming conventions, and markdown parsing implementation. This serves as the comprehensive reference for all foundational aspects of the project architecture.

### Foundation Topics

| Number | Title | Focus |
|--------|-------|-------|
| `1.0.0` | Foundation Index (this doc) | Consolidated foundation reference |
| `1.1.0` | Build System | Turborepo, caching, CI |
| `1.2.0` / `1.2.1` | Documentation Layout Evolution | Visual/layout experiments for docs |
| `1.5.0`–`1.5.4` | Navigation System Series | Navbar, footer, sidebar, router, loaders |

---

# Part 1: Repository Structure

## Architecture Principles

### 1. Monorepo Benefits

**Shared Dependencies:**
- Common packages (`ui`, `content`, `fontviewer`) shared across all apps
- Single `yarn.lock` file for all dependencies
- Consistent versions across entire project
- Simplified dependency updates

**Atomic Updates:**
- Update design system once in `packages/ui`, propagates everywhere
- Fix a bug in a shared component, fix applies to all apps
- Maintain consistency across applications automatically

**Build Efficiency:**
- Turborepo caches build artifacts
- Only rebuilds packages that changed
- Parallel builds across the dependency graph
- Incremental builds for faster development

### 2. Ownership Model

**Each package/app is self-contained:**
- Has its own `package.json`
- Defines its own dependencies
- Exports its own public API
- Owns its own build configuration

**Shared packages are universal:**
- `packages/ui` - Can be used by any app
- `packages/content` - Shared TypeScript types
- `packages/fontviewer` - Reusable component

**Apps are specific:**
- `apps/web` - Marketing site and design system showcase
- `apps/studio` - Sanity Studio CMS

---

## Directory Structure

```
kolkrabbi-monorepo/
├── .git/                          # Git version control
├── .turbo/                        # Turborepo cache configuration
├── .yarn/                         # Yarn cache and plugins
├── .yarnrc.yml                    # Yarn configuration
├── package.json                   # Root package.json (workspaces)
├── yarn.lock                      # Dependency lockfile
├── turbo.json                     # Turborepo pipeline config
├── README.md                      # Project overview
│
├── apps/                          # Applications
│   ├── web/                       # Main marketing site
│   │   ├── src/
│   │   │   ├── App.jsx            # Routes and app structure
│   │   │   ├── main.jsx           # React entry point
│   │   │   ├── routes/            # Page components
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Work.jsx
│   │   │   │   ├── Foundry.jsx
│   │   │   │   ├── Stack.jsx
│   │   │   │   ├── Styleguide.jsx
│   │   │   │   └── styleguide/    # Styleguide pages
│   │   │   ├── components/        # React components
│   │   │   │   ├── layout/        # Layout components
│   │   │   │   ├── sections/      # Page sections
│   │   │   │   │   ├── home/      # Home page sections
│   │   │   │   │   ├── work/      # Work page sections
│   │   │   │   │   ├── foundry/   # Foundry page sections
│   │   │   │   │   └── collections/ # Collection sections
│   │   │   │   ├── prose/         # Prose typography components
│   │   │   │   ├── styleguide/    # Styleguide-specific components
│   │   │   │   └── ui/            # UI components (from packages/ui)
│   │   │   ├── data/              # Static data and queries
│   │   │   ├── lib/               # Utilities and clients
│   │   │   │   └── sanityClient.js
│   │   │   └── context/           # React context providers
│   │   ├── public/                # Static assets
│   │   │   ├── svg/               # SVG icons and illustrations
│   │   │   └── fonts/             # Font files
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── studio/                    # Sanity Studio CMS
│       ├── src/
│       │   ├── components/        # Studio custom components
│       │   └── schemas/           # Sanity schema definitions
│       ├── sanity.config.ts       # Sanity configuration
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                      # Shared packages
│   ├── ui/                        # Design system components
│   │   ├── src/
│   │   │   ├── atoms/             # Atomic components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   └── icons/         # Icon SVGs
│   │   │   ├── molecules/         # Molecular components
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Badge.jsx
│   │   │   ├── organisms/         # Organism components
│   │   │   │   └── DataTable.jsx
│   │   │   ├── illustrations/     # Illustration SVGs
│   │   │   │   └── svg/           # Illustration files
│   │   │   └── logos/             # Logomark SVGs
│   │   │       └── svg/           # Logomark files
│   │   ├── css/                   # Design system styles
│   │   │   ├── theme.css          # Design tokens (CSS variables)
│   │   │   ├── components.css     # Component styles
│   │   │   ├── utilities.css      # Utility classes
│   │   │   └── prose.css          # Typography styles
│   │   └── package.json
│   │
│   ├── content/                   # Content types and schemas
│   │   ├── src/
│   │   │   ├── sanity/            # Sanity schema definitions
│   │   │   └── types/             # TypeScript types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── fontviewer/                # Font specimen viewer
│       ├── src/
│       │   └── components/        # Font viewer components
│       ├── package.json
│       └── tsconfig.json
│
└── docs/                          # Documentation
    ├── system/                    # Design system documentation
    │   ├── 0.x.x-metadata-*.md    # Documentation system
    │   ├── 1.x.x-foundation-*.md  # Architecture docs
    │   ├── 2.x.x-design-system-*.md # Design system docs
    │   └── archive/               # Archived/deprecated docs
    ├── archive/                   # Long-term storage
    ├── applications/              # App-specific docs
    ├── blog-posts/                # Blog content
    ├── components/                # Component docs (legacy)
    ├── operations/                # Operational docs
    └── status/                    # Status and roadmap
```

---

## Package Structure

### apps/web (React Application)

**Purpose:** Main marketing website and design system showcase

**Technology Stack:**
- React 19
- Vite (build tool)
- React Router (routing)
- Tailwind CSS v4 (styling)
- Sanity CMS (content management)

**Key Features:**
- Homepage with hero, highlights, and work showcase
- Foundry page for typography demonstrations
- Stack page for technology showcase
- Work portfolio with detail pages
- Styleguide with interactive component demos
- Custom cursor system
- Responsive design (mobile-first)

**Build Configuration:**
```json
{
  "name": "web",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### apps/studio (Sanity Studio)

**Purpose:** Content management interface

**Technology Stack:**
- Sanity Studio
- TypeScript
- GROQ (query language)

**Key Features:**
- Custom schemas for projects, media, settings
- Real-time collaboration
- Media management
- Preview integration

**Build Configuration:**
```json
{
  "name": "studio",
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy"
  }
}
```

### packages/ui (Design System)

**Purpose:** Shared component library and design tokens

**Structure:**
- **Atoms:** Basic building blocks (Button, Input, Icon)
- **Molecules:** Simple combinations (Card, Badge)
- **Organisms:** Complex components (DataTable, Navigation)
- **CSS:** Design tokens and utilities
- **Assets:** SVG illustrations and logomarks

**Atomic Design Methodology:**
```
Atoms → Molecules → Organisms → Templates → Pages
```

**Export Pattern:**
```javascript
// packages/ui/src/index.js
export { Button } from './atoms/Button'
export { Card } from './molecules/Card'
export { DataTable } from './organisms/DataTable'
```

**Import in Apps:**
```javascript
import { Button } from '@kol/ui'
```

### packages/content (Content Types)

**Purpose:** Shared TypeScript types and Sanity schemas

**Contents:**
- TypeScript interfaces for all content types
- Sanity schema definitions
- GROQ query helpers
- Content validation

**Usage:**
```typescript
import { Project } from '@kol/content'

// Type-safe content
const project: Project = {
  title: 'Example',
  slug: 'example',
  // ... other fields
}
```

### packages/fontviewer (Font Specimen)

**Purpose:** Interactive font specimen viewer

**Contents:**
- Font preview components
- Variable font controls
- Type specimen displays
- Font feature toggles

---

## Build System

### Turborepo Configuration

**turbo.json:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**Pipeline Principles:**
- `build` - Depends on dependencies being built first (`^build`)
- `dev` - No caching (always fresh)
- `lint` - No outputs to cache

### Build Scripts

**Root package.json:**
```json
{
  "scripts": {
    "dev:web": "turbo run dev --filter=web",
    "dev:studio": "turbo run dev --filter=studio",
    "build": "turbo run build",
    "lint": "turbo run lint"
  }
}
```

**Usage:**
```bash
# Run web app in development
yarn dev:web

# Run studio in development
yarn dev:studio

# Build all packages and apps
yarn build

# Lint all code
yarn lint
```

### Dependency Management

**Yarn Workspaces:**
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**Adding Dependencies:**
```bash
# Add to specific workspace
yarn workspace web add react-router-dom

# Add to root (if needed for scripts)
yarn add -W turbo

# Add as dev dependency
yarn workspace studio add -D typescript
```

---

## Development Workflow

### Working on Shared Packages

**When to modify `packages/ui`:**
- Adding new design system components
- Updating design tokens
- Creating new utility classes
- Modifying component styles

**Process:**
1. Make changes in `packages/ui/src/`
2. Run `yarn build` to compile package
3. Changes automatically available in all apps
4. No need to publish (local workspace)

**Example:**
```bash
# Add new Button variant
# Edit: packages/ui/src/atoms/Button.jsx
# Build: yarn build
# Use: In apps/web/src/components/
```

### Working on Apps

**When to modify `apps/web`:**
- Building new pages
- Creating page-specific components
- Integrating with Sanity CMS
- Adding route logic

**Process:**
1. Modify components in `apps/web/src/components/`
2. Import from `@kol/ui` for shared components
3. Run `yarn dev:web` to see changes
4. Commit to update design system

### Working on Documentation

**When to modify `docs/`:**
- Adding design system documentation
- Creating component docs
- Writing guides and tutorials
- Capturing architectural decisions

**Process:**
1. Add new docs to `docs/system/`
2. Use M.m.p numbering system (see [0.0.1](0.0.1-metadata-writing-guidelines.md))
3. Update index at [0.0.2](0.0.2-metadata-index.md)
4. Follow writing guidelines

---

# Part 2: Naming Conventions

## File Naming Conventions

### File Extensions

**Use standard extensions:**

| Extension | Purpose | Example |
|-----------|---------|---------|
| `.jsx` | React components | `Button.jsx`, `Home.jsx` |
| `.js` | JavaScript modules, utilities | `utils.js`, `breakpoints.js` |
| `.ts` | TypeScript files | `types.ts`, `sanity.ts` |
| `.tsx` | TypeScript React components | `Component.tsx` |
| `.css` | Stylesheets | `theme.css`, `components.css` |
| `.md` | Markdown documentation | `README.md`, `guide.md` |
| `.json` | JSON data/config | `package.json`, `data.json` |
| `.svg` | Vector graphics | `icon.svg`, `logo.svg` |

### Directory Names

**Always use kebab-case:**

```
✅ Correct:
- components/
- style-guide/
- font-viewer/
- data-tables/
- content-schemas/
- icon-system/

❌ Incorrect:
- components/
- styleGuide/
- fontViewer/
- dataTables/
- contentSchemas/
- iconSystem/
```

### File Names

**JavaScript/TypeScript:**
- PascalCase for components: `Button.jsx`, `HomePage.jsx`
- camelCase for utilities: `breakpoints.js`, `formatDate.ts`
- camelCase for hooks: `useCursor.js`, `useSanity.ts`

**Styles:**
- kebab-case: `button-styles.css`, `color-tokens.css`
- `theme.css` for design tokens
- `components.css` for component styles
- `utilities.css` for utility classes

**Data:**
- camelCase: `breakpoints.js`, `typeScales.js`
- Plural for arrays: `projects.js`, `articles.js`

**Constants:**
- camelCase for filename: `appConstants.js`
- SCREAMING_SNAKE_CASE for exported constants:
  ```javascript
  // appConstants.js
  export const BREAKPOINT_SM = '640px'
  export const BREAKPOINT_MD = '768px'
  export const BREAKPOINT_LG = '1024px'
  ```

---

## Code Naming Conventions

### JavaScript/TypeScript

**Variables and Functions:**
```javascript
// Variables - camelCase
const buttonVariant = 'primary'
const isLoading = false
const projectList = []

// Functions - camelCase
function getProjectById(id) {
  // ...
}

// Boolean variables - use is/has/should prefix
const isVisible = true
const hasError = false
const shouldAnimate = true
```

**Constants:**
```javascript
// Constants - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_ITEMS_PER_PAGE = 20
const DEBOUNCE_DELAY = 300
```

**Classes:**
```javascript
// Classes - PascalCase
class ButtonComponent {
  // ...
}

class DataTable {
  // ...
}
```

**React Components:**
```jsx
// Component names - PascalCase
function Button() {
  return <button>Click me</button>
}

export const Card = () => {
  return <div>Card content</div>
}

// Default export
export default HomePage
```

**Props:**
```jsx
// Props - camelCase
function Button({ variant, size, isDisabled, onClick }) {
  // variant, size, isDisabled, onClick
}
```

**Custom Hooks:**
```javascript
// Hooks - camelCase, start with 'use'
function useCursor() {
  // ...
}

function useSanityQuery(query) {
  // ...
}
```

### CSS

**Class Names:**
```css
/* BEM methodology */

/* Block */
.button { }

/* Element */
.button__icon { }
.button__text { }

/* Modifier */
.button--primary { }
.button--large { }
.button--disabled { }
```

**CSS Custom Properties (Variables):**
```css
/* Design tokens - kebab-case, prefixed with namespace */

:root {
  /* Colors */
  --color-primary: #0066ff;
  --color-text-primary: #1a1a1a;
  --color-background: #ffffff;

  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-body: 16px;
  --font-weight-regular: 400;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-full: 9999px;
}
```

---

## Component Organization

### Atomic Design Naming

**Atoms (Basic components):**
```
packages/ui/src/atoms/
  Button/
    Button.jsx
    Button.css
    index.js
  Input/
    Input.jsx
    Input.css
    index.js
  Icon/
    Icon.jsx
    index.js
    svg/
      check.svg
      close.svg
      arrow.svg
```

**Molecules (Combined atoms):**
```
packages/ui/src/molecules/
  Card/
    Card.jsx
    Card.css
    index.js
  Badge/
    Badge.jsx
    Badge.css
    index.js
```

**Organisms (Complex components):**
```
packages/ui/src/organisms/
  DataTable/
    DataTable.jsx
    DataTable.css
    index.js
  Navigation/
    Navigation.jsx
    Navigation.css
    index.js
```

### Component Export Pattern

```javascript
// packages/ui/src/atoms/Button/index.js
export { default } from './Button'
export { Button } from './Button'
```

```javascript
// packages/ui/src/atoms/Button/Button.jsx
import React from 'react'

export function Button({ children, variant = 'primary' }) {
  return (
    <button className={`button button--${variant}`}>
      {children}
    </button>
  )
}

export default Button
```

---

## Asset Naming

### SVG Icons

**Naming:**
- kebab-case
- Descriptive
- Single word when possible

```
✅ Correct:
- check.svg
- close.svg
- arrow-right.svg
- user-circle.svg
- search.svg

❌ Incorrect:
- checkmark.svg (inconsistent)
- Close.svg (wrong case)
- arrowRight.svg (wrong case)
- userCircle.svg (wrong case)
```

### Logomarks

**Naming:**
- Use descriptive names
- Include format if specific

```
✅ Correct:
- kol-logomark.svg
- web-logomark.svg
- studio-logomark.svg
- foundry-logomark.svg
```

### Fonts

**Naming:**
- Include weight and style
- Use standard font naming conventions

```
✅ Correct:
- Inter-Regular.woff2
- Inter-Bold.woff2
- Inter-Italic.woff2
- SourceCodePro-Regular.woff2
```

### Images

**Naming:**
- kebab-case
- Descriptive of content

```
✅ Correct:
- hero-image.jpg
- project-screenshot.png
- avatar-placeholder.svg
- background-pattern.svg
```

---

## Database/Content Naming

### Sanity Schema Names

**camelCase:**
```javascript
// schemas/project.js
export default {
  name: 'project',  // camelCase
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'projectTitle',
      title: 'Project Title',
      type: 'string'
    },
    {
      name: 'projectSlug',
      title: 'Slug',
      type: 'slug'
    }
  ]
}
```

### GROQ Queries

**camelCase with descriptive names:**
```javascript
// queries/projectQueries.js
export const ALL_PROJECTS_QUERY = `
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description
  }
`

export const PROJECT_BY_SLUG_QUERY = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    content
  }
`
```

---

## URL Naming

### Routes

**kebab-case:**
```javascript
// React Router routes
const routes = [
  { path: '/', component: Home },
  { path: '/work', component: Work },
  { path: '/work/:slug', component: WorkDetail },
  { path: '/foundry', component: Foundry },
  { path: '/stack', component: Stack },
  { path: '/styleguide', component: Styleguide },
  { path: '/styleguide/colors', component: Colors },
  { path: '/styleguide/typography', component: Typography }
]
```

### Slugs

**kebab-case, descriptive:**
```
✅ Correct:
- modern-design-system
- color-system-guide
- typography-best-practices

❌ Incorrect:
- ModernDesignSystem (camelCase)
- ColorSystemGuide (PascalCase)
- TypographyBestPractices (PascalCase)
```

---

## Git Naming

### Branch Names

**kebab-case with type prefix:**

```
Feature branches:
feature/new-button-component
feature/data-table-implementation
feature/color-system-update

Bug fixes:
bugfix/fix-button-hover-state
bugfix/correct-typography-scale

Hotfixes:
hotfix/critical-security-patch
hotfix/urgent-build-error

Documentation:
docs/update-color-documentation
docs/add-button-examples

Refactoring:
refactor/simplify-component-structure
refactor/optimize-build-pipeline
```

### Commit Messages

**Use conventional commits:**

```
type(scope): subject

Types:
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting, etc.)
refactor: Code refactoring
test: Adding tests
chore: Build process or auxiliary tool changes

Examples:
feat(button): Add variant prop for different styles
fix(data-table): Resolve sorting issue on mobile
docs(color-system): Update token documentation
refactor(components): Simplify Button component structure
```

### Tag Names

**Version tags:**
```
v1.0.0
v1.1.0
v2.0.0
```

**Descriptive tags:**
```
release-v1.0.0
milestone-design-system-complete
archive-legacy-docs
```

---

## Quick Reference Table

| Type | Convention | Example |
|------|------------|---------|
| Component file | PascalCase | `Button.jsx` |
| Utility file | camelCase | `breakpoints.js` |
| Directory | kebab-case | `components/` |
| CSS class | BEM | `.button__icon--large` |
| CSS variable | kebab-case with `--kol-` prefix | `--kol-color-primary` |
| React prop | camelCase | `isDisabled` |
| Function | camelCase | `getProjectById` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_ITEMS` |
| SVG file | kebab-case | `chevron-left.svg` |
| Route | kebab-case | `/styleguide/colors` |
| Git branch | kebab-case with type prefix | `feature/new-component` |
| Commit type | lowercase | `feat:` `fix:` `docs:` |
| NPM package | kebab-case with `@kol/` scope | `@kol/ui` |
| Environment var | UPPER_SNAKE_CASE with VITE_ | `VITE_API_URL` |

---

# Part 3: Markdown Parser Implementation

## Overview

The comprehensive markdown parser utility (`parseDocsMarkdown.js`) powers the documentation system's live markdown rendering. The parser supports both block-level and inline markdown elements, enabling rich documentation presentation within the styleguide at `/styleguide/design-system/documentation`.

**Key Features:**
- Full markdown syntax support (H1-H4, lists, code, links, images, etc.)
- Inline token processing (bold, italic, code, links)
- Frontmatter detection and skipping
- Structured output for React rendering
- Shared utility used by multiple components
- Table of contents auto-generation with nested hierarchy

## Context

The parser was created on 2025-11-04 to replace duplicate inline parsing logic in both `Documentations.jsx` and `DocumentationReader.jsx`. The original parsers were basic, supporting only H1/H2 headings and missing inline markdown features (bold, italic, inline code, links).

The existing `docs.css` stylesheet already included styles for H3, H4, strong tags, links, and inline code, but the parser wasn't extracting these elements from markdown. This enhancement bridges that gap.

## Supported Markdown Features

### Block-Level Elements

| Element | Syntax | Output |
|---------|--------|--------|
| H1 Heading | `# Heading` | Title-level heading |
| H2 Heading | `## Heading` | Section heading, creates TOC entry |
| H3 Heading | `### Heading` | Sub-section, nested TOC entry |
| H4 Heading | `#### Heading` | Sub-sub-section, nested TOC entry |
| Paragraph | Plain text | Body text with inline markdown |
| Unordered List | `- Item` or `* Item` | Bulleted list |
| Ordered List | `1. Item` | Numbered list |
| Code Block | ` ```code``` ` | Pre-formatted code |
| Blockquote | `> Quote` | Callout/quote block |
| Horizontal Rule | `---` | Divider |

### Inline Elements

| Element | Syntax | Output |
|---------|--------|--------|
| Bold | `**text**` | Strong emphasis |
| Italic | `*text*` | Emphasis |
| Inline Code | `` `code` `` | Monospace code snippet |
| Link | `[text](url)` | Clickable link |
| Image | `![alt](src)` | Embedded image |

### Special Handling

**Frontmatter:**
- YAML frontmatter between `---` delimiters is detected and skipped
- Allows metadata at document start without rendering

**List Continuity:**
- Consecutive list items of same type are grouped
- Maintains proper nesting structure

**Paragraph Buffering:**
- Multi-line text is joined into single paragraphs
- Empty lines trigger paragraph breaks

## Architecture

### Parser Structure

```
parseDocsMarkdown(markdown)
├── Returns: { sections, toc, introBlocks }
├── sections: Array of H2 sections with nested blocks
├── toc: Array of heading entries with levels
└── introBlocks: Content before first H2
```

### Processing Pipeline

1. **Line-by-line parsing** - Split markdown into lines
2. **State tracking** - Track code blocks, frontmatter, paragraph buffers
3. **Block detection** - Match headings, lists, code fences
4. **Inline processing** - Extract bold, italic, code, links from text
5. **Structure building** - Group blocks into sections
6. **TOC generation** - Extract headings with IDs and levels

### Token-Based Inline Rendering

Inline markdown is converted to tokens during parsing:

```javascript
"This is **bold** and `code`"
// Becomes:
[
  { type: 'text', content: 'This is ' },
  { type: 'bold', content: 'bold' },
  { type: 'text', content: ' and ' },
  { type: 'code', content: 'code' }
]
```

The `renderInlineTokens()` function converts tokens to React elements:

```jsx
renderInlineTokens(tokens) // Returns React elements
```

## Usage

### Basic Usage

```javascript
import { parseDocsMarkdown, renderInlineTokens } from '../../utils/parseDocsMarkdown'

const markdown = `# Title
## Section
This is **bold** and *italic*.
`

const { sections, toc, introBlocks } = parseDocsMarkdown(markdown)
```

### Rendering Parsed Content

```jsx
// Render intro content (before first H2)
{introBlocks.map((block, index) => {
  if (block.type === 'paragraph') {
    return (
      <p key={index}>
        {renderInlineTokens(block.tokens)}
      </p>
    )
  }
})}

// Render sections
{sections.map(({ heading, id, blocks }) => (
  <section key={id} id={id}>
    <h2>{heading}</h2>
    {blocks.map((block, index) => {
      // Render each block type
    })}
  </section>
))}
```

### Table of Contents

The parser auto-generates TOC entries with proper nesting:

```javascript
toc = [
  { id: 'overview', label: 'Overview', level: 2 },
  { id: 'features', label: 'Features', level: 3 },
  { id: 'advanced', label: 'Advanced Features', level: 4 }
]
```

Use the `level` property to indent nested entries:

```jsx
{toc.map((item) => {
  const indent = item.level === 3 ? 'pl-3' : item.level === 4 ? 'pl-6' : ''
  return (
    <li className={indent}>
      <a href={`#${item.id}`}>{item.label}</a>
    </li>
  )
})}
```

## Implementation Details

### File Location

**Primary:**
- `apps/web/src/utils/parseDocsMarkdown.js` - Parser utility

**Consumers:**
- `apps/web/src/routes/styleguide/Documentations.jsx` - Index/browser page
- `apps/web/src/routes/styleguide/DocumentationReader.jsx` - Individual doc reader

### CSS Integration

The parser outputs class names that match `packages/ui/css/docs.css`:

| Block Type | Class Name | CSS Selector |
|------------|------------|--------------|
| Paragraph | (none) | `.docs-article p` |
| H2 | (none) | `.docs-article h2` |
| H3 | (none) | `.docs-article h3` |
| H4 | (none) | `.docs-article h4` |
| List | `docs-list` | `.docs-list` |
| Code Block | `docs-codeblock` | `.docs-codeblock` |
| Blockquote | `docs-callout` | `.docs-callout` |
| Link | `docs-link` | `.docs-article a` |
| Image | `docs-image` | `.docs-image` |

Inline elements use semantic HTML tags styled by docs.css:
- `<strong>` for bold
- `<em>` for italic
- `<code>` for inline code
- `<a>` for links
- `<img>` for images

### Performance Considerations

**Memoization:**
Both consumer components use `useMemo()` to cache parsed results:

```javascript
const { sections, toc } = useMemo(() => {
  if (!rawMarkdown) return { sections: [], toc: [] }
  const parsed = parseDocsMarkdown(rawMarkdown)
  return { sections: parsed.sections, toc: parsed.toc }
}, [rawMarkdown])
```

**Single Pass:**
The parser processes markdown in a single pass, building all structures simultaneously.

**Token Caching:**
Inline tokens are generated during parsing, not during rendering, reducing per-render work.

## Limitations

**Not Supported:**
- Markdown tables (can be added if needed)
- Nested lists (single level only)
- HTML passthrough
- Task lists `- [ ]`
- Definition lists
- Footnotes
- Math expressions

**Regex-Based:**
The inline processor uses regex matching, which has limitations:
- Cannot handle escaped characters (`\*` for literal asterisk)
- May not match complex nested patterns
- Assumes well-formed markdown

**No Validation:**
The parser does not validate markdown syntax - malformed input may produce unexpected output.

## Future Enhancements

**Phase 2 Candidates:**
1. **Table support** - Parse markdown tables into structured data
2. **Nested lists** - Support multi-level list indentation
3. **Task lists** - Render checkboxes for `- [ ]` syntax
4. **Syntax highlighting** - Add language-specific code coloring
5. **Link resolution** - Auto-convert `[M.m.p]` references to doc links

**Phase 3 Candidates:**
1. **Custom containers** - Support `::: warning` style blocks
2. **Frontmatter parsing** - Extract and use metadata
3. **Heading anchors** - Auto-add anchor links to headings
4. **Copy buttons** - Add copy to code blocks
5. **Diff highlighting** - Support `diff` syntax in code blocks

---

## Environment Configuration

### Required Environment Variables

**For apps/web:**
```bash
# .env.local
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=projects
VITE_SANITY_API_TOKEN=your_token
```

**For apps/studio:**
```bash
# .env.local
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=projects
SANITY_STUDIO_API_TOKEN=your_token
```

### Configuration Files

**Vite (apps/web):**
```javascript
// apps/web/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**TypeScript (packages):**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## Deployment

### apps/web (Static Site)

**Deployment:**
- Build with `yarn build`
- Outputs to `apps/web/dist/`
- Deploy to Vercel, Netlify, or static host

**CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn build
      - run: yarn deploy:web
```

### apps/studio (Sanity Studio)

**Deployment:**
- Deploy with `sanity deploy`
- Host on Sanity Managed Studio
- Uses Sanity CLI

### packages (Component Library)

**Distribution:**
- Currently internal only (monorepo)
- Could publish to npm in future
- Use `yarn workspace` for local development

---

## Version Control

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual features
- `hotfix/*` - Production fixes

**Commit Messages:**
```
feat(ui): Add new Button variant
fix(web): Resolve rendering issue
docs(system): Update color documentation
refactor(content): Simplify schema structure
```

### Git Hooks

**Pre-commit:**
- ESLint checks
- Prettier formatting
- Type checking (for TS files)

**Pre-push:**
- Run tests
- Build all packages

---

## Related Documentation

**Foundation:**
- [1.1.0 Foundation: Build System](1.1.0-foundation-build-system.md) - Turborepo and build pipeline

**Design System:**
- [2.0.0 Design System: Overview](2.0.0-design-system-overview.md) - Design system principles

**Metadata:**
- [0.0.0 Documentation System](0.0.0-documentation-index.md) - Documentation architecture
- [0.0.1 Writing Guidelines](0.0.1-metadata-writing-guidelines.md) - How to write docs

---

**Last Updated:** 2025-12-02
