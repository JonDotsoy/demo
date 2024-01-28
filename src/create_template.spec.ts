import { test, expect } from "bun:test";
import { createTemplate, templateNameToSource } from "./create_template";

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
