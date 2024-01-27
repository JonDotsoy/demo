import { ENOENT } from "constants";
import { homedir } from "os";
import { pathToFileURL } from "url";
import * as YAML from "yaml";
import { parseConfigEditor, parseConfigEditorWatch } from "./types_validator";

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

export const loadLocalConfig = async (opts?: { configLocation?: URL }) => {
  const configLocation =
    opts?.configLocation ??
    new URL(`.demo/config.yaml`, pathToFileURL(`${homedir()}/`));

  const configs = await fetchConfigFile(configLocation);

  return {
    editor: parseConfigEditor(configs) ?? ['code', '-n'],
    editorWatch: parseConfigEditorWatch(configs) ?? ['code', '-w', '-n'],
  }
};

export const globalConfig = await loadLocalConfig()
