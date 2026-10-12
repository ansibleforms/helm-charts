# Changelog

## 7.0.0

AnsibleForms 7.

### Changed

- **The default image is AnsibleForms 7, `ghcr.io/ansibleforms/ansibleforms:7.0.0`**
  (`appVersion` follows). 7 removes everything 6.x marked as deprecated; read
  [Upgrading to 7](https://ansibleforms.com/upgrade-7) before you upgrade.
- **`forms.configMap` mounts `config.yaml` instead of `forms.yaml`.** The defaults are now
  `key: config.yaml` and `mountPath: /app/dist/persistent/config.yaml`. 7 reads
  categories, roles and constants from `config.yaml` and the forms only from the forms
  folder: ship them through `forms.extraFormsConfigMap`, one or more forms per key. A
  `forms:` section in `config.yaml` is an error in 7.
- **`ALLOW_ENV_EDIT: 0` is set by default.** The settings pages show every environment
  variable read-only instead of saving changes to a `.env` file on the volume, which would
  override these values on every restart. Set it to `1` under `applications.server.env` to
  allow edits again.
- **The chart's maintainer is the [ansibleforms](https://github.com/ansibleforms) organization**,
  as shown on Artifact Hub and by `helm show chart`.
- **A new install connects to the bundled MySQL as `ansibleforms`, not root.** With
  `applications.mysql.user` left empty, the bundled MySQL creates that user with rights on
  the AnsibleForms schema only, and root stays on localhost for the server's own
  administration. An upgrade keeps the user its Secret already holds, so an existing
  release goes on connecting as root, and so does a database of your own
  (`mysql.enabled: false`) when no user is given. Set `applications.mysql.user: root` to
  choose root on a new install.

### Added

- **An RTE runs next to the app, in the server pod**, from
  `ghcr.io/ansibleforms/ansibleforms-rte-full:7.0.0`. AnsibleForms 7 runs no playbook itself; the
  RTE does. It shares the app's volume and is reached on `127.0.0.1`, so nothing new is
  published. Settings are under `containers.rte`, and `containers.rte.enabled: false` leaves it out.
- **The RTE is registered as the default runner through a config seed**, a runner named `rte`
  that is read-only in the interface. The RTE gets the same address as `RTE_URL`, so it
  recognises that runner and adds no other. With `containers.rte.seedRunner: false` or a seed
  of your own (`CONFIG_SEED_PATH` set), the RTE adds itself as one runner, `127.0.0.1`, kept
  across restarts; add it to your seed with `token: ${RTE_TOKEN}` to name it yourself.
- **`applications.rte.token`**, the token the app and the RTE share. Left empty, the chart
  generates one into the `<release>-keys` Secret and keeps it across upgrades, or reads it
  from `containers.rte.existingTokenSecret`.
- **`applications.rte.env`** for what the RTE reads rather than the app, such as `ANSIBLE_PATH`.
- **`ACCESS_TOKEN_SECRET` is set**, generated once into the `<release>-keys` Secret and kept
  across upgrades, so a pod restart no longer signs everybody out. Set
  `applications.server.env.ACCESS_TOKEN_SECRET` to choose it.

### Removed

- **`files/schema.sql`, and the schema in the bundled MySQL's init script.** AnsibleForms 7
  creates its schema on an empty database by itself, and migrates an existing one forward.
  A database you run yourself needs nothing applied beforehand any more.

### Upgrading from 6.x

1. Be on AnsibleForms 6.5 first (chart 6.5.x), and take a backup (**Settings > Backups**).
2. Follow [Upgrading to 7](https://ansibleforms.com/upgrade-7) while still on 6.5: rename
   `forms.yaml` to `config.yaml`, move every form into a file of its own, replace `table`
   fields, and drop the removed environment variables.
3. If you mount the base configuration from a ConfigMap, rename its key to `config.yaml`
   and point `forms.configMap.key` at it (or take the new defaults). Move the forms into
   the ConfigMap behind `forms.extraFormsConfigMap`.
4. Move `ANSIBLE_PATH` and `PROCESS_MAX_BUFFER`, if `applications.server.env` sets them, to
   `applications.rte.env`: the RTE reads them now. If your playbooks need collections or
   Python libraries the RTE image lacks, build your own from the app's `Dockerfile.rte` and
   set `containers.rte.image`.
5. Upgrade the chart. On its first start 7 migrates the database, and the `rte` runner
   appears as the default under Connections > Runners.

To stay on 6, pin the chart: `--version "~6"`.

## 6.5.5

AnsibleForms 6.5.5.

### Changed

- **The default image is AnsibleForms 6.5.5**,
  `ghcr.io/ansibleforms/ansibleforms:6.5.5`, and `appVersion` follows. See the
  [6.5.5 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.5.5).

## 6.5.4

AnsibleForms 6.5.4.

### Changed

- **The default image is AnsibleForms 6.5.4**,
  `ghcr.io/ansibleforms/ansibleforms:6.5.4`, and `appVersion` follows. See the
  [6.5.4 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.5.4).

## 6.5.3

AnsibleForms 6.5.3.

### Changed

- **The default image is AnsibleForms 6.5.3**,
  `ghcr.io/ansibleforms/ansibleforms:6.5.3`, and `appVersion` follows. See the
  [6.5.3 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.5.3).

## 6.5.2

AnsibleForms 6.5.2.

### Changed

- **The default image is AnsibleForms 6.5.2**,
  `ghcr.io/ansibleforms/ansibleforms:6.5.2`, and `appVersion` follows. See the
  [6.5.2 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.5.2).

## 6.5.1

AnsibleForms 6.5.1.

### Changed

- **The default image is AnsibleForms 6.5.1**,
  `ghcr.io/ansibleforms/ansibleforms:6.5.1`, and `appVersion` follows. See the
  [6.5.1 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.5.1).

## 6.5.0

AnsibleForms 6.5.0.

### Changed

- **The default image is AnsibleForms 6.5.0**,
  `ghcr.io/ansibleforms/ansibleforms:6.5.0`, and `appVersion` follows. See the
  [6.5.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.5.0).

## 6.4.1

AnsibleForms 6.4.1.

### Changed

- **The default image is AnsibleForms 6.4.1**,
  `ghcr.io/ansibleforms/ansibleforms:6.4.1`, and `appVersion` follows. See the
  [6.4.1 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.4.1).

## 6.4.0

AnsibleForms 6.4.0.

### Changed

- **The default image is AnsibleForms 6.4.0**,
  `ghcr.io/ansibleforms/ansibleforms:6.4.0`, and `appVersion` follows. See the
  [6.4.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.4.0).

## 6.3.1

AnsibleForms 6.3.1.

### Changed

- **The default image is AnsibleForms 6.3.1**,
  `ghcr.io/ansibleforms/ansibleforms:6.3.1`, and `appVersion` follows. See the
  [6.3.1 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.3.1).

## 6.3.0

AnsibleForms 6.3.0.

### Changed

- **The default image is AnsibleForms 6.3.0**,
  `ghcr.io/ansibleforms/ansibleforms:6.3.0`, and `appVersion` follows. See the
  [6.3.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.3.0).

## 6.2.1

AnsibleForms 6.2.1.

### Changed

- **The default image is AnsibleForms 6.2.1**,
  `ghcr.io/ansibleforms/ansibleforms:6.2.1`, and `appVersion` follows. See the
  [6.2.1 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.2.1).

## 6.2.0

AnsibleForms 6.2.0.

### Changed

- **The default image is AnsibleForms 6.2.0**,
  `ghcr.io/ansibleforms/ansibleforms:6.2.0`, and `appVersion` follows. See the
  [6.2.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.2.0).

## 6.1.5

AnsibleForms 6.1.5.

### Changed

- **The default image is AnsibleForms 6.1.5**,
  `ghcr.io/ansibleforms/ansibleforms:6.1.5`, and `appVersion` follows. See the
  [6.1.5 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.1.5).

## 6.1.4

AnsibleForms 6.1.4.

### Changed

- **The default image is AnsibleForms 6.1.4**,
  `ghcr.io/ansibleforms/ansibleforms:6.1.4`, and `appVersion` follows. See the
  [6.1.4 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.1.4).

## 6.1.2

AnsibleForms 6.1.2.

### Changed

- **The default image is AnsibleForms 6.1.2**,
  `ghcr.io/ansibleforms/ansibleforms:6.1.2`, and `appVersion` follows. See the
  [6.1.2 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.1.2).

## 6.1.0

AnsibleForms 6.1.0.

### Changed

- **The default image is AnsibleForms 6.1.0**,
  `ghcr.io/ansibleforms/ansibleforms:6.1.0`, and `appVersion` follows. See the
  [6.1.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.1.0).

## 6.0.2

AnsibleForms 6.0.2.

### Changed

- **The default image is AnsibleForms 6.0.2**,
  `ghcr.io/ansibleforms/ansibleforms:6.0.2`, and `appVersion` follows. See the
  [6.0.2 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/6.0.2).

## 6.0.0

AnsibleForms 6.0.0, and the first release of the chart. From here on the chart version is
the AnsibleForms version it installs.

### Added

- **The server and a bundled MySQL**, each with its own PersistentVolumeClaim, a Service, and
  an optional Ingress with HTTP or HTTPS. `files/schema.sql` creates the base schema on the
  first start.
- **Credentials from a Secret**: the chart's own `<release>-secrets`, one you manage
  (`secrets.existingSecret`), or values the chart generates and keeps across upgrades
  (`secrets.generate`). It refuses to render the placeholder passwords from `values.yaml`.
- **A database of your own** with `mysql.enabled: false` and `applications.mysql.host`.
- **The restricted Pod Security Standard**: both pods run as a pinned non-root user with
  `fsGroup` owning their volumes, and no root init container.
- **Health checks** on both components, with a startup probe that holds the liveness probe
  back while the database initialises.
- **`networkPolicy.enabled`**: only the server may open a connection to the bundled MySQL.
- **Rollout checksums**: changing the Secret or `mysql.config` restarts what reads it, and
  `rollOnChange.external` does the same for objects the chart does not own.
- **Scheduling and metadata** on both components: `nodeSelector`, `tolerations`, `affinity`,
  `topologySpreadConstraints`, `imagePullSecrets`, `commonLabels`, `commonAnnotations`,
  `podLabels`, `podAnnotations`, `extraEnv`, `extraEnvFrom`, `extraVolumes` and service
  annotations.
- **`values.schema.json`**, a `NOTES.txt` and a `helm test` that fetches the front page and
  checks the database answers.
- **Forms and `custom.js` from ConfigMaps** (`forms.configMap`, `forms.extraFormsConfigMap`, `forms.customJs`).

### Upgrading from the chart in the repository before its first release

The chart was installed from a clone before it was released. Coming from there:

- **Four resources are renamed**: `server`, `mysql`, `mysql-my-cnf` and `mysql-init-script`
  become `<release>-server`, `<release>-mysql`, `<release>-mysql-my-cnf` and
  `<release>-mysql-init`. Helm creates the new ones and removes the old, which rolls both
  pods once. The Secret, the Ingress and both PersistentVolumeClaims keep their names, so
  no storage is touched.
- **`applications.mysql.host` defaults to `<release>-mysql`** instead of the literal `mysql`.
- **Selectors change**: anything selecting on `app.kubernetes.io/name: server` or
  `name: mysql` needs `app.kubernetes.io/component: server` or `component: database`.
- **`mysql_deployment.enabled` is now `mysql.enabled`.**
- **The `prepare-persistent-volume` init container is gone**; delete it from a copy of
  `values.yaml` you keep. If your storage ignores `fsGroup` (NFS with `root_squash`), set
  `containers.<component>.podSecurityContext` and `securityContext` to `null` and put it back.
- **The server's update strategy is `Recreate`**, since the volume is ReadWriteOnce.
