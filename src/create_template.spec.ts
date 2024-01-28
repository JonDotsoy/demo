import { test, expect } from "bun:test";
import {
  createTemplate,
  templateNameToSource,
  writeTemplate,
} from "./create_template";
import { CacheFolder } from "./common/cache_folder";

test("parse template name", () => {
  expect(`${templateNameToSource("default")}`).toEndWith("bun.tgz");
  expect(`${templateNameToSource("ts")}`).toEndWith("bun.tgz");
  expect(`${templateNameToSource("bun")}`).toEndWith("bun.tgz");
  expect(`${templateNameToSource("empty")}`).toEndWith("empty.tgz");
  expect(`${templateNameToSource("https://foo/bar")}`).toEndWith(
    "https://foo/bar",
  );
  expect(`${templateNameToSource("github/codeql")}`).toEndWith(
    "https://github.com/github/codeql/archive/refs/heads/main.tar.gz",
  );
  expect(`${templateNameToSource("github/codeql@v1")}`).toEndWith(
    "https://github.com/github/codeql/archive/refs/tags/v1.tar.gz",
  );
});

test("create a empty template", async () => {
  const cache = new CacheFolder(new URL(".cache/", import.meta.url));

  const template = await createTemplate("empty", { cache });

  expect(template).toBeInstanceOf(Set);
});

test("write a ts template", async () => {
  const cache = new CacheFolder(new URL(".cache/", import.meta.url));

  const template = await createTemplate("ts", { cache });

  await writeTemplate(
    template,
    new URL("__samples__/sample1/", import.meta.url),
  );
});
