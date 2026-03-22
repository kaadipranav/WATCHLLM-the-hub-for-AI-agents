import type { Env } from "@watchllm/types";

export default {
  async fetch(_request: Request, _env: Env): Promise<Response> {
    return new Response("watchllm-chaos", { status: 200 });
  },
};
