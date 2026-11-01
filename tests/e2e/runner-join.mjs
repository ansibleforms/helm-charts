// Runs inside the server container of a release: drives the app's side of a Runner installed
// on its own (runner.enabled). Signs in as the admin, then makes a join token, approves a
// runner waiting for an admin, or waits for the runner to show connected under
// Connections > Runners.
//
//   kubectl cp tests/e2e/runner-join.mjs <pod>:/tmp/runner-join.mjs -c server
//   kubectl exec <pod> -c server -- node /tmp/runner-join.mjs jointoken <name>
//   kubectl exec <pod> -c server -- node /tmp/runner-join.mjs approve <runner name>
//   kubectl exec <pod> -c server -- node /tmp/runner-join.mjs connected <runner name>
//
// jointoken prints the token alone on its last line, for the caller to pass as
// runner.joinToken. approve waits for the runner to ask to join, then approves it.
// connected exits 0 once the runner is approved and its socket is open.
const base = `http://127.0.0.1:${process.env.PORT || 80}/api/v2`;
const fail = (message) => { console.error(`::error::${message}`); process.exit(1); };
const [command, name] = process.argv.slice(2);
if (!["jointoken", "approve", "connected"].includes(command) || !name) fail("Usage: runner-join.mjs jointoken|approve|connected <name>");

// ----- Sign in -----
const basic = Buffer.from(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`).toString("base64");
const login = await fetch(`${base}/auth/login`, { method: "POST", headers: { Authorization: `Basic ${basic}` } });
if (!login.ok) fail(`Signing in answered ${login.status}.`);
const { token } = await login.json();
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// ----- A single-use join token, valid for an hour -----
if (command === "jointoken") {
  const res = await fetch(`${base}/runner/jointoken`, {
    method: "POST", headers,
    body: JSON.stringify({ name, expiresInHours: 1, maxUses: 1 }),
  });
  const made = await res.json();
  if (!res.ok || !made.token) fail(`Making a join token answered ${res.status}: ${JSON.stringify(made)}`);
  console.log(made.token);
  process.exit(0);
}

// The runners the app knows, this one among them
const findRunner = async () => {
  const runners = (await (await fetch(`${base}/runner`, { headers })).json()).records || [];
  return runners.find((r) => r.name === name) || null;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ----- A runner waiting for an admin, approved as the admin -----
if (command === "approve") {
  let runner = null;
  for (let i = 0; i < 60 && !Number(runner?.pending); i++) {
    if (i) await sleep(5000);
    runner = await findRunner();
  }
  if (!Number(runner?.pending)) fail(`The runner ${name} never asked to join: ${JSON.stringify(runner)}`);
  console.log(`Runner ${name} waits for approval: approving it`);
  const res = await fetch(`${base}/runner/${runner.id}/approve`, { method: "POST", headers });
  if (!res.ok) fail(`Approving it answered ${res.status}: ${await res.text()}`);
  process.exit(0);
}

// ----- The runner, approved and connected -----
let last = null;
for (let i = 0; i < 60; i++) {
  last = await findRunner();
  if (last?.socket?.connected && !Number(last.pending)) {
    console.log(`Runner ${last.name}: type ${last.type}, mode ${last.rte_mode}, connected to node ${last.socket.node}, RTE ${last.socket.version || "?"}`);
    if (last.rte_mode !== "outbound") fail(`The runner joined in mode ${last.rte_mode}, not outbound: ${JSON.stringify(last)}`);
    process.exit(0);
  }
  await sleep(5000);
}
fail(`The runner ${name} did not show approved and connected within five minutes: ${JSON.stringify(last)}`);
