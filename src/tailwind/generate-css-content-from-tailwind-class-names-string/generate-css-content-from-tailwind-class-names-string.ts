import { Result } from "option-t/plain_result";
import { filterNonTailwindDesignTokensClearly } from "../is-tailwind-class-names-string-literal/filter-non-tailwind-design-tokens-clearly.ts";
import {
  buildGenerateCSSContentFromTailwindToken,
  UnexpectedTailwindTokenError,
} from "../build-generate-css-content-from-tailwind-token/build-generate-css-content-from-tailwind-token.ts";

export const generateCSSContentFromTailwindClassNamesString: (
  code: string,
  generateCSSContentFromTailwindCSSToken: ReturnType<
    typeof buildGenerateCSSContentFromTailwindToken
  >,
) => Result<string, UnexpectedTailwindTokenError>[] = function (
  code,
  generateCSSContentFromTailwindCSSToken,
) {
  const tokens = code.split(" ").filter((token) =>
    filterNonTailwindDesignTokensClearly(token)
  );

  if (tokens.length === 0) {
    return [];
  }

  return tokens.map((token) => {
    return generateCSSContentFromTailwindCSSToken(token);
  });
};
