// effective-time.js - 规则生效期时间计算（闭区间 + 永久替代截断）

var EFFECTIVE_STATUS_LABELS = {
  unpublished: '未发布',
  active: '生效中',
  future: '待生效',
  expired: '已过期'
};

function parseDateTime(str) {
  if (!str) return null;
  var normalized = String(str).trim().replace('T', ' ');
  return new Date(normalized.replace(/-/g, '/'));
}

function formatStorageDateTime(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.getFullYear() + '-'
    + String(date.getMonth() + 1).padStart(2, '0') + '-'
    + String(date.getDate()).padStart(2, '0') + ' '
    + String(date.getHours()).padStart(2, '0') + ':'
    + String(date.getMinutes()).padStart(2, '0') + ':'
    + String(date.getSeconds()).padStart(2, '0');
}

function normalizeEffectiveStart(str) {
  var d = parseDateTime(str);
  if (!d || isNaN(d.getTime())) return str || '';
  d.setHours(0, 0, 0, 0);
  return formatStorageDateTime(d);
}

function normalizeEffectiveEnd(str) {
  var d = parseDateTime(str);
  if (!d || isNaN(d.getTime())) return str || '';
  d.setHours(23, 59, 59, 999);
  return formatStorageDateTime(d);
}

function normalizeRuleEffectiveTimes(data) {
  if (!data) return data;
  return {
    ...data,
    effective_start_time: normalizeEffectiveStart(data.effective_start_time),
    effective_end_time: normalizeEffectiveEnd(data.effective_end_time)
  };
}

/** 闭区间重叠： [S1,E1] 与 [S2,E2] 相交 */
function isTimeOverlap(start1, end1, start2, end2) {
  var s1 = parseDateTime(start1);
  var e1 = parseDateTime(end1);
  var s2 = parseDateTime(start2);
  var e2 = parseDateTime(end2);
  if (!s1 || !e1 || !s2 || !e2) return false;
  return s1 <= e2 && s2 <= e1;
}

/** 新规则开始前一日 23:59:59，作为被截断旧规则的结束时间 */
function computeTruncateEndBefore(newStartStr) {
  var d = parseDateTime(newStartStr);
  if (!d || isNaN(d.getTime())) return '';
  d.setDate(d.getDate() - 1);
  d.setHours(23, 59, 59, 999);
  return formatStorageDateTime(d);
}

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 开始日期是否晚于当天（仅比较日期，不含时分秒） */
function isStartAfterToday(startStr, now) {
  var start = parseDateTime(startStr);
  if (!start || isNaN(start.getTime())) return false;
  if (!now) now = new Date();
  return toDateOnly(start) > toDateOnly(now);
}

/** 开始日期 ≤ 当天 → 发布后立即生效 */
function isImmediateEffective(startStr, now) {
  return !isStartAfterToday(startStr, now);
}

function computeEffectiveStatus(config, now) {
  if (!now) now = new Date();
  var status = config.status || 'draft';
  if (status === 'draft') return 'unpublished';
  if (status === 'voided') return 'expired';

  var start = parseDateTime(config.effective_start_time);
  var end = parseDateTime(config.effective_end_time);
  if (!start || !end) return 'expired';

  // 开始日期 > 当天 → 待生效；开始日期 ≤ 当天 → 按结束时间判断是否仍生效
  if (toDateOnly(start) > toDateOnly(now)) return 'future';
  if (now <= end) return 'active';
  return 'expired';
}

function getEffectiveStatusLabel(key) {
  return EFFECTIVE_STATUS_LABELS[key] || key;
}

function getEffectiveStatusBadge(statusKey) {
  var label = getEffectiveStatusLabel(statusKey);
  var cls = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ';
  if (statusKey === 'active') cls += 'bg-green-100 text-green-800';
  else if (statusKey === 'future') cls += 'bg-blue-100 text-blue-800';
  else if (statusKey === 'unpublished') cls += 'bg-gray-100 text-gray-700';
  else cls += 'bg-gray-100 text-gray-500';
  return '<span class="' + cls + '">' + label + '</span>';
}

function buildPublishPreviewMessage(config, excludeId) {
  var normalized = normalizeRuleEffectiveTimes(config);
  var overlaps = checkPublishConflict(normalized, excludeId);
  var period = formatDateTime(normalized.effective_start_time) + ' 至 ' + formatDateTime(normalized.effective_end_time);
  var immediate = isImmediateEffective(normalized.effective_start_time);
  var newStatusTip = immediate
    ? '新规则：开始日期 ≤ 今天 → 发布后立即生效'
    : '新规则：开始日期 > 今天 → 发布后待生效';

  if (!overlaps.length) {
    return '确认发布后将生成新规则并冻结价卡快照。\n\n' + newStatusTip + '\n生效周期：' + period + '\n\n（无时间重叠，不修改已有规则）\n\n确定发布？';
  }

  var truncEnd = computeTruncateEndBefore(normalized.effective_start_time);
  var oldTip = immediate
    ? '旧规则：立即停用（失效时间截断至 ' + formatDateTime(truncEnd) + '）'
    : '旧规则：继续执行至 ' + formatDateTime(truncEnd) + '，之后由新规则接管';

  var lines = overlaps.map(function(r) {
    return '· 「' + r.name + '」\n  ' + formatDateTime(r.effective_end_time) + ' → ' + formatDateTime(truncEnd);
  });

  return '确认发布后将：\n① 生成新规则并冻结价卡快照\n② 修改以下旧规则的失效时间\n\n'
    + newStatusTip + '\n'
    + oldTip + '\n\n'
    + lines.join('\n')
    + '\n\n新规则生效周期：' + period
    + '\n\n确定发布？';
}

function getEffectiveStartHint(startStr) {
  if (!startStr) return '';
  var normalized = normalizeEffectiveStart(startStr);
  if (isStartAfterToday(normalized)) {
    return '开始日期晚于今天 → 发布后「待生效」，旧规则继续执行至新规则开始前一天';
  }
  return '开始日期早于或等于今天 → 发布后立即生效，并停用（截断）重叠的旧规则';
}

window.toDateOnly = toDateOnly;
window.isStartAfterToday = isStartAfterToday;
window.isImmediateEffective = isImmediateEffective;
window.getEffectiveStartHint = getEffectiveStartHint;

window.EFFECTIVE_STATUS_LABELS = EFFECTIVE_STATUS_LABELS;
window.parseDateTime = parseDateTime;
window.formatStorageDateTime = formatStorageDateTime;
window.normalizeEffectiveStart = normalizeEffectiveStart;
window.normalizeEffectiveEnd = normalizeEffectiveEnd;
window.normalizeRuleEffectiveTimes = normalizeRuleEffectiveTimes;
window.isTimeOverlap = isTimeOverlap;
window.computeTruncateEndBefore = computeTruncateEndBefore;
window.computeEffectiveStatus = computeEffectiveStatus;
window.getEffectiveStatusLabel = getEffectiveStatusLabel;
window.getEffectiveStatusBadge = getEffectiveStatusBadge;
window.buildPublishPreviewMessage = buildPublishPreviewMessage;
