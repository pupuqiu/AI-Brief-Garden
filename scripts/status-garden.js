#!/usr/bin/env node

const {
  PORT,
  URL,
  getPortListenerPid,
  isGardenAccessible,
  isGardenProcess,
  readState
} = require("./garden-utils");

async function main() {
  const state = readState();
  const listenerPid = getPortListenerPid(PORT);
  const accessible = await isGardenAccessible();

  if (listenerPid && isGardenProcess(listenerPid) && accessible) {
    const hostname = state?.hostname || "localhost";
    console.log(`AI Brief Garden 当前状态：运行中`);
    console.log(`访问地址：${URL}`);
    console.log(`端口：${PORT}`);
    console.log(`监听方式：${hostname === "127.0.0.1" ? "127.0.0.1（本地回退）" : "默认监听"}`);
    return;
  }

  console.log("AI Brief Garden 当前状态：未运行");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "检查 AI Brief Garden 状态失败。");
  process.exit(1);
});
