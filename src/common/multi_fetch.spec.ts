import { test, expect } from "bun:test";
import { multiFetch } from "./multi_fetch";

test("download local source", async () => {
  const response = await multiFetch(
    new Request({
      url: new URL("__files__/sample.tgz", import.meta.url).toString(),
    }),
  );

  expect(response).toBeInstanceOf(Response);
  expect(response.ok).toBeTrue();
});

test("download remote source", async () => {
  const response = await multiFetch(
    new Request({
      url: "https://codeload.github.com/JonDotsoy/demo/tar.gz/refs/tags/v1.0.4",
    }),
  );

  expect(response).toBeInstanceOf(Response);
  expect(response.ok).toBeTrue();
});
