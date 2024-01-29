import { spawnSync } from "bun";

export const exec = async (options: { cmd: string[]; cwd: string }) => {
  console.log(`> ${options.cmd.join(" ")}`);
  spawnSync({
    ...options,
    stdio: ["inherit", "inherit", "inherit"],
  });
};
