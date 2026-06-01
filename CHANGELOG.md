# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- CI workflow running lint + tests for both the app and the pipeline.
- Contribution scaffolding: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates.
- ARCHITECTURE.md documenting the repo layout as a reusable skill-project template.
- Scripted dataset enrichment (`scripts/enrich.ts`) using the Anthropic SDK, replacing
  the manual Claude-session procedure while preserving the input-hash incremental cache.

## [0.1.0]

### Added
- Initial release: WCAG 2.2 criterion-explainer skill, hosted demo, and three-phase
  dataset pipeline (fetch / enrich / merge).
