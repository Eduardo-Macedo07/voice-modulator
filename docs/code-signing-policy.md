# Code signing policy

> **Status: draft.** Voice Modulator releases are **not code-signed yet**. This policy describes how signing will work once a free open-source signing certificate is in place. It does not mean a certificate has been issued.

## Scope

Only official Windows installers built by the project's GitHub Actions workflow ([`release.yml`](../.github/workflows/release.yml)) from a `v*` tag of this repository are eligible for signing. Binaries built anywhere else are never submitted for signing.

## Roles

| Role | Who | Responsibility |
| --- | --- | --- |
| Author | Eduardo Macedo ([@Eduardo-Macedo07](https://github.com/Eduardo-Macedo07)) | Writes the code that goes into a release |
| Reviewer | Eduardo Macedo | Reviews changes before they are merged |
| Approver | Eduardo Macedo | Manually approves every signing request |

The project currently has a single maintainer who holds all three roles. Other members will be listed here if they join. Everyone with access to the repository or the signing service must use multi-factor authentication.

## Build and release process

1. Changes land on `main`; CI runs the type check and tests.
2. The maintainer pushes a `v*` tag.
3. GitHub Actions builds the installer on a GitHub-hosted runner, directly from the tagged source in this repository.
4. The maintainer manually approves the signing request for that release.
5. The signed installer is attached to the GitHub Release.

## Privacy

Voice Modulator processes audio on your computer only. It does not collect telemetry or send any data over the network. The only external link is the VB-Cable download page, which opens in your browser when you click it.

## Contact

Open an issue at https://github.com/Eduardo-Macedo07/voice-modulator/issues.
