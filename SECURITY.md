# Security Policy

## Reporting a vulnerability

Please report security issues privately by emailing **patricia.goh@ada.support**
with the details and steps to reproduce. Do not open a public issue for security
reports. You can expect an acknowledgement within a few business days.

## Scope

This project ships a static React app and a build-time dataset pipeline. There is no
server component and no user data is collected by the app.

## Secrets

No secrets are stored in this repository. The dataset enrichment step
(`scripts/enrich.ts`) reads an `ANTHROPIC_API_KEY` from the environment at run time
only; it is never committed. Do not paste API keys into issues, PRs, or code.

## Supported versions

The latest `main` is the only supported version.
