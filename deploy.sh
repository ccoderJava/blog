#!/usr/bin/env sh
set -e

# 构建
yarn run dist

# 部署到 GitHub Pages
TEMP_DIR=$(mktemp -d)
git clone --depth 1 git@github.com:ccoderJava/ccoderJava.github.io.git "$TEMP_DIR"
cd "$TEMP_DIR"

# 更新 blog 目录
rm -rf blog
mkdir -p blog
cp -r "$OLDPWD/dist/"* blog/
cp "$OLDPWD/dist/CNAME" . 2>/dev/null || true

# 提交推送
git add -A
git commit -m 'auto deploy' || true
git push

cd -
rm -rf "$TEMP_DIR"
