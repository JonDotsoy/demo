import type { CacheFolder } from "./common/cache_folder";
import tar from "tar-stream";
import { multiFetch } from "./common/multi_fetch";
import stream from "stream";
import { createGunzip, gunzip } from "zlib";
import { exists, mkdir, writeFile } from "fs/promises";

type Entry = {
  path: URL;
  body: Uint8Array;
};

type Template = Iterable<Entry>;

const githubRepoMatch = /^(?<username>[\w\.\-]+)\/(?<repo>[\w\.\-]+)$/;
const githubRepoTagMatch =
  /^(?<username>[\w\.\-]+)\/(?<repo>[\w\.\-]+)\@(?<tag>.+)$/;

const sourcesRules: [
  test: (name: string) => boolean,
  toUrl: (name: string) => URL,
][] = [
  [
    (name) => ["default", "bun", "ts"].includes(name),
    () => new URL(`common/defaultTemplates/bun.tgz`, import.meta.url),
  ],
  [
    (name) => name === "empty",
    () => new URL(`common/defaultTemplates/empty.tgz`, import.meta.url),
  ],
  [
    (name) => name.startsWith(`http://`) || name.startsWith(`https://`),
    (name) => new URL(name),
  ],
  [
    (name) => githubRepoMatch.test(name),
    (name) =>
      new URL(`https://github.com/${name}/archive/refs/heads/main.tar.gz`),
  ],
  [
    (name) => githubRepoTagMatch.test(name),
    (name) => {
      const { username, repo, tag } = githubRepoTagMatch.exec(name)!.groups!;
      return new URL(
        `https://github.com/${username}/${repo}/archive/refs/tags/${tag}.tar.gz`,
      );
    },
  ],
];

export const templateNameToSource = (name: string) => {
  for (const [test, toURL] of sourcesRules) {
    if (test(name)) return toURL(name);
  }
  return null;
};

export const createTemplate = async (
  templateName: string,
  opts?: { cache?: CacheFolder },
) => {
  const source = templateNameToSource(templateName);
  if (!source) throw new Error(`Invalid ${templateName} source name`);

  const response = await multiFetch(new Request(`${source}`));

  const { promise, resolve } = Promise.withResolvers();
  const extract = tar.extract({});
  const entries = new Set<Entry>();
  extract.on("entry", (header, stream, cb) => {
    const chunks: number[] = [];
    stream.on("data", (data) => {
      chunks.push(...data);
    });
    stream.once("close", () => {
      entries.add({
        path: new URL(header.name, "file:///"),
        body: new Uint8Array(chunks),
      });
      cb();
    });
  });
  extract.once("close", () => resolve());
  const ent = stream.Readable.fromWeb(response.body!)
    .pipe(createGunzip())
    .pipe(extract);

  await promise;

  return entries;
};

export const writeTemplate = async (template: Template, destination: URL) => {
  await mkdir(new URL("./", destination), { recursive: true });

  for (const entry of template) {
    const entryDestination = new URL(`.${entry.path.pathname}`, destination);
    // console.log("🚀 ~ writeTemplate ~ entryDestination:", entryDestination)
    const isFolder = entry.path.pathname.endsWith("/");
    // console.log("🚀 ~ writeTemplate ~ entry.path:", entry.path)
    if (isFolder) {
      await mkdir(entryDestination, { recursive: true });
      continue;
    }
    await mkdir(new URL("./", entryDestination), { recursive: true });
    if (await exists(entryDestination)) {
      console.warn(`⚠️ The file ${entry.path.pathname} is ready created`);
      continue;
    }
    await writeFile(entryDestination, entry.body);
  }
};
