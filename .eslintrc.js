module.exports = {
    'extends': 'eslint:recommended',
    "parserOptions": {
        "ecmaVersion": 8,
        "ecmaFeatures": {
          "experimentalObjectRestSpread": true,
        },
        "sourceType": "module"
    },
    'plugins': [
        'mocha'
    ],
    'env': {
        'es6': true,
        'node': true,
        'mocha': true,
        'jquery': false,
        'browser': false
    },
    'rules': {
        'max-len': 'warn',
        'no-multi-spaces': 'error',
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'indent': ['error', 2, {'SwitchCase': 1}],
        'no-trailing-spaces': 'error',
        'space-before-blocks': 'error',
        'keyword-spacing': 'error',
        'space-infix-ops': 'error',
        'quotes': ['error', 'single'],
        'space-in-parens': 'warn',
        'space-before-function-paren': ['error', 'never'],
        'arrow-spacing': 'error',
        'valid-jsdoc': 'error',
        'curly': 'off',
        'no-empty-function': "error",
        'no-return-assign': "error",
        'block-spacing': 'error',
        'array-bracket-spacing': ['error', 'never'],
        'no-unused-vars': 'error',
        'no-debugger': 'error',
        'no-console': 'off',
        'no-alert': 'error',
        'key-spacing': ['error', { 'beforeColon': false }],
        'no-mixed-operators': 'error',
        'one-var-declaration-per-line': ['error', 'always'],
        'no-sparse-arrays': 'off',
        'no-redeclare': 'off',
        'semi': [2, 'always']
    }
};
