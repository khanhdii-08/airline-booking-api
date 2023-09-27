module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: true },
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', allowImportExportEverywhere: true },
    settings: { react: { version: '18.2' } },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'eslint-config-prettier', 'prettier'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'prettier/prettier': [
            'warn',
            {
                arrowParens: 'always',
                semi: false,
                trailingComma: 'none',
                tabWidth: 4,
                endOfLine: 'auto',
                useTabs: false,
                singleQuote: true,
                printWidth: 120,
                jsxSingleQuote: true
            }
        ],
        'no-console': 1,
        'no-lonely-if': 1,
        'no-unused-vars': 1,
        'no-trailing-spaces': 1,
        'no-multi-spaces': 1,
        'no-multiple-empty-lines': 1,
        'space-before-blocks': ['error', 'always'],
        'object-curly-spacing': [1, 'always'],
        semi: [1, 'never'],
        quotes: ['error', 'single'],
        'array-bracket-spacing': 1,
        'linebreak-style': 0,
        'no-unexpected-multiline': 'warn',
        'keyword-spacing': 1,
        'comma-dangle': 1,
        'comma-spacing': 1,
        'arrow-spacing': 1
    }
}
