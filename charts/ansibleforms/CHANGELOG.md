# Changelog

## 7.4.0

AnsibleForms 7.4.0.

### Changed

- **The default image is AnsibleForms 7.4.0**,
  `ghcr.io/ansibleforms/ansibleforms:7.4.0` (the RTE alike), and `appVersion` follows. See the
  [7.4.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/7.4.0).

## 7.3.0

AnsibleForms 7.3.0.

### Added

- **A Runner on its own, `runner.enabled`.** The chart installs only an RTE that dials an
  AnsibleForms app installed elsewhere (`RTE_MODE=outbound`, `runner.appUrl`) and joins it
  as `runner.name`, approved at once with `runner.joinToken` or by an admin under
  Connections > Runners. It renders the `<release>-rte` Deployment, its volume and its keys
  Secret, and no app, database, Service or Ingress. `runner.appTlsVerify: false` accepts the
  app's self-signed certificate.

### Changed

- **The default image is AnsibleForms 7.3.0**,
  `ghcr.io/ansibleforms/ansibleforms:7.3.0` (the RTE alike), and `appVersion` follows. See the
  [7.3.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/7.3.0).
- **The RTE gets no database credentials.** The app dials it on `127.0.0.1` and keeps one
  WebSocket open (`RTE_MODE=inbound`, AnsibleForms 7.3.0): the RTE container no longer gets
  `DB_HOST`, `DB_USER`, `DB_PASSWORD` or `ENCRYPTION_SECRET`, and takes the job's files from
  the shared volume (`RTE_FILES=local`). It no longer gets `RTE_URL` either: the seed holds
  the address, and the RTE has nothing to register.
- **The config seed declares an RTE credential** with the token and the address, and the
  runner signs in with it (`rte_mode: inbound`), as AnsibleForms 7.3.0 expects. Without the
  chart's seed, the RTE no longer adds itself as a runner: add it as the NOTES show.

## 7.2.0

AnsibleForms 7.2.0.

### Changed

- **The default image is AnsibleForms 7.2.0**,
  `ghcr.io/ansibleforms/ansibleforms:7.2.0` (the RTE alike), and `appVersion` follows. See the
  [7.2.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/7.2.0).

## 7.1.0

AnsibleForms 7.1.0.

### Changed

- **The default image is AnsibleForms 7.1.0**,
  `ghcr.io/ansibleforms/ansibleforms:7.1.0` (the RTE alike), and `appVersion` follows. See the
  [7.1.0 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/7.1.0).

## 7.0.3

AnsibleForms 7.0.3.

### Changed

- **The default image is AnsibleForms 7.0.3**,
  `ghcr.io/ansibleforms/ansibleforms:7.0.3` (the RTE alike), and `appVersion` follows. See the
  [7.0.3 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/7.0.3).

## 7.0.2

AnsibleForms 7.0.2.

### Changed

- **The default image is AnsibleForms 7.0.2**,
  `ghcr.io/ansibleforms/ansibleforms:7.0.2` (the RTE alike), and `appVersion` follows. See the
  [7.0.2 release notes](https://github.com/ansibleforms/ansibleforms/releases/tag/7.0.2).

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
  administration. `helm upgrade` reads the user back from the release's Secret, so an
  existing release goes on connecting as root, and so does a database of your own
  (`mysql.enabled: false`) when no user is given. Set `applications.mysql.user: root` to
  choose root on a new install.
- **Rendered without a cluster, an empty `applications.mysql.user` is refused** when the
  chart deploys MySQL. `helm template`, and so Argo CD and Flux, cannot read the Secret
  back: the chart would have guessed `ansibleforms`, a user a 6.x data directory does not
  have. Set it: `root` to keep a 6.x release, `ansibleforms` on a new install.

- **The server probes ask the app's own endpoints**: `/api/v2/ready` for the startup and
  readiness probes, `/api/v2/live` for liveness, instead of `/`. Ready now means the database
  answers and the schema is complete. With `BASE_URL` set the chart puts it in front of the
  probe paths; a `path` of your own that already includes it has to drop it.
- **`containers.server.replicas` is 0 or 1**, and the schema refuses more: each server pod
  runs the whole app and its own RTE on one volume, and the chart does not split the roles.
  `0` now stops the server; it used to render as 1.

### Added

- **An RTE runs next to the app, in the server pod**, from
  `ghcr.io/ansibleforms/ansibleforms-rte-full:7.0.0`. AnsibleForms 7 runs no playbook itself; the
  RTE does. It shares the app's volume and is reached on `127.0.0.1`; no Service publishes
  its port. Settings are under `containers.rte`, and `containers.rte.enabled: false` leaves it out.
- **The RTE is registered as the default runner through a config seed**, a runner named `rte`
  that is read-only in the interface. The RTE gets the same address as `RTE_URL`, so it
  recognises that runner and adds no other. With `containers.rte.seedRunner: false` or a seed
  of your own (`CONFIG_SEED_PATH` set), the RTE adds itself as one runner, `127.0.0.1`, kept
  across restarts; add it to your seed with `token: ${RTE_TOKEN}` to name it yourself.
- **`applications.rte.token`**, the token the app and the RTE share. Left empty, the chart
  generates one into the `<release>-keys` Secret and keeps it across upgrades, or reads it
  from `containers.rte.existingTokenSecret`. Under `helm template` (Argo CD, Flux) it refuses
  to generate one, as `secrets.generate` does: a token made on every sync would leave the
  app and the RTE holding different ones after a restart, and every job refused.
- **The RTE has a startup and a liveness probe** on its `/ready` and `/live`, which need no
  token. The startup budget is 300 seconds, as long as the app's, since on a first install it
  waits for the app to create the schema.
- **`TRUST_PROXY=1` behind the Ingress.** With `ingress.enabled` and a `ClusterIP` Service,
  the app reads the client's address from the controller's `X-Forwarded-For` entry. Without
  it every user shared the controller's address, and the per-address sign-in limits of 7
  (`LOGIN_MAX_FAILURES_PER_IP`, `AUTH_RATE_LIMIT`) held back everybody at once. A
  `TRUST_PROXY` under `applications.server.env` wins.
- **`applications.rte.env`** for what the RTE reads rather than the app, such as `ANSIBLE_PATH`.
- **`ACCESS_TOKEN_SECRET` is set**, generated once into the `<release>-keys` Secret and kept
  across upgrades, so a pod restart no longer signs everybody out. Set
  `applications.server.env.ACCESS_TOKEN_SECRET`, or an entry in `containers.server.extraEnv`,
  to choose it; under `helm template` (Argo CD, Flux) it has to be set.

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
   Python libraries the RTE image lacks, build your own on `ansibleforms-rte-full` or
   `ansibleforms-rte-core` (see the app's [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte)) and set
   `containers.rte.image`.
5. Move the mounts your playbooks read, such as an `ansible.cfg`, roles, collections or a
   custom CA, from `containers.server.extraVolumeMounts` to `containers.rte.extraVolumeMounts`:
   the playbooks run in the RTE container now. `extraVolumes` stays where it is, the pod
   shares it. Keep a CA mount on the server too when the app itself needs it (LDAP, AWX, git repositories).
6. With `NODE_EXTRA_CA_CERTS` under `applications.server.env`, set it under
   `applications.rte.env` as well, pointing at the CA mounted in the RTE container.
7. Launch validation is on: `LAUNCH_VALIDATION` defaults to `enforce` (6.5: `off`). A launch
   through the REST API must also send `rawFormData`, the raw field values, as the browser
   does. Set `LAUNCH_VALIDATION: log` under `applications.server.env` first to see in
   the log what would be refused; `off` restores 6.5's behaviour.
8. An admin who still signs in with the public default password, `AnsibleForms!123`, has to
   choose a new one first: until then every other API call answers 403
   `password_change_required`. Change it before the upgrade, and update the scripts that
   sign in with it.
9. With Argo CD, Flux or anything else that renders with `helm template`, set
   `applications.mysql.user: root` (or the user your release connects as) before the
   upgrade: the chart cannot read it back from the cluster there, and refuses to guess.
   Set `applications.server.env.ACCESS_TOKEN_SECRET` and `applications.rte.token` (or
   `containers.rte.existingTokenSecret`) too, which the chart cannot generate there.
   `helm upgrade` needs none of this.
10. Upgrade the chart. On its first start 7 migrates the database, and the `rte` runner
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
