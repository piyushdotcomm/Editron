# Editron

> A Claude Flow powered project

## Quick Start

### Setup
```bash
npm install && npm run build
```

### Test
```bash
npm test
```

## Agent Behavior

### Code Standards
- Keep files under 500 lines
- No hardcoded secrets or credentials
- Validate input at system boundaries
- Use typed interfaces for public APIs

### File Organization
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation
- `/config` - Configuration files

## Skills

| Skill | Purpose |
|-------|---------|
| `$swarm-orchestration` | Multi-agent coordination for complex tasks |
| `$memory-management` | Pattern storage and semantic search |

## Security Rules

- NEVER commit .env files or secrets
- Always validate user inputs
- Prevent directory traversal attacks
- Use parameterized queries for databases
- Sanitize output to prevent XSS

## Links

- Documentation: https://github.com/ruvnet/claude-flow

## Agent skills

### Issue tracker

Issues live in the repo's GitHub Issues (piyushdotcomm/Editron), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role triage vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
