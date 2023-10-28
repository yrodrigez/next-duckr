module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "standard-with-typescript",
    "plugin:react/recommended",
    "eslint:recommended",
    "next"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  "plugins": [
    "react"
  ],
  ignorePatterns: ["/src*"],
  "rules": {}
}
