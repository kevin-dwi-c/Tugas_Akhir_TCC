const { spawn } = require("node:child_process");
const path = require("node:path");

const root = __dirname;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const services = [
  {
    name: "backend",
    cwd: path.join(root, "backend"),
    args: ["run", "dev"],
  },
  {
    name: "frontend",
    cwd: path.join(root, "frontend"),
    args: ["run", "dev"],
  },
];

const children = services.map((service) => {
  const command = process.platform === "win32" ? "cmd.exe" : npmCommand;
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `${npmCommand} ${service.args.join(" ")}`]
      : service.args;

  const child = spawn(command, args, {
    cwd: service.cwd,
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${service.name} exited with code ${code}`);
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Bank Darah dev runner started.");
console.log("Frontend: http://127.0.0.1:5173");
console.log("Backend : http://127.0.0.1:8080/api/v1");
