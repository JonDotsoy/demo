import { exists, stat } from "fs/promises";
import { CacheFolder } from "./cache_folder";

const defaultCacheFolder = new CacheFolder(new URL(".cache/", import.meta.url));

export const multiFetch = async (
  request: Request,
  cacheFolder: CacheFolder | null = defaultCacheFolder,
): Promise<Response> => {
  const url = new URL(request.url);

  const ableToUseCache = ["default", "force-cache", "only-if-cached"].includes(
    request.cache,
  );

  if (ableToUseCache) {
    const responseCached = await cacheFolder?.match(request) ?? null;
    if (responseCached) {
      return responseCached;
    }
  }

  if (url.protocol === "file:") {
    const isFile = (await exists(url)) ? (await stat(url)).isFile() : false;
    if (!isFile) {
      return new Response(null, { status: 404 });
    }
  }

  const updateCache = async (response: Response) => {
    await cacheFolder?.update(request, response);
    return response;
  }

  return await updateCache(await fetch(url));
};
