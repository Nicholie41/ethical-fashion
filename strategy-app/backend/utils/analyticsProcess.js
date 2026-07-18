const { spawn } = require("child_process");
const path = require("path");

const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://localhost:5001";
const ANALYTICS_DIR = path.resolve(__dirname, "../../python-analytics");
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

let analyticsChild = null;

function shouldManageAnalyticsLocally() {
  if (process.env.START_ANALYTICS === "false") {
    return false;
  }

  try {
    const { hostname } = new URL(ANALYTICS_URL);
    return LOCAL_HOSTS.has(hostname);
  } catch (_error) {
    return false;
  }
}

async function isAnalyticsHealthy() {
  try {
    const response = await fetch(`${ANALYTICS_URL}/health`);
    return response.ok;
  } catch (_error) {
    return false;
  }
}

function resolvePythonCommand() {
  if (process.env.PYTHON_PATH) {
    return process.env.PYTHON_PATH;
  }

  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const candidates = [
        path.join(localAppData, "Programs", "Python", "Python312", "python.exe"),
        path.join(localAppData, "Programs", "Python", "Python311", "python.exe")
      ];
      for (const candidate of candidates) {
        try {
          require("fs").accessSync(candidate);
          return candidate;
        } catch (_error) {
          // try next candidate
        }
      }
    }
    return "python";
  }

  return "python3";
}

function stopAnalyticsProcess() {
  if (!analyticsChild || analyticsChild.killed) {
    return;
  }

  analyticsChild.kill();
  analyticsChild = null;
}

function startAnalyticsProcess() {
  const pythonCmd = resolvePythonCommand();
  analyticsChild = spawn(pythonCmd, ["app.py"], {
    cwd: ANALYTICS_DIR,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32" && pythonCmd === "python"
  });

  analyticsChild.on("error", (error) => {
    console.error("Failed to start Python analytics:", error.message);
    console.error("Set PYTHON_PATH in backend/.env if python is not on PATH.");
  });

  analyticsChild.on("exit", (code, signal) => {
    if (analyticsChild && code && code !== 0) {
      console.error(`Python analytics exited (code=${code}, signal=${signal || "none"})`);
    }
    analyticsChild = null;
  });

  return analyticsChild;
}

async function waitForAnalytics(maxAttempts = 20, delayMs = 500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (await isAnalyticsHealthy()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

async function ensureAnalyticsRunning() {
  if (!shouldManageAnalyticsLocally()) {
    console.log("Python analytics managed externally:", ANALYTICS_URL);
    return isAnalyticsHealthy();
  }

  if (await isAnalyticsHealthy()) {
    console.log("Python analytics already running:", ANALYTICS_URL);
    return true;
  }

  console.log("Starting Python analytics service...");
  startAnalyticsProcess();

  const ready = await waitForAnalytics();
  if (ready) {
    console.log("Python analytics ready:", ANALYTICS_URL);
    return true;
  }

  console.warn("Python analytics did not become ready in time. Charts may fail until it starts.");
  return false;
}

function registerAnalyticsShutdown() {
  const shutdown = () => {
    stopAnalyticsProcess();
  };

  process.on("exit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
  });

  process.once("SIGUSR2", () => {
    shutdown();
    process.kill(process.pid, "SIGUSR2");
  });
}

module.exports = {
  ensureAnalyticsRunning,
  registerAnalyticsShutdown,
  stopAnalyticsProcess,
  shouldManageAnalyticsLocally
};
