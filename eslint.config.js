function tryRequire (name) {
    try {
        return require(name)
    } catch (e) {
        return null
    }
}

const tsParser = tryRequire("@typescript-eslint/parser")
const tsPlugin = tryRequire("@typescript-eslint/eslint-plugin")

// Map legacy ecmaVersion 8 -> 2017
const ECMA_VERSION = 2017

module.exports = [
    // Base configuration
    {
        ignores: ["views/", "node_modules/", "/src/bin"],
        languageOptions: {
            parser: tsParser || undefined,
            parserOptions: {
                ecmaVersion: ECMA_VERSION,
                sourceType: "module"
            },
            globals: {
                // node
                process: "readonly",
                module: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                require: "readonly",
                // browser
                window: "readonly",
                document: "readonly",
                // mocha
                describe: "readonly",
                it: "readonly",
                before: "readonly",
                after: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin || undefined
        },
        rules: {
            indent: ["off", 4],
            quotes: ["off", "double", { allowTemplateLiterals: true }],
            // semi: [1, "never"],
            "no-unused-vars": "off",
            "no-return-assign": "off",
            "no-useless-constructor": "off",
            camelcase: "off",
            "padded-blocks": "off",
            "prefer-promise-reject-errors": "off",
            "no-use-before-define": "off",
            "@typescript-eslint/no-use-before-define": ["off", {
                functions: false,
                classes: false,
                variables: true
            }]
        },
        files: ["**/*.ts"]
    },
    // Overrides for tests
    {
        files: ["**/*.spec.ts", "**/*.test.ts"],
        rules: {
            "no-unused-expressions": "off"
        }
    }
]
