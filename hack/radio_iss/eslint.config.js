module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        setInterval: "readonly",
        // p5.js globals
        createCanvas: "readonly",
        windowWidth: "readonly",
        windowHeight: "readonly",
        resizeCanvas: "readonly",
        background: "readonly",
        stroke: "readonly",
        strokeWeight: "readonly",
        fill: "readonly",
        noFill: "readonly",
        noStroke: "readonly",
        ellipse: "readonly",
        point: "readonly",
        map: "readonly",
        lerp: "readonly",
        random: "readonly",
        constrain: "readonly",
        keyIsPressed: "readonly",
        key: "readonly",
        width: "readonly",
        height: "readonly",
        createVector: "readonly",
        p5: "readonly",
        dist: "readonly",
        sqrt: "readonly",
        sin: "readonly",
        cos: "readonly",
        color: "readonly",
        red: "readonly",
        green: "readonly",
        blue: "readonly",
        millis: "readonly",
        // Project classes
        RadioManager: "readonly",
        GeographyManager: "readonly",
        Particle: "readonly",
        // p5.js functions (used by framework)
        setup: "writable",
        draw: "writable",
        keyPressed: "writable", 
        windowResized: "writable"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "varsIgnorePattern": "^(setup|draw|keyPressed|windowResized)$" }],
      "no-undef": "error",
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": "error",
      "curly": "error",
      "no-trailing-spaces": "error",
      "indent": ["error", 2],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-console": "off",
      "no-debugger": "warn"
    }
  }
];