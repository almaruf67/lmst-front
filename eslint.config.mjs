import { createConfigForNuxt } from '@nuxt/eslint-config';

export default createConfigForNuxt().append({
  name: 'lmst-front-overrides',
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': 'off',
    'vue/attributes-order': 'off',
    'vue/no-template-shadow': 'off',
    'vue/prop-name-casing': 'off',
    '@typescript-eslint/unified-signatures': 'off',
  },
  ignores: ['.nuxt/**', 'dist/**', 'coverage/**', 'tests/coverage/**'],
});
