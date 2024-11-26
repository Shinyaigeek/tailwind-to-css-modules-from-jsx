import { parseArgs } from "@std/cli";
import { loadTailwindConfig } from "./tailwind/load-tailwind-config/load-tailwind-config.ts";
import { unwrapOk } from "npm:option-t/plain_result";
import { buildGenerateCSSContentFromTailwindToken } from "./tailwind/build-generate-css-content-from-tailwind-token/build-generate-css-content-from-tailwind-token.ts";
import { generateCSSContentFromJSX } from "./generate-css-content-from-jsx/generate-css-content-from-jsx.ts";
import { generateCSSClassNames } from "./tailwind/generate-css-class-names/generate-css-class-names.ts";
import { askActionForInvalidToken } from "./interaction/ask-action-for-invalid-token/ask-action-for-invalid-token.ts";
import { convertTailwindTokenStringLiteralNodeToCSSModulesStyle } from "./css-modules/convert-tailwind-token-string-literal-node-to-css-modules-style/convert-tailwind-token-string-literal-node-to-css-modules-style.ts";
import generate from "npm:@babel/generator";
import { join } from "@std/path";
import { askClassNameForTargetTailwindTokens } from "./interaction/ask-class-name-for-target-tailwind-tokens/ask-class-name-for-target-tailwind-tokens.ts";

const targetFile = Deno.args[0];

if (!targetFile) {
  throw new Error("Please provide a target file");
}

const flags = parseArgs(Deno.args.slice(1), {
  string: ["config"],
});

const tailwindConfig = flags.config
  ? unwrapOk(await loadTailwindConfig(flags.config))
  : undefined;

const generateCSSContentFromTailwindToken =
  buildGenerateCSSContentFromTailwindToken(tailwindConfig);

const sourceFileText = await Deno.readTextFile(targetFile);
const sourceFile = join(Deno.cwd(), targetFile);

const cssContentResult = await generateCSSContentFromJSX({
  sourceCode: sourceFileText,
  sourceFile,
  generateCSSContentFromTailwindToken,
  generateCSSClassNames,
  askActionForInvalidToken,
  askClassNameForTargetTailwindTokens,
  tailwindTokenStringLiteralNodeProcessor:
    convertTailwindTokenStringLiteralNodeToCSSModulesStyle,
});

const cssContent = unwrapOk(cssContentResult);

if (cssContent.content.length > 1) {
  Deno.writeTextFile(sourceFile.replace(".ts", ".module.css"), cssContent.content);
  const jsx = generate.default(cssContent.jsxAst);
  Deno.writeTextFile(sourceFile, jsx.code);
}
