import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 빌드 산출물은 `next lint`와 달리 `eslint .` 직접 실행 시 자동 제외되지 않으므로 명시 처리
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Prettier와 충돌하는 스타일 규칙 비활성화 (반드시 배열 마지막에 위치)
  eslintConfigPrettier,
];

export default eslintConfig;
