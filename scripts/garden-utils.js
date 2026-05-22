const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { execFileSync, spawn } = require("node:child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PORT = 4321;
const URL = `http://localhost:${PORT}`;
const STATE_DIR = path.join(PROJECT_ROOT, ".garden");
const STATE_FILE = path.join(STATE_DIR, "garden-state.json");
const LOG_FILE = path.join(STATE_DIR, "garden.log");
const ERROR_FILE = path.join(STATE_DIR, "garden.error.log");

function ensureStateDir() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runCommand(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return "";
  }
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function writeState(state) {
  ensureStateDir();
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function removeState() {
  try {
    fs.unlinkSync(STATE_FILE);
  } catch {}
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function getProcessStart(pid) {
  if (!isPidAlive(pid)) {
    return "";
  }

  return runCommand("ps", ["-p", String(pid), "-o", "lstart="]);
}

async function waitForProcessStart(pid, timeoutMs = 1500) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const startedAt = getProcessStart(pid);
    if (startedAt) {
      return startedAt;
    }

    await sleep(100);
  }

  return "";
}

function getCommandLine(pid) {
  if (!isPidAlive(pid)) {
    return "";
  }

  return runCommand("ps", ["-p", String(pid), "-o", "command="]);
}

function getProcessCwd(pid) {
  if (!isPidAlive(pid)) {
    return "";
  }

  const output = runCommand("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"]);
  const cwdLine = output
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("n"));

  return cwdLine ? cwdLine.slice(1) : "";
}

function getPortListenerPid(port = PORT) {
  const output = runCommand("lsof", [
    "-nP",
    `-iTCP:${port}`,
    "-sTCP:LISTEN",
    "-t"
  ]);
  const pid = output.split(/\s+/).find(Boolean);

  return pid ? Number(pid) : null;
}

function isStateManaged(state) {
  if (!state || !Number.isInteger(state.launcherPid) || !state.launcherStart) {
    return false;
  }

  return getProcessStart(state.launcherPid) === state.launcherStart;
}

function isGardenProcess(pid) {
  if (!isPidAlive(pid)) {
    return false;
  }

  const cwd = getProcessCwd(pid);
  if (cwd && path.resolve(cwd) === PROJECT_ROOT) {
    return true;
  }

  const command = getCommandLine(pid);
  return (
    command.includes("AI-Brief-Garden") ||
    command.includes("ai-brief-garden") ||
    command.includes("node_modules/next") ||
    command.includes("next dev")
  );
}

function request(pathname = "/", timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path: pathname,
        timeout: timeoutMs
      },
      (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          if (body.length < 2048) {
            body += chunk;
          }
        });
        res.on("end", () => {
          resolve({
            ok: true,
            statusCode: res.statusCode ?? 0,
            body
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });

    req.on("error", () => {
      resolve({
        ok: false,
        statusCode: 0,
        body: ""
      });
    });
  });
}

async function isGardenAccessible() {
  const response = await request("/");
  return response.ok;
}

async function waitForAccessible(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isGardenAccessible()) {
      return true;
    }

    await sleep(500);
  }

  return false;
}

function openBrowser(url = URL) {
  try {
    const child = spawn("open", [url], {
      detached: true,
      stdio: "ignore"
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function spawnGardenServer(options = {}) {
  ensureStateDir();
  const { hostname } = options;
  const args = ["run", "dev", "--", "-p", String(PORT)];

  if (hostname) {
    args.push("-H", hostname);
  }

  const out = fs.openSync(LOG_FILE, "a");
  const err = fs.openSync(ERROR_FILE, "a");
  const child = spawn("npm", args, {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: ["ignore", out, err],
    env: {
      ...process.env,
      PORT: String(PORT),
      AI_BRIEF_GARDEN_PORT: String(PORT),
      HOSTNAME: hostname || process.env.HOSTNAME || ""
    }
  });

  child.unref();

  return child;
}

async function terminatePid(pid) {
  if (!isPidAlive(pid)) {
    return true;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return false;
  }

  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (!isPidAlive(pid)) {
      return true;
    }

    await sleep(200);
  }

  try {
    process.kill(pid, "SIGKILL");
  } catch {}

  return !isPidAlive(pid);
}

async function terminateProcessGroup(pid) {
  if (!isPidAlive(pid)) {
    return true;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    return false;
  }

  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (!isPidAlive(pid)) {
      return true;
    }

    await sleep(200);
  }

  try {
    process.kill(-pid, "SIGKILL");
  } catch {}

  return !isPidAlive(pid);
}

module.exports = {
  ERROR_FILE,
  LOG_FILE,
  PORT,
  PROJECT_ROOT,
  STATE_FILE,
  URL,
  getCommandLine,
  getPortListenerPid,
  getProcessCwd,
  getProcessStart,
  isGardenAccessible,
  isGardenProcess,
  isPidAlive,
  isStateManaged,
  openBrowser,
  readFileSafe,
  readState,
  removeState,
  request,
  sleep,
  spawnGardenServer,
  terminatePid,
  terminateProcessGroup,
  waitForAccessible,
  waitForProcessStart,
  writeState
};
