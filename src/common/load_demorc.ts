import { multiFetch } from "./multi_fetch";
import { every, isArray, isObject, isString } from "./types_validator";

const parseDemoRC = (value: unknown) => {
  if (!isObject(value)) return null;
  const scripts = isObject(value.scripts) ? value.scripts : null;
  return {
    scripts: scripts
      ? {
          install:
            isArray(scripts.install) && every<string>(scripts.install, isString)
              ? scripts.install
              : null,
        }
      : null,
  };
};

const returnOrNull = async <T>(cb: () => Promise<T>): Promise<T | null> => {
  try {
    return await cb();
  } catch (ex) {
    console.error("🚀 ~ returnOrNull ~ ex:", ex);
    return null;
  }
};

export const loadDemoRCFile = async (location: URL) => {
  const response = await multiFetch(new Request(`${location}`));
  if (!response.ok) return null;
  return parseDemoRC(await returnOrNull(async () => await response.json()));
};
