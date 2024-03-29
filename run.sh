cleanup() {
    pm2 delete pangolin
    exit 0
}

trap 'cleanup' INT

pm2 start ecosystem.config.js --no-daemon

# Đợi Ctrl+C
wait