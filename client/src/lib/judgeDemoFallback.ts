export const VERCEL_JUDGE_HOST = "jananiti009.vercel.app";

export function shouldRenderStaticJudgeDemo(hostname: string, path: string) {
  return path === "/judge-demo" || hostname === VERCEL_JUDGE_HOST;
}
