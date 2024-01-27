import { pathToFileURL } from "bun";
import { homedir } from "os";

export const home = pathToFileURL(`${homedir()}/`);
export const demosLocation = new URL(".demos/", home);
