import type { Env } from "@watchllm/types";

export default {
  async queue(
    batch: MessageBatch<unknown>,
    _env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    for (const msg of batch.messages) {
      msg.ack();
    }
  },
};
