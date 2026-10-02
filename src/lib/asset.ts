export function publicPath(src: string) {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  const base = process.env.GITHUB_PAGES === "true" ? "/project-1" : "";
  if (!base || src.startsWith(`${base}/`)) return src;
  return `${base}${src}`;
}
