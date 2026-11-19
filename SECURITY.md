# Security Policy

## Supported versions

Only the [latest release](https://github.com/Eduardo-Macedo07/voice-modulator/releases/latest) receives fixes.

## Reporting a vulnerability

Please **do not open a public issue with exploit details.**

Use GitHub's private reporting instead: go to the repository's **Security** tab → **Report a vulnerability**.
If that option is not available, open an issue that only says you want to report a security problem
(no details) and a private contact channel will be arranged.

You can expect an answer within a few days. Once a fix is released, the report is credited
(unless you prefer to stay anonymous).

## Scope notes

- All audio processing happens locally; the app does not send audio anywhere.
- Installers are not yet code-signed (see [docs/code-signing-policy.md](docs/code-signing-policy.md)),
  so Windows SmartScreen / Smart App Control warnings are expected for now.
