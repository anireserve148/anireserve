module.exports = {
    apps: [{
        name: 'anireserve',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        cwd: '/var/www/anireserve',
        instances: 1,
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        max_memory_restart: '500M',
        error_file: '/var/log/pm2/anireserve-error.log',
        out_file: '/var/log/pm2/anireserve-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        autorestart: true,
        watch: false,
        max_restarts: 10,
        min_uptime: '10s'
    }]
}
