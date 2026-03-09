# LLM Context Directory

This directory provides context for AI agents working on the Kolkrabbi project.

## Files

### AGENT-CONTEXT.md
Current project state, recent changes, conventions, and key files. **Read this first** when joining the project.

### session-log/
Contains session logs following the LLM Context Protocol. Each log captures the state of work at the end of a session.

**Latest session:** Check the most recent file in `session-log/` for the last known state.

## Usage for AI Agents

When starting work on this project:

1. Read `/LLM_RULES.md` in the project root for onboarding
2. Read `AGENT-CONTEXT.md` for current project state
3. Check the latest session log in `session-log/` for recent context
4. Update session logs when completing significant work

## LLM Context Protocol

Session logs follow a structured format:
- **Session metadata** - Timestamp, agent, summary
- **Changes made** - Files modified, features added
- **Current state** - What works, what's pending
- **Next steps** - Recommended follow-up tasks

This helps maintain continuity across different agents and sessions.
