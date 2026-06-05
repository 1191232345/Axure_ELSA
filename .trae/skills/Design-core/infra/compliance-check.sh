#!/bin/bash
# 模块合规检查脚本
# 用法: bash .trae/skills/Design-core/infra/compliance-check.sh [模块目录]
# 示例: bash .trae/skills/Design-core/infra/compliance-check.sh 费用管理/规则配置

set -e

MODULE_DIR="${1:-.}"
PASS=0
WARN=0
FAIL=0

ok()   { echo "  ✅ $1"; PASS=$((PASS + 1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }

echo "🔍 模块合规检查: $MODULE_DIR"
echo "----------------------------------------"

# 必需文件
for f in index.html prd.md logic-docs.html test-cases.md; do
  if [ -f "$MODULE_DIR/$f" ]; then ok "存在 $f"; else fail "缺少 $f"; fi
done

# JS 行数
if [ -f "$MODULE_DIR/js/main.js" ]; then
  LINES=$(wc -l < "$MODULE_DIR/js/main.js" | tr -d ' ')
  if [ "$LINES" -le 300 ]; then ok "main.js 行数合规 ($LINES ≤ 300)"; else warn "main.js 超过 300 行 ($LINES)，建议拆分"; fi
elif [ -f "$MODULE_DIR/js/page.js" ]; then
  LINES=$(wc -l < "$MODULE_DIR/js/page.js" | tr -d ' ')
  if [ "$LINES" -le 300 ]; then ok "page.js 行数合规 ($LINES ≤ 300)"; else warn "page.js 超过 300 行 ($LINES)，建议拆分"; fi
else
  warn "未找到 js/main.js 或 js/page.js"
fi

# logic-docs 空占位检测
if [ -f "$MODULE_DIR/logic-docs.html" ]; then
  if grep -qE '<td[^>]*>\s*/\s*</td>|<td[^>]*>\s*&nbsp;\s*</td>' "$MODULE_DIR/logic-docs.html" 2>/dev/null; then
    warn "logic-docs.html 含 '/' 或空占位单元格"
  else
    ok "logic-docs.html 无 '/' 占位"
  fi
  for section in "初始化" "检索条件" "按钮逻辑" "属性取值"; do
    if grep -q "$section" "$MODULE_DIR/logic-docs.html"; then
      ok "logic-docs 含「$section」章节"
    else
      fail "logic-docs 缺少「$section」相关章节"
    fi
  done
fi

# 主色规范（新标准 #2a3b7d）
if [ -f "$MODULE_DIR/index.html" ]; then
  if grep -q "2a3b7d" "$MODULE_DIR/index.html"; then
    ok "使用标准主色 #2a3b7d"
  elif grep -q "1B3A4B" "$MODULE_DIR/index.html"; then
    warn "使用 Legacy 主题 #1B3A4B（仅维护旧模块时可接受）"
  else
    warn "未检测到标准主色配置"
  fi
fi

# 安全检查（凭证 / 内网 IP）
if grep -rE "api_key|apikey|secret|password\s*=\s*['\"][^'\"]+['\"]" "$MODULE_DIR" --include="*.js" --include="*.html" 2>/dev/null | grep -v "placeholder\|type=\"password\"" | head -1 | grep -q .; then
  fail "检测到可能的硬编码凭证"
else
  ok "无硬编码凭证"
fi

if grep -rE "192\.168\.|10\.0\.|172\.16\." "$MODULE_DIR" --include="*.html" --include="*.js" 2>/dev/null | head -1 | grep -q .; then
  warn "检测到内网 IP 引用"
else
  ok "无内网 IP 引用"
fi

echo "----------------------------------------"
echo "结果: ✅ $PASS  ⚠️ $WARN  ❌ $FAIL"
if [ "$FAIL" -gt 0 ]; then exit 1; fi
