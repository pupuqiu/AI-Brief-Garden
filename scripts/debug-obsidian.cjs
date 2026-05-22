const path = require("node:path");

async function main() {
  const obsidian = require(path.resolve("/tmp/ai-brief-garden-debug/obsidian.js"));
  const groups = await obsidian.getBriefGroups();
  console.log(JSON.stringify(groups, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
