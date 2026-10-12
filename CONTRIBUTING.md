# Contributing

## Running the checks locally

Everything CI does can be run before pushing:

```bash
pip install yamllint
yamllint --strict .

cd charts/ansibleforms
helm lint . --strict
for f in ci/*-values.yaml ../../test/values/*-values.yaml; do
  helm lint . --strict --values "$f"
  helm template ansibleforms . --values "$f" | kubeconform -strict -summary
done
```

The chart is in `charts/ansibleforms`. Its `ci/*-values.yaml` are the scenarios `ct` installs on a kind cluster.
`test/values/*-values.yaml` are mostly render-only, for combinations that cannot
be installed unattended or that only exist to prove a manifest is shaped right.
Some of them are driven by hand from the workflow: the two `ingress-*` files are
installed behind a real controller, and `minimal-mysql` exists to prove the
chart still renders with its values cleared.

## Documenting a value

Every value carries a one-line `# --` comment directly above it, which
[helm-docs](https://github.com/norwoodj/helm-docs) turns into
`charts/ansibleforms/VALUES.md`. Section banners in values.yaml use `# ===`, because a line
starting with `# --` is read as a description. After changing a value or its comment,
regenerate the file:

```bash
helm-docs --chart-search-root charts --template-files VALUES.md.gotmpl \
  --output-file VALUES.md --ignore-non-descriptions
```

CI fails when VALUES.md does not match values.yaml.

## What CI checks

Four jobs, three of which need a cluster:

**Lint and render.** yamllint, `helm lint` on every values file, and `helm
template` plus `kubeconform -strict` across four Kubernetes versions. On top of
that a few assertions that rendering alone would not make:

- the chart refuses to write the placeholder credentials into a real Secret
- every Ingress backend resolves to a port its Service actually publishes,
  followed the way a controller would follow it
- every scheduling value comes out in the pod spec unchanged, `commonLabels` and
  `commonAnnotations` reach every object, and neither reaches a selector, which
  is immutable
- the MySQL probes exist and none of them carries a credential
- the chart version moved, if anything under `Chart.yaml`, `values.yaml`,
  `templates/` or `files/` (if it has one) of `charts/ansibleforms` did
- the two security context combinations that cannot work are still refused, and
  the message still names the value to change

`values.schema.json` is checked by Helm itself on every render and every
install, so a wrong type or a misspelled top level key fails before anything
reaches a cluster. It is deliberately strict at the top level and permissive
below it: a misspelling at the top is silent and sometimes dangerous, while a
stray key further down is usually someone's own leftover and should not block
their upgrade.

**Install on kind.** Runs three times, on Kubernetes 1.31, 1.33 and 1.35.
Rendering and installing catch different things: `kubeconform` reads a schema,
while an install is where a probe, a security context or a storage default meets
an actual kubelet. Each run does `ct install` for the `ci/` scenarios, which
also runs `helm test` after each one, plus the cases a values file alone cannot
describe: a Secret managed outside the chart, a database the chart does not
manage, two releases side by side in one namespace, and an install into a
namespace enforcing the restricted Pod Security Standard.

**Upgrade a live release.** Installs the newest published chart, writes a row
into the database and a file onto the server's volume, upgrades to the branch,
and checks that every claim still points at the same volume and that both
markers are still there. This is the one that catches a renamed
PersistentVolumeClaim, which every other check in the file would happily let
through: a renamed claim is an empty volume with the old one deleted underneath
it.

It then runs the same upgrade a second time and compares the pod names, because
a rollout checksum that moves when nothing changed would churn both pods on
every release. Finally it rolls the release back to the published version it
started from and checks the storage and the data again, walking the whole change
backwards.

**Enforce the NetworkPolicy.** kind ships kindnet, which does not enforce
NetworkPolicy, so this job turns the default CNI off and installs Calico. It
shows an unrelated pod reaching MySQL before the policy is on and not after,
checking the baseline first so a run where nothing could reach the database
anyway fails rather than quietly proving nothing.

**Route through a real ingress controller.** kind ships without one, so the
Ingress used to be rendered, validated and never asked for a single page. This
installs ingress-nginx and fetches the application through it, both plain and
with the application terminating TLS itself. That second case is where a port
bug once lived: a manifest that validates perfectly and that no controller can
route.

To try a real install:

```bash
helm upgrade --install test charts/ansibleforms \
  --namespace ansibleforms-test --create-namespace \
  --values charts/ansibleforms/ci/default-values.yaml --wait
```

## Cutting a release

The chart is versioned with AnsibleForms: chart 7.0.0 is the chart for AnsibleForms
7.0.0, and `version` and `appVersion` in `charts/ansibleforms/Chart.yaml` are always
the same (CI refuses a pull request where they differ). A release is the *Follow app
release* pull request moving both to a new AnsibleForms version. Once it is merged,
the release workflow tags the version, attaches the packaged chart to a GitHub
release, pushes it to GHCR as an OCI artifact and asks ansibleforms.com to rebuild,
which serves the Helm repository at `https://ansibleforms.com/helm-charts/`.

It runs after CI, not alongside it, and does nothing unless CI finished green,
so a failing build cannot publish. Merging with a version that already has a tag
is a no-op, which is what makes it safe to leave running on every push. To
rebuild the Helm repository index without releasing anything, run the workflow
by hand from the Actions tab.

A change to the chart itself (`Chart.yaml`, `values.yaml`, `templates/` or `files/`)
keeps the version and goes out with the next AnsibleForms release. Say what it does
under `## Unreleased` at the top of `charts/ansibleforms/CHANGELOG.md`; CI refuses a
chart change without that entry, so nothing waits unnoticed. Anything that renames a
resource, removes a value or forces an existing Deployment to be recreated belongs
there with the steps an operator has to take. Changes that do not reach the packaged
chart, to CI, to `test/` or to the documentation, need no entry; the chart's `ci/` is
in its `.helmignore`, and `test/` sits outside the chart altogether.

## Following app releases

An app release sends an `app-release` dispatch here, and the *Follow app release*
workflow opens a pull request on the line of that major (`main`, or
`release/<major>.x`) that moves the default image, `version`, `appVersion` and the
Artifact Hub images annotation to the release, and turns `## Unreleased` into that
version's changelog entry. It merges itself once **CI passed** is green, and the
release workflow publishes the chart. A new major version opens an issue instead,
because moving the chart across a major takes real work. To catch up on a release
by hand: Actions → *Follow app release* → Run workflow, with the version.

## AnsibleForms 6

The 6.x charts, 6.0.0 to 6.5.5, are final: they stay published and installable, and no
further 6.x chart is released. Their source is in the history of `main`, at the `v6.x.y`
tags. Users stay on 6 by pinning the chart: `--version "~6"`.

## Repository settings this depends on

The automatic `GITHUB_TOKEN` covers the GitHub release and the push to GHCR.

The website rebuild needs the `ansibleforms-release` GitHub App installed on this
repository, the App's client ID as the `RELEASE_APP_CLIENT_ID` repository variable and its private key as
the `RELEASE_APP_PRIVATE_KEY` secret. Without them the release and the OCI artifact still go
out, the rebuild job says so in its run summary, and ansibleforms.com picks the release up
on its nightly build.

The GHCR package needs nothing. Pushed from Actions it is linked to the
repository and inherits its visibility, so on a public repository it can be
pulled anonymously right after the first release.
