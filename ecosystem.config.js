module.exports = {
  apps: [{
    name: 'dashboard-generator-backend',
    script: './backend/server.js',
    cwd: '/home/dashboards/webapps/dashboards/dashboard-generator',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true
  }]
};
