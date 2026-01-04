import { spawn } from "node:child_process";

export const runCommand = (
  cmd: string,
  args: string[],
  options = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      ...options,
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
};
