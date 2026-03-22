import type { AttackCategory } from "@watchllm/types";
import { getAdversarialInputs as contextPoisoning } from "./context-poisoning";
import { getAdversarialInputs as dataExfiltration } from "./data-exfiltration";
import { getAdversarialInputs as hallucination } from "./hallucination";
import { getAdversarialInputs as infiniteLoop } from "./infinite-loop";
import { getAdversarialInputs as jailbreak } from "./jailbreak";
import { getAdversarialInputs as promptInjection } from "./prompt-injection";
import { getAdversarialInputs as roleConfusion } from "./role-confusion";
import { getAdversarialInputs as toolAbuse } from "./tool-abuse";

const TEMPLATE_MAP: Record<AttackCategory, () => string[]> = {
  prompt_injection: promptInjection,
  tool_abuse: toolAbuse,
  hallucination,
  context_poisoning: contextPoisoning,
  infinite_loop: infiniteLoop,
  jailbreak,
  data_exfiltration: dataExfiltration,
  role_confusion: roleConfusion,
};

export function getCategoryTemplates(category: AttackCategory): string[] {
  return TEMPLATE_MAP[category]();
}
