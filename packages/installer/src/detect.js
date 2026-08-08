export function detectAgents(env = process.env) {
  const detected = new Set(["generic"]);

  if (env.CODEX_HOME || env.CODEX_APP || env.CODEX_SESSION_ID) {
    detected.add("codex");
  }

  if (env.CLAUDE_PROJECT_ID || env.CLAUDECODE || env.ANTHROPIC_API_KEY) {
    detected.add("claude");
  }

  if (env.CURSOR_SESSION_ID || env.CURSOR_TRACE_ID || env.CURSOR_AGENT) {
    detected.add("cursor");
  }

  return [...detected];
}
