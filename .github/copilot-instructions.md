# GitHub Copilot instructions

## Workspace overview
This repository is a small Node.js backend project with a single `package.json` file. There is no source code, tests, or documentation present in the workspace at this time.

## What Copilot should know
- The project is a Node.js CommonJS application (`"type": "commonjs"`).
- There are no build, lint, or test tools configured beyond the default `test` script placeholder.
- New code should be added conservatively, with user confirmation for framework or dependency choices.
- If asked to implement features, first determine whether the user wants scaffolding for an Express/Koa/Fastify API, raw Node HTTP server, or another backend style.

## Suggested behavior
- Prefer small, incremental changes and request clarification when the requested task is underspecified.
- When creating new files, keep the structure simple and consistent with Node.js backend conventions.
- If the workspace lacks the requested files or dependencies, explicitly mention that and offer to scaffold them.

## Example prompt styles
- "Scaffold a REST API with Express and recommended folder layout."
- "Add a task management endpoint and include route validation."
- "Create a simple project structure for a Node.js backend with start and test scripts."

## Notes
- There is no existing documentation to link against, so keep instructions self-contained and minimal.
- If the user asks to add tests or tooling, propose specific packages and scripts before adding them.
