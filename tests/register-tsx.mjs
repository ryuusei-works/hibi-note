// Node-only test loader: compile local TypeScript/JSX without a test framework.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";
const root = fileURLToPath(new URL("../", import.meta.url));
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/link") return nextResolve("next/link.js", context);
    if (specifier === "next/image")
      return {
        url: pathToFileURL(path.join(root, "tests/next-image.mjs")).href,
        shortCircuit: true,
      };
    let candidate;
    if (specifier.startsWith("@/"))
      candidate = path.join(root, "src", specifier.slice(2));
    else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith(pathToFileURL(path.join(root, "src")).href)
    )
      candidate = path.resolve(
        path.dirname(fileURLToPath(context.parentURL)),
        specifier,
      );
    if (candidate) {
      const file = [
        candidate,
        candidate + ".tsx",
        candidate + ".ts",
        candidate + ".js",
        path.join(candidate, "index.ts"),
      ].find((p) => existsSync(p) && /\.(ts|tsx|js|json)$/.test(p));
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && /\.(ts|tsx)$/.test(url))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      };
    return nextLoad(url, context);
  },
});
