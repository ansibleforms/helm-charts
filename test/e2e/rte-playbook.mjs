// Runs inside the server container of a release: proves a playbook form really runs on the
// RTE the chart puts in the pod. It writes a form and a playbook to the shared volume, signs
// in as the admin, checks the runner the chart's seed registered, launches the form and
// waits for the job. The output must come back from the RTE.
//
//   kubectl cp test/e2e/rte-playbook.mjs <pod>:/tmp/rte-playbook.mjs -c server
//   kubectl exec <pod> -c server -- node /tmp/rte-playbook.mjs
import fs from "fs";

const persistent = "/app/dist/persistent";
const base = `http://127.0.0.1:${process.env.PORT || 80}/api/v2`;
const fail = (message) => { console.error(`::error::${message}`); process.exit(1); };

// ----- A form and its playbook, on the volume the app and the RTE share -----
fs.mkdirSync(`${persistent}/forms`, { recursive: true });
fs.mkdirSync(`${persistent}/playbooks`, { recursive: true });
fs.writeFileSync(`${persistent}/forms/ci-rte.yaml`, `- name: CI RTE
  roles: [public]
  categories: [Default]
  description: Runs a playbook on the RTE
  playbook: ci-rte.yaml
  type: ansible
  fields:
    - type: text
      name: greeting
      label: Greeting
`);
fs.writeFileSync(`${persistent}/playbooks/ci-rte.yaml`, `- hosts: localhost
  gather_facts: false
  tasks:
    - ansible.builtin.debug:
        msg: "RTE says {{ greeting }}"
`);

// ----- Sign in -----
const basic = Buffer.from(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`).toString("base64");
const login = await fetch(`${base}/auth/login`, { method: "POST", headers: { Authorization: `Basic ${basic}` } });
if (!login.ok) fail(`Signing in answered ${login.status}.`);
const { token } = await login.json();
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// ----- The runner the chart's seed registered, and the app reaching it -----
const runners = (await (await fetch(`${base}/runner`, { headers })).json()).records || [];
const rte = runners.find((r) => r.type === "rte" && r.is_default);
if (!rte) fail(`No default runner of type rte. Runners: ${JSON.stringify(runners)}`);
console.log(`Runner ${rte.name}, mode ${rte.rte_mode}, credential ${rte.credential}, managed: ${rte.managed}`);
// the chart's seed declares it inbound, signing in with an RTE credential : not a 7.2
// database-mode runner carrying its own uri and token
if (rte.rte_mode !== "inbound") fail(`The runner is in mode ${rte.rte_mode}, not inbound: ${JSON.stringify(rte)}`);
if (!rte.credential) fail(`The runner names no credential: ${JSON.stringify(rte)}`);
const check = await fetch(`${base}/runner/${rte.id}/check`, { method: "POST", headers });
const checked = await check.json();
if (!check.ok) fail(`Test connection failed: ${JSON.stringify(checked)}`);
console.log(`Test connection: ${JSON.stringify(checked.details)}`);

// ----- Launch the form and wait for the job -----
// rawFormData too, the raw field values, as the browser sends them : with LAUNCH_VALIDATION
// at its default, enforce, a launch without it is refused with a 422
const launch = await fetch(`${base}/job`, {
  method: "POST", headers,
  body: JSON.stringify({
    formName: "CI RTE",
    extravars: { greeting: "hello-from-ci" },
    rawFormData: { greeting: "hello-from-ci" },
  }),
});
const launched = await launch.json();
if (!launch.ok || !launched.id) fail(`Launching the form answered ${launch.status}: ${JSON.stringify(launched)}`);

for (let i = 0; i < 90; i++) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const job = await (await fetch(`${base}/job/${launched.id}`, { headers })).json();
  if (["running", "approve"].includes(job.status)) continue;
  const output = String(job.output || "");
  console.log(`Job ${launched.id} ended ${job.status}`);
  if (job.status !== "success") fail(`The playbook job ended ${job.status}:\n${output}`);
  if (!output.includes("Running on RTE")) fail(`The job did not run on the RTE:\n${output}`);
  if (!output.includes("(inbound)")) fail(`The job did not go over the inbound socket:\n${output}`);
  if (!output.includes("RTE says hello-from-ci")) fail(`The playbook output is missing:\n${output}`);
  console.log("The playbook ran on the RTE.");
  process.exit(0);
}
fail(`Job ${launched.id} was still running after three minutes.`);
