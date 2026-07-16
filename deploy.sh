#!/usr/bin/env sh
set -e

# 构建
yarn run dist

# 部署到 GitHub Pages
cd dist

echo 'blog.ccoder.cc' > CNAME

git init
git add -A
git commit -m 'auto deploy'

git push -f git@github.com:ccoderJava/blog.git master:gh-pages

cd -
