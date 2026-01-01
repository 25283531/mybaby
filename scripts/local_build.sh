#!/bin/bash
# scripts/local_build.sh
# 这是一个用于在本地 (WSL2/Linux) 编译 OpenWrt IPK 的辅助脚本

set -e

ARCH=$1
CHANNEL=${2:-snapshots} # 可选：snapshots 或 releases

if [ -z "$ARCH" ]; then
    echo "Usage: $0 <arch>"
    echo "Available archs: x86_64, aarch64, armv7"
    echo "Example: ./scripts/local_build.sh x86_64 [snapshots|releases]"
    exit 1
fi

# 1. 确定 SDK 下载地址
case $ARCH in
    x86_64)
        TARGET_PATH="targets/x86/64/"
        SDK_NAME_PATTERN="openwrt-sdk-[^\"]*Linux-x86_64\\.tar\\.(zst|xz)"
        ;;
    aarch64)
        TARGET_PATH="targets/armsr/armv8/"
        SDK_NAME_PATTERN="openwrt-sdk-[^\"]*Linux-x86_64\\.tar\\.(zst|xz)"
        ;;
    armv7)
        TARGET_PATH="targets/ipq40xx/generic/"
        SDK_NAME_PATTERN="openwrt-sdk-[^\"]*Linux-x86_64\\.tar\\.(zst|xz)"
        ;;
    *)
        echo "Unknown architecture: $ARCH"
        exit 1
        ;;
esac

# 1.1 选择渠道：snapshots 或 releases
if [ "$CHANNEL" = "releases" ]; then
    echo "Channel: releases (prefer mainland mirrors)"
    LATEST_VER=$(curl -sL "https://downloads.openwrt.org/releases/" \
        | grep -oE 'href="[0-9]+\.[0-9]+(\.[0-9]+)?/' \
        | sed -E 's/href="(.*)\//\1/' \
        | sort -V \
        | tail -n 1)
    if [ -z "$LATEST_VER" ]; then
        echo "Error: Could not determine latest release version"
        exit 1
    fi
    SDK_URL="https://downloads.openwrt.org/releases/$LATEST_VER/$TARGET_PATH"
else
    echo "Channel: snapshots"
    SDK_URL="https://downloads.openwrt.org/snapshots/$TARGET_PATH"
fi

# 2. 准备构建目录（自动检测大小写敏感文件系统）
CURRENT_DIR="$(pwd)"
is_case_sensitive() {
    local d="$1"
    local a="$d/.CaseTest_$$"
    local b="$d/.casetest_$$"
    rm -f "$a" "$b"
    echo 1 > "$a"
    if [ -e "$b" ]; then
        rm -f "$a" "$b"
        return 1  # case-insensitive
    else
        rm -f "$a"
        return 0  # case-sensitive
    fi
}

BUILD_DIR="build_local/$ARCH"
if ! is_case_sensitive "$CURRENT_DIR"; then
    echo "Detected case-insensitive filesystem at $CURRENT_DIR"
    BUILD_DIR="$HOME/openwrt_builds/mybaby/$ARCH"
    echo "Switching build directory to $BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

echo "=== Fetching SDK for $ARCH ==="
# 支持国内镜像与回退
MATRIX_URL="$SDK_URL"
REL_PATH="${MATRIX_URL#https://downloads.openwrt.org}"
MIRRORS=("https://mirrors.aliyun.com/openwrt" "https://mirrors.tuna.tsinghua.edu.cn/openwrt" "https://mirrors.ustc.edu.cn/openwrt" "https://downloads.openwrt.org")
SELECTED_URL=""
DOWNLOAD_URL=""
# 查找本地已下载的压缩包
find_local_archive() {
    local found=""
    for f in openwrt-sdk-*.tar.*; do
        [ -e "$f" ] && { found="$f"; break; }
    done
    if [ -z "$found" ]; then
        for f in "$CURRENT_DIR"/openwrt-sdk-*.tar.*; do
            [ -e "$f" ] && { cp -f "$f" .; found=$(basename "$f"); break; }
        done
    fi
    if [ -z "$found" ]; then
        for f in "/mnt/e/git/mybaby"/openwrt-sdk-*.tar.*; do
            [ -e "$f" ] && { cp -f "$f" .; found=$(basename "$f"); break; }
        done
    fi
    echo "$found"
}
EXISTING_ARCHIVE=$(find_local_archive)
if [ -n "$EXISTING_ARCHIVE" ]; then
    echo "Found existing SDK archive: $EXISTING_ARCHIVE"
    SDK_FILE="$EXISTING_ARCHIVE"
    DOWNLOAD_URL="$SDK_URL"
else
    for BASE in "${MIRRORS[@]}"; do
        TRY_URL="${BASE}${REL_PATH}"
        echo "Trying SDK index: $TRY_URL"
        SDK_FILE=$(curl -sL "$TRY_URL" | grep -oE "$SDK_NAME_PATTERN" | head -n 1)
        if [ -n "$SDK_FILE" ]; then
        SELECTED_URL="$TRY_URL"
        DOWNLOAD_URL="$TRY_URL"
        echo "Using mirror: $BASE"
        break
        fi
    done
fi

if [ -z "$SDK_FILE" ]; then
    echo "Error: Could not locate SDK file (no mirror and no local archive)"
    exit 1
fi

echo "Target SDK File: '$SDK_FILE'"

remote_size() {
    local url="$1"
    curl -sI "$url" | tr -d '\r' | awk '/Content-Length:/ {print $2}' | tail -n 1
}
local_size() {
    local f="$1"
    stat -c %s "$f" 2>/dev/null || echo 0
}

REMOTE_URL="${DOWNLOAD_URL:-$SDK_URL}/$SDK_FILE"
LOCAL_SIZE=$(local_size "$SDK_FILE")
REMOTE_SIZE=$(remote_size "$REMOTE_URL")

# 读取远端 sha256 校验值（若可用）
remote_sha256() {
    local base="$1"
    local fname="$2"
    local sumfile="${base%/}/sha256sums"
    local sha=$(curl -sL "$sumfile" | grep " $fname\$" | awk '{print $1}' | head -n 1)
    echo "$sha"
}
local_sha256() {
    local f="$1"
    [ -f "$f" ] || { echo ""; return; }
    sha256sum "$f" 2>/dev/null | awk '{print $1}'
}
extract_sdk() {
    local file="$1"
    local abs="$(readlink -f "$file" 2>/dev/null || realpath "$file" 2>/dev/null || echo "$file")"
    if [ ! -f "$abs" ]; then
        echo "Archive not found: $file"
        return 1
    fi
    if [[ "$abs" =~ \.tar\.zst$ ]]; then
        if command -v pv >/dev/null 2>&1; then
            local size=$(stat -c %s "$abs" 2>/dev/null || wc -c <"$abs")
            if [[ "$size" =~ ^[0-9]+$ ]]; then
                unzstd -c "$abs" | pv -s "$size" | tar -xf -
            else
                unzstd -c "$abs" | pv | tar -xf -
            fi
        elif tar --help 2>/dev/null | grep -q -- '--zstd'; then
            tar --zstd -v -xf "$abs" || unzstd -c "$abs" | tar -v -xf -
        else
            unzstd -c "$abs" | tar -v -xf -
        fi
    elif [[ "$abs" =~ \.tar\.xz$ ]]; then
        if command -v pv >/dev/null 2>&1; then
            local size=$(stat -c %s "$abs" 2>/dev/null || wc -c <"$abs")
            if [[ "$size" =~ ^[0-9]+$ ]]; then
                xz -d -c "$abs" | pv -s "$size" | tar -xf -
            else
                xz -d -c "$abs" | pv | tar -xf -
            fi
        else
            tar -J -v -xf "$abs"
        fi
    else
        echo "Unknown archive format: $file"
        return 1
    fi
}
attempt_extract_with_fallback() {
    extract_sdk "$SDK_FILE" || {
        echo "Extraction failed! The file might be corrupted."
        NEW_REMOTE_SIZE=$(remote_size "$REMOTE_URL")
        NEW_LOCAL_SIZE=$(local_size "$SDK_FILE")
        NEW_REMOTE_SHA="$(remote_sha256 "${DOWNLOAD_URL:-$SDK_URL}" "$SDK_FILE")"
        NEW_LOCAL_SHA="$(local_sha256 "$SDK_FILE")"
        REDOWNLOAD=0
        if [ -n "$NEW_REMOTE_SIZE" ] && [ "$NEW_REMOTE_SIZE" -gt 0 ] && [ "$NEW_REMOTE_SIZE" -ne "$NEW_LOCAL_SIZE" ]; then
            echo "Size mismatch on failure, will redownload."
            REDOWNLOAD=1
        elif [ -n "$NEW_REMOTE_SHA" ] && [ -n "$NEW_LOCAL_SHA" ] && [ "$NEW_REMOTE_SHA" != "$NEW_LOCAL_SHA" ]; then
            echo "Sha256 mismatch on failure, will redownload."
            REDOWNLOAD=1
        else
            echo "Remote size/sha unknown; forcing re-download due to extraction failure."
            REDOWNLOAD=1
        fi
        if [ "$REDOWNLOAD" -eq 1 ]; then
            rm -f "$SDK_FILE"
            WGET_OPTS="--show-progress"
            [ "${ALLOW_REDIRECTS:-1}" = "0" ] && WGET_OPTS="$WGET_OPTS --max-redirect=0"
            wget $WGET_OPTS "$REMOTE_URL" || {
                for BASE in "${MIRRORS[@]}"; do
                    TRY_FILE_URL="${BASE}${REL_PATH}/$SDK_FILE"
                    wget -O "$SDK_FILE" $WGET_OPTS "$TRY_FILE_URL" && break
                done
            }
        fi
        extract_sdk "$SDK_FILE"
    }
}
REMOTE_SHA="$(remote_sha256 "${DOWNLOAD_URL:-$SDK_URL}" "$SDK_FILE")"
LOCAL_SHA="$(local_sha256 "$SDK_FILE")"

if [ "$LOCAL_SIZE" -gt 0 ]; then
    if [ -n "$REMOTE_SIZE" ] && [ "$REMOTE_SIZE" -gt 0 ]; then
        if [ "$LOCAL_SIZE" -eq "$REMOTE_SIZE" ]; then
            echo "Local archive matches remote size ($LOCAL_SIZE bytes)."
        else
            echo "Local archive size ($LOCAL_SIZE) != remote ($REMOTE_SIZE), redownloading."
            rm -f "$SDK_FILE"
            WGET_OPTS="--show-progress"
            [ "${ALLOW_REDIRECTS:-1}" = "0" ] && WGET_OPTS="$WGET_OPTS --max-redirect=0"
            wget $WGET_OPTS "$REMOTE_URL"
        fi
    else
        if [ -n "$REMOTE_SHA" ] && [ -n "$LOCAL_SHA" ]; then
            if [ "$REMOTE_SHA" = "$LOCAL_SHA" ]; then
                echo "Local archive sha256 matches remote ($LOCAL_SHA)."
            else
                echo "Local archive sha256 ($LOCAL_SHA) != remote ($REMOTE_SHA), redownloading."
                rm -f "$SDK_FILE"
                WGET_OPTS="--show-progress"
                [ "${ALLOW_REDIRECTS:-1}" = "0" ] && WGET_OPTS="$WGET_OPTS --max-redirect=0"
                wget $WGET_OPTS "$REMOTE_URL"
            fi
        else
            echo "Remote size/sha unknown, using local archive."
        fi
    fi
else
    echo "No local archive, downloading $SDK_FILE..."
    WGET_OPTS="--show-progress"
    [ "${ALLOW_REDIRECTS:-1}" = "0" ] && WGET_OPTS="$WGET_OPTS --max-redirect=0"
    wget $WGET_OPTS "$REMOTE_URL"
fi

# 如果已存在已解压的SDK目录，直接使用；否则再进行解压
EXISTING_SDK_DIR=$(find . -maxdepth 1 -type d -name 'openwrt-sdk-*' | head -n 1)
if [ -n "$EXISTING_SDK_DIR" ]; then
    echo "Found existing extracted SDK directory: $EXISTING_SDK_DIR"
else
    echo "=== Extracting SDK ==="
    # 清理旧的解压目录（仅删除目录，避免误删同名压缩包）
    find . -maxdepth 1 -type d -name 'openwrt-sdk-*' -exec rm -rf {} +

    

    attempt_extract_with_fallback
fi

SDK_DIR=$(find . -maxdepth 1 -type d -name 'openwrt-sdk-*' | head -n 1)
if [ -z "$SDK_DIR" ]; then
    # 尝试使用仓库根目录中已解压的SDK目录（支持在Windows先解压再使用）
    REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "../../..")
    SDK_DIR=$(find "$REPO_ROOT" -maxdepth 1 -type d -name 'openwrt-sdk-*' | head -n 1)
    if [ -n "$SDK_DIR" ]; then
        echo "Using existing SDK directory from repo root: $SDK_DIR"
    fi
fi
if [ -z "$SDK_DIR" ]; then
    echo "Error: SDK directory not found after extraction"
    ls -la
    exit 1
fi
cd "$SDK_DIR"

echo "=== Preparing Package ==="
mkdir -p package/luci-app-mybaby
# 复制源码 (假设脚本在 repo/scripts 目录下运行，或者 repo 根目录)
# 我们需要找到 git 仓库的根目录
REPO_ROOT="$CURRENT_DIR"

if [ ! -f "$REPO_ROOT/Makefile" ]; then
    echo "Error: Could not find source Makefile in $REPO_ROOT"
    exit 1
fi

cp "$REPO_ROOT/Makefile" package/luci-app-mybaby/
cp -r "$REPO_ROOT/luasrc" package/luci-app-mybaby/
# htdocs 可选，存在时再复制
if [ -d "$REPO_ROOT/htdocs" ]; then
    cp -r "$REPO_ROOT/htdocs" package/luci-app-mybaby/
else
    echo "Warning: htdocs directory not found in repo; skipping frontend static files."
fi
cp -r "$REPO_ROOT/files" package/luci-app-mybaby/

echo "=== Updating Feeds ==="
if [ ! -x "./scripts/feeds" ]; then
    echo "Error: SDK scripts/feeds not found. The SDK may be incomplete."
    echo "Attempting to re-extract SDK archive to restore missing files..."
    cd ..
    # 移除不完整目录并重解压
    rm -rf "$SDK_DIR"
    attempt_extract_with_fallback || { echo "Re-extraction failed."; exit 1; }
    SDK_DIR=$(find . -maxdepth 1 -type d -name 'openwrt-sdk-*' | head -n 1)
    cd "$SDK_DIR"
fi
./scripts/feeds update -a
./scripts/feeds install -a

echo "=== Configuring ==="
make defconfig >/dev/null 2>&1
# 强制开启我们的包
echo "CONFIG_PACKAGE_luci-app-mybaby=m" >> .config
make defconfig >/dev/null 2>&1

echo "=== Compiling ==="
make package/luci-app-mybaby/compile V=s

echo "=== Build Finished ==="
echo "Searching for IPK files..."
find bin -name "*.ipk"
