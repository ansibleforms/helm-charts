<!--
The TITLE must be a Conventional Commit - `fix: ...`, `feat: ...` - because it becomes the
squash commit. See CONTRIBUTING.md.
-->

## What this changes

<!-- One or two sentences. If it follows an AnsibleForms change, link that pull request. -->

## Checklist

- [ ] Branch is named `<type>/<description>` and the title is a Conventional Commit
- [ ] If the chart itself changed (`Chart.yaml`, `values.yaml`, `templates/`, `files/`): `CHANGELOG.md` has an entry under `## Unreleased`
- [ ] If a value or its `# --` comment changed: `VALUES.md` is regenerated with helm-docs
