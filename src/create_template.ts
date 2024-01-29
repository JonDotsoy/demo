import type { CacheFolder } from "./common/cache_folder";
import tar from "tar-stream";
import { multiFetch } from "./common/multi_fetch";
import stream from "stream";
import { createGunzip, gunzip } from "zlib";
import { exists, mkdir, readFile, rm, unlink, writeFile } from "fs/promises";
import { ulid } from "ulid";
import { tmpdir } from "os";
import { pathToFileURL } from "url";
import { exec } from "./common/exec";

type Entry = {
  path: URL;
  body: Uint8Array;
};

type Template = AsyncIterable<Entry>;

const githubRepoMatch = /^(?<username>[\w\.\-]+)\/(?<repo>[\w\.\-]+)$/;
const githubRepoTagMatch =
  /^(?<username>[\w\.\-]+)\/(?<repo>[\w\.\-]+)\@(?<tag>.+)$/;

const sourcesRules: [
  test: (name: string) => boolean,
  toUrl: (name: string) => URL,
][] = [
  [
    (name) => ["default", "bun", "ts"].includes(name),
    () =>
      new URL(
        "https://raw.githubusercontent.com/JonDotsoy/demo/develop/src/common/defaultTemplates/bun.tgz",
      ),
  ],
  [
    (name) => name === "empty",
    () =>
      new URL(
        "https://raw.githubusercontent.com/JonDotsoy/demo/develop/src/common/defaultTemplates/empty.tgz",
      ),
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

const useTempLocation = async (opts?: {
  keep?: boolean;
  verbose?: boolean;
}) => {
  const keep = opts?.keep ?? false;
  const verbose = opts?.verbose ?? false;

  const tmpLocation = new URL(
    `demo_template_${ulid()}/`,
    pathToFileURL(`${tmpdir()}/`),
  );
  await mkdir(tmpLocation, { recursive: true });
  if (verbose) console.log(`Create tmp directory ${tmpLocation}`);

  return {
    url: tmpLocation,
    async [Symbol.asyncDispose]() {
      if (!keep) await rm(tmpLocation, { recursive: true });
    },
  };
};

export async function* createTemplate(
  templateName: string,
): AsyncGenerator<Entry> {
  const source = templateNameToSource(templateName);
  if (!source) throw new Error(`Invalid ${templateName} source name`);

  await using tempLocation = await useTempLocation({ keep: true });

  const response = await multiFetch(new Request(`${source}`));
  if (!response.ok)
    throw new Error(
      `Invalid ${templateName} source, status ${response.status}`,
    );

  const tmpTemplateLocation = new URL(`template.tgz`, tempLocation.url);
  const tmpTemplateExtractLocation = new URL(`extract/`, tempLocation.url);
  await mkdir(tmpTemplateExtractLocation, { recursive: true });

  await writeFile(
    tmpTemplateLocation,
    new Uint8Array(await response.arrayBuffer()),
  );

  await exec({
    cmd: [
      "tar",
      "-xzvf",
      tmpTemplateLocation.pathname,
      "-C",
      tmpTemplateExtractLocation.pathname,
    ],
    cwd: tmpTemplateExtractLocation.pathname,
  });

  const glob = new Bun.Glob("**");

  for await (const file of glob.scan({
    cwd: tmpTemplateExtractLocation.pathname,
    dot: true,
    absolute: false,
  })) {
    const location = new URL(file, "file:///");
    const absolute = new URL(file, tmpTemplateExtractLocation);

    const entry: Entry = {
      path: location,
      body: new Uint8Array(await readFile(absolute)),
    };

    yield entry;
  }
}

export const writeTemplate = async (template: Template, destination: URL) => {
  await mkdir(new URL("./", destination), { recursive: true });

  for await (const entry of template) {
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
