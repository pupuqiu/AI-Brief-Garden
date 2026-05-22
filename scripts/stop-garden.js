#!/usr/bin/env node

const {
  PORT,
  getPortListenerPid,
  isGardenProcess,
  isPidAlive,
  isStateManaged,
  readState,
  removeState,
  terminatePid,
  terminateProcessGroup
} = require("./garden-utils");

async function main() {
  const state = readState();
  const listenerPid = getPortListenerPid(PORT);
  const hasManagedState = isStateManaged(state);

  if (listenerPid && !isGardenProcess(listenerPid)) {
    console.error(`端口 ${PORT} 当前被其他无关进程占用，未执行关闭。`);
    process.exit(1);
  }

  if (hasManagedState && state.launcherPid && isPidAlive(state.launcherPid)) {
    const stopped = await terminateProcessGroup(state.launcherPid);

    if (stopped) {
      removeState();
      console.log(`AI Brief Garden 已关闭，端口 ${PORT} 已释放。`);
      return;
    }
  }

  if (listenerPid && isGardenProcess(listenerPid)) {
    const stopped = await terminatePid(listenerPid);

    if (stopped) {
      removeState();
      console.log(`AI Brief Garden 已关闭，端口 ${PORT} 已释放。`);
      return;
    }
  }

  removeState();
  console.log("AI Brief Garden 当前未运行。");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "关闭 AI Brief Garden 失败。");
  process.exit(1);
});
