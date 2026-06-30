# Issue tracker: Local Markdown

All issue tracking for this repo lives as local markdown files — no GitHub, GitLab, or external service.

## Conventions

- One issue per file in `issues/`
- Issue files are named `<number>-<slug>.md`, e.g. `0001-add-user-auth.md`
- The issue number is the file's sequential position (1, 2, 3...)
- Triage status is recorded as a `status:` YAML front-matter field (see `triage-labels.md` for valid values)
- Each issue file contains: front-matter, title, description, acceptance criteria, comments
- All git operations are local only: `commit`, `branch`, `log`, `diff`

## When a skill says "publish to the issue tracker"

Create a new file in `issues/` with sequential numbering. Read `.issues-state.json` for the next available number, or fall back to scanning the directory for the highest existing number.

## When a skill says "fetch the relevant ticket"

Read the file at `issues/<number>-<slug>.md`.

## File format

```yaml
---
number: 0001
title: "Add user authentication"
status: needs-triage
created: 2026-06-05
updated: 2026-06-05
---

# Add user authentication

## Description

[What and why]

## Acceptance Criteria

- [ ] ...
- [ ] ...

## Comments
```

## State tracking

`.issues-state.json` records the next available issue number and the current issue index. Skills should read/write this file atomically when creating or closing issues.
