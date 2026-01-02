#!/bin/sh

# MyBaby nftables script for TV time limit control
# Supports both IPv4 and IPv6 using inet table

TABLE="tv_limit"
SET_NAME="blocked_devices"
CHAIN="forward"

# Function to check if nftables table exists
table_exists() {
    nft list tables | grep -q "inet $TABLE"
}

# Function to create nftables table and sets
create_table() {
    nft add table inet $TABLE
    nft add set inet $TABLE $SET_NAME "{ type ether addr; flags dynamic; timeout 1d; }"
    nft add chain inet $TABLE forward "{ type filter hook forward priority 0; }"
    nft add rule inet $TABLE forward "ip daddr != { 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12 } ether saddr @$SET_NAME drop"
    nft add rule inet $TABLE forward "ip6 daddr != { fc00::/7, fd00::/8 } ether saddr @$SET_NAME drop"
}

# Function to add device to blocked list
add_device() {
    local mac=$1
    local timeout=$2
    
    if [ -z "$mac" ]; then
        echo "Error: MAC address is required"
        return 1
    fi
    
    if [ -z "$timeout" ]; then
        timeout=86400  # Default 24 hours
    fi
    
    if table_exists; then
        nft add element inet $TABLE $SET_NAME "{ $mac timeout ${timeout}s }"
    else
        echo "Error: Table $TABLE does not exist"
        return 1
    fi
}

# Function to remove device from blocked list
remove_device() {
    local mac=$1
    
    if [ -z "$mac" ]; then
        echo "Error: MAC address is required"
        return 1
    fi
    
    if table_exists; then
        nft delete element inet $TABLE $SET_NAME "{ $mac }"
    else
        echo "Error: Table $TABLE does not exist"
        return 1
    fi
}

# Function to check if device is blocked
is_blocked() {
    local mac=$1
    
    if [ -z "$mac" ]; then
        echo "Error: MAC address is required"
        return 1
    fi
    
    if table_exists; then
        nft get element inet $TABLE $SET_NAME "{ $mac }" >/dev/null 2>&1
    else
        echo "Error: Table $TABLE does not exist"
        return 1
    fi
}

# Function to list all blocked devices
list_blocked() {
    if table_exists; then
        nft list set inet $TABLE $SET_NAME
    else
        echo "Error: Table $TABLE does not exist"
        return 1
    fi
}

# Function to start the service
start() {
    if ! table_exists; then
        create_table
        echo "Created nftables rules for MyBaby"
    else
        echo "MyBaby nftables rules already exist"
    fi
    
    # Enable and start the init script if needed
    /etc/init.d/tv_limit enable
}

# Function to stop the service
stop() {
    if table_exists; then
        nft delete table inet $TABLE
        echo "Removed nftables rules for MyBaby"
    else
        echo "MyBaby nftables rules do not exist"
    fi
}

# Function to get status
status() {
    if table_exists; then
        echo "MyBaby nftables rules are active"
        list_blocked
    else
        echo "MyBaby nftables rules are not active"
        return 1
    fi
}

# Main command handling
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    status)
        status
        ;;
    add)
        add_device "$2" "$3"
        ;;
    remove)
        remove_device "$2"
        ;;
    check)
        is_blocked "$2"
        ;;
    list)
        list_blocked
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|add <mac> [timeout]|remove <mac>|check <mac>|list}"
        exit 1
        ;;
esac

exit 0
