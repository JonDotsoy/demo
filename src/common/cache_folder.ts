import { mkdir, writeFile } from "fs/promises";
import { atom } from "nanostores";
import * as base64 from "base64-js";
import { multiFetch } from "./multi_fetch";

export class CacheFolder {
  ready = atom(false);
  booting: Promise<void>;

  constructor(readonly location: URL) {
    this.booting = this.bootstrap();
  }

  async wait() {
    if (this.ready.get()) return;
    const { promise, resolve } = Promise.withResolvers<void>();
    const unSub = this.ready.subscribe((ready) => {
      if (ready) {
        resolve();
        unSub();
      }
    });
    await promise;
  }

  async bootstrap() {
    await mkdir(this.location, { recursive: true });
    this.ready.set(true);
  }

  async digestRequest(request: Request) {
    const url = request.url;
    const method = request.method;

    return crypto.subtle.digest(
      "SHA-512",
      new TextEncoder().encode(`${method} ${url}`),
    );
  }

  async getDestinationByRequest(request: Request) {
    return new URL(
      `${Array.from(new Uint8Array(await this.digestRequest(request)), (e) => e.toString(16)).join("")}.json`,
      this.location,
    );
  }

  jsonToResponse(payload: any) {
    return new Response(base64.toByteArray(payload.body), {
      status: payload.status,
      headers: payload.headers,
      statusText: payload.statusText,
    });
  }

  async responseToJson(response: Response) {
    return {
      status: response.status,
      headers: Array.from(response.headers.entries()),
      statusText: response.statusText,
      body: base64.fromByteArray(new Uint8Array(await response.arrayBuffer())),
    };
  }

  async match(request: Request) {
    const destination = await this.getDestinationByRequest(request);
    const response = await multiFetch(new Request(`${destination}`), null);
    if (response.status === 404) return null;
    const payload = await response.json();
    return this.jsonToResponse(payload);
  }

  async update(request: Request, response: Response) {
    const destination = await this.getDestinationByRequest(request);
    await writeFile(
      destination,
      JSON.stringify(await this.responseToJson(response), null, 2),
    );
  }
}
