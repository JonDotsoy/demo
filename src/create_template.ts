import type { CacheFolder } from "./common/cache_folder";

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

export const createTemplate = async (opts?: { cache?: CacheFolder }) => {};
