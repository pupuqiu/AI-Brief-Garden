#!/usr/bin/env node

const {
  ERROR_FILE,
  LOG_FILE,
  PORT,
  URL,
  getPortListenerPid,
  isGardenProcess,
  isStateManaged,
  openBrowser,
  readFileSafe,
  readState,
  spawnGardenServer,
  terminateProcessGroup,
  waitForAccessible,
  waitForProcessStart,
  writeState
} = require("./garden-utils");

async function launchAttempt(hostname) {
  const child = spawnGardenServer(hostname ? { hostname } : {});
  const launcherStart = await waitForProcessStart(child.pid);

  writeState({
    port: PORT,
    url: URL,
    pid: null,
    launcherPid: child.pid,
    launcherStart,
    startedAt: new Date().toISOString(),
    managed: true,
    hostname: hostname || ""
  });

  const ready = await waitForAccessible(12000);
  const errorLog = readFileSafe(ERROR_FILE);
  const listenerPid = getPortListenerPid(PORT);

  if (ready && listenerPid) {
    writeState({
      port: PORT,
      url: URL,
      pid: listenerPid,
      launcherPid: child.pid,
      launcherStart,
      startedAt: new Date().toISOString(),
      managed: true,
      hostname: hostname || ""
    });

    return { ok: true, hostname: hostname || "" };
  }

  return {
    ok: false,
    childPid: child.pid,
    errorLog,
    hostname: hostname || ""
  };
}

async function main() {
  const state = readState();
  const activePid = getPortListenerPid(PORT);

  if (activePid && isGardenProcess(activePid)) {
    if (!isStateManaged(state)) {
      writeState({
        port: PORT,
        url: URL,
        pid: activePid,
        launcherPid: null,
        launcherStart: "",
        startedAt: new Date().toISOString(),
        managed: false
      });
    }

    openBrowser(URL);
    console.log(`AI Brief Garden 已启动：${URL}`);
    console.log(`检测到已有服务正在运行，端口 ${PORT} 已复用。`);
    return;
  }

  if (activePid && !isGardenProcess(activePid)) {
    console.error(`端口 ${PORT} 已被其他进程占用，未启动 AI Brief Garden。`);
    process.exit(1);
  }

  const primaryAttempt = await launchAttempt("");
  if (!primaryAttempt.ok) {
    const shouldRetryOnLocalhost =
      primaryAttempt.errorLog.includes("listen EPERM") ||
      primaryAttempt.errorLog.includes("operation not permitted") ||
      primaryAttempt.errorLog.includes("0.0.0.0");

    if (primaryAttempt.childPid) {
      await terminateProcessGroup(primaryAttempt.childPid);
    }

    if (shouldRetryOnLocalhost) {
      const fallbackAttempt = await launchAttempt("127.0.0.1");
      if (!fallbackAttempt.ok) {
        console.error("AI Brief Garden 启动失败，默认监听和 127.0.0.1 回退都没有成功。");
        console.error(`你可以查看日志：${LOG_FILE}`);
        console.error(`错误日志：${ERROR_FILE}`);
        process.exit(1);
      }

      openBrowser(URL);
      console.log(`AI Brief Garden 已启动：${URL}`);
      console.log("检测到端口监听权限限制，已自动回退为 127.0.0.1 本地监听。");
      return;
    }

    console.error("AI Brief Garden 启动失败，未能在预期时间内响应。");
    console.error(`你可以查看日志：${LOG_FILE}`);
    console.error(`错误日志：${ERROR_FILE}`);
    process.exit(1);
  }

  openBrowser(URL);
  console.log(`AI Brief Garden 已启动：${URL}`);
  console.log(`使用端口 ${PORT}，已自动打开浏览器。`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "启动 AI Brief Garden 失败。");
  process.exit(1);
});
