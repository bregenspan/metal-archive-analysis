module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "standard",
    "parserOptions": {
        "ecmaVersion": 2015
    },
    "plugins": [
        "standard",
        "promise"
    ],
    "rules": {  // Look, I'm fine going "Standard" to a point, but...
        "semi": ["error", "always"]
    }
}
