export const VERCEL_JUDGE_HOST = "jananiti009.vercel.app";
export const VERCEL_TEAM_WORKSPACE_HOST = "jananiti-team.vercel.app";

export function shouldRenderStaticJudgeDemo(hostname: string, path: string) {
  return path === "/judge-demo" || hostname === VERCEL_JUDGE_HOST;
}

export function shouldRenderFirebaseWorkspace(hostname: string) {
  return hostname === VERCEL_TEAM_WORKSPACE_HOST;
}
