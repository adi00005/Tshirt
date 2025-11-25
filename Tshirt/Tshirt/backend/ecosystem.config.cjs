/**
 * PM2 Process Manager Configuration
 * Uses CommonJS syntax for compatibility with PM2
 */

module.exports = {
  apps: [
    {
      name: 'tshirt-shop-api',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      time: true,
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/tshirt-shop-backend.git',
      path: '/var/www/tshirt-shop-api',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
    },
  },
};

// PM2 Commands:
// Start in development: pm2 start ecosystem.config.cjs
// Start in production: pm2 start ecosystem.config.cjs --env production
// Stop: pm2 stop tshirt-shop-api
// Restart: pm2 restart tshirt-shop-api
// Logs: pm2 logs tshirt-shop-api
// Monitor: pm2 monit
// Save current process list: pm2 save
// Generate startup script: pm2 startup
// Save and start on boot: pm2 save && pm2 startup
