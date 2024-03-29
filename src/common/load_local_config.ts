import { ENOENT } from "constants";
import { homedir } from "os";
import { pathToFileURL } from "url";
import * as YAML from "yaml";
import {
  parseConfigDemoLocation,
  parseConfigEditor,
  parseConfigEditorWatch,
} from "./types_validator";

const fetchConfigFile = async (location: URL) => {
  try {
    const res = await fetch(location);
    if (res.status === 404) return null;
    return YAML.parse(await res.text());
  } catch (ex) {
    if (
      typeof ex === "object" &&
      ex !== null &&
      Reflect.get(ex, "errno") === -ENOENT
    ) {
      return null;
    }
    throw ex;
  }
};

export const loadLocalConfig = async (opts?: {
  configLocation?: URL;
  cacheRequests?: URL;
}) => {
  const configLocation =
    opts?.configLocation ??
    new URL(`.demo/config.yaml`, pathToFileURL(`${homedir()}/`));

  const cacheLocation =
    opts?.cacheRequests ??
    new URL(`.demo/.cache/`, pathToFileURL(`${homedir()}/`));

  const configs = await fetchConfigFile(configLocation);

  const home = pathToFileURL(`${homedir()}/`);
  const demoLocationString = parseConfigDemoLocation(configs);
  const defaultDemosLocation = new URL(".demos/", home);

  return {
    editor: parseConfigEditor(configs) ?? ["code", "-n"],
    editorWatch: parseConfigEditorWatch(configs) ?? ["code", "-w", "-n"],
    cacheLocation,
    demosLocation: demoLocationString
      ? new URL(demoLocationString, home)
      : defaultDemosLocation,
  };
};

export const globalConfig = await loadLocalConfig();
