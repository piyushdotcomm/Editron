# Security Policy

## Supported Development Line

Security fixes are expected to target:

- the latest `main` branch

Older snapshots, forks, and stale branches may not receive coordinated fixes.

## Reporting a Vulnerability

Please do not report security vulnerabilities in a public GitHub issue.

Examples of issues that should be reported privately:

- authentication bypass
- authorization flaws
- token or secret exposure
- injection vulnerabilities
- insecure file upload or archive extraction
- path traversal
- privilege escalation
- collaboration-server abuse

## Preferred Reporting Method

Use GitHub's private vulnerability reporting flow if it is enabled for the repository.

If that is not available, contact the maintainer privately through GitHub and include:

- a clear summary
- affected area or file
- steps to reproduce
- impact
- proof of concept, if safe to share
- any suggested mitigation

## What To Expect

Maintainers will try to:

- acknowledge the report
- reproduce the issue
- assess severity and affected scope
- prepare a fix or mitigation
- credit the reporter where appropriate

Response times may vary based on maintainer availability.

## Disclosure Guidelines

Please avoid public disclosure until:

- the issue has been confirmed
- maintainers have had reasonable time to prepare a fix
- users can be given actionable remediation guidance

## Security Expectations For Contributors

When contributing code:

- never commit secrets or `.env` files
- validate input at system boundaries
- avoid weakening auth or access checks
- sanitize file handling and user-controlled paths
- prefer explicit schemas for request validation
- call out security-sensitive changes in your PR description
