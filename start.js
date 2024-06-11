const { spawn } = require("child_process");

function startApp() {
  const child = spawn(
    "ts-node",
    ["-r", "tsconfig-paths/register", "src/main.ts"],
    {
      stdio: "inherit",
      shell: true,
    },
  );

  child.on("close", (code) => {
    if (code === 2) {
      console.log("App crashed. Restarting...");
      startApp();
    } else {
      console.log(`App exited with code ${code}`);
    }
  });
}

startApp();
