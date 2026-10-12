# AnsibleForms Helm charts

[![CI](https://img.shields.io/github/actions/workflow/status/ansibleforms/helm-charts/ci.yaml?branch=main&label=CI)](https://github.com/ansibleforms/helm-charts/actions/workflows/ci.yaml)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/ansibleforms)](https://artifacthub.io/packages/search?repo=ansibleforms)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-ansibleforms.com-informational)](https://ansibleforms.com)

The Helm chart that runs [AnsibleForms](https://github.com/ansibleforms/ansibleforms) and its MySQL database on Kubernetes,
installed and upgraded on a real cluster on every change. Documentation: [ansibleforms.com](https://ansibleforms.com/installation).

## Charts

| Chart | Description |
|---|---|
| [ansibleforms](charts/ansibleforms) | AnsibleForms and its MySQL database |

## Installing

The chart is published to a Helm repository and to the GitHub Container Registry as an OCI artifact.
Add the repository and write the default values to a file you can edit:

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

Or install from the OCI registry: `oci://ghcr.io/ansibleforms/charts/ansibleforms`. The [chart's README](charts/ansibleforms/README.md)
covers storage, ingress, credentials and upgrades, and [VALUES.md](charts/ansibleforms/VALUES.md) lists every value with its default.

## Versions

Each chart version installs the AnsibleForms release of the same number: chart 7.0.0 deploys AnsibleForms 7.0.0.

| Charts | Status |
|---|---|
| 7.x, from `main` | Released with every AnsibleForms 7 release |
| 6.0.0 to 6.5.5 | Final: published and installable, no further 6.x releases |

## Contributing

Contributions are welcome. Start with these files:

- [CONTRIBUTING.md](CONTRIBUTING.md): the local checks, what CI runs and how a release is cut
- [CHANGELOG.md](charts/ansibleforms/CHANGELOG.md): the changes in every chart release
- [SECURITY.md](SECURITY.md): how to report a security issue

## License

[GPL-3.0](LICENSE).
