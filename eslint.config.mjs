import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

// Next 16 removed `next lint`; ESLint runs directly via the flat config.
// eslint-config-next ships native flat-config arrays, so no FlatCompat wrapper.
const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
