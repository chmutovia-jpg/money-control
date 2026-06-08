module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --port 4173",
      url: ["http://127.0.0.1:4173/"],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.45 }],
        "categories:accessibility": ["warn", { minScore: 0.75 }],
        "categories:best-practices": ["warn", { minScore: 0.75 }],
        "categories:seo": ["warn", { minScore: 0.6 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
