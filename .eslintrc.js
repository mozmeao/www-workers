module.exports = {
    "env": {
        "browser": false,
        "commonjs": true,
        "es6": true,
        "mocha": true,
        "worker": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
        "camelcase": ["error", {"properties": "always"}],
    }
};
