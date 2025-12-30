module.exports = {
  apps: [
    {
      name: "api",
      script: "app.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "worker",
      script: "redis/worker.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
