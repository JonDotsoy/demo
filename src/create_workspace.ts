import { mkdir, rm } from "fs/promises";
import { exec } from "./common/exec";
import { globalConfig } from "./common/load_local_config";
import { createTemplate, writeTemplate } from "./create_template";
import { loadDemoRCFile } from "./common/load_demorc";

export const createWorkspace = async (opts: {
  /** Location of workspace */
  location: URL;

  removeWorkspaceAfter?: boolean;

  template?: string;

  openEditor?: boolean;
}) => {
  const location = opts.location;
  const removeWorkspaceAfter = opts.removeWorkspaceAfter ?? false;
  const templateName = opts.template ?? "bun";
  const openEditor = opts.openEditor ?? false;

  await mkdir(location, { recursive: true });
  const template = await createTemplate(templateName);
  await writeTemplate(template, location);
  const demoRC = await loadDemoRCFile(new URL(".demorc", location));
  if (demoRC?.scripts?.install) {
    await exec({ cmd: demoRC.scripts.install, cwd: location.pathname });
  }

  console.log(``);
  console.log(`Workspace created on ${location.pathname}`);

  if (openEditor) {
    await exec({
      cmd: [...globalConfig.editorWatch, location.pathname],
      cwd: location.pathname,
    });
  }

  if (removeWorkspaceAfter) {
    await rm(location, { recursive: true });
  }
};
