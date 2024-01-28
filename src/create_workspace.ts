import { mkdir, rm } from "fs/promises";
import { exec } from "./common/exec";
import { globalConfig } from "./common/load_local_config";

export const createWorkspace = async (opts: {
  /** Location of workspace */
  location: URL;

  removeWorkspaceAfter?: boolean;

  template?: string;
}) => {
  const location = opts.location;
  const removeWorkspaceAfter = opts.removeWorkspaceAfter ?? false;
  const template = opts.template ?? "bun";

  await mkdir(location, { recursive: true });
  await exec({ cmd: ["bun", "init", "-y"], cwd: location.pathname });

  await exec({
    cmd: [...globalConfig.editorWatch, location.pathname],
    cwd: location.pathname,
  });

  if (removeWorkspaceAfter) {
    await rm(location, { recursive: true });
  }
};
