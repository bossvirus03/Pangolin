module.exports = {
  apps: [
    {
      name: "pangolin",
      script: "dist/main.js",
      instances: 1,
      autorestart: false,
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
