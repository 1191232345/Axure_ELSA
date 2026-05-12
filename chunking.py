import csv
import os
from collections import defaultdict

def generate_context_injected_md(csv_file_path, output_md_path):
    """
    生成「上下文注入式」Markdown，每个问答对自带产品/类别信息，适配任意分块器。
    """
    grouped = defaultdict(lambda: defaultdict(list))
    
    with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            product = row.get('产品昵称', '').strip()
            category = row.get('问题类别', '').strip()
            if product and category:
                grouped[product][category].append(row)

    lines = ["# 产品知识问答库（上下文注入版）\n"]
    
    for product in sorted(grouped.keys()):
        for category in sorted(grouped[product].keys()):
            for item in grouped[product][category]:
                q = item.get('问题', '').strip()
                a = item.get('客服话术', '').strip().replace('\n', ' ')
                trigger = item.get('触发词', '').strip()
                attach = item.get('附加文件地址', '').strip()

                # 构建自包含chunk（控制总长度 ≤ 600 chars）
                chunk_lines = []
                header = f"【产品】{product} | 【类别】{category}"
                chunk_lines.append(header)
                chunk_lines.append(f"【问题】{q}")
                chunk_lines.append(f"**客服话术:** {a}")
                if trigger:
                    chunk_lines.append(f"**触发词:** {trigger}")
                if attach:
                    chunk_lines.append(f"**附件:** {attach}")
                chunk_lines.append("")  # 空行分隔

                # 拼接并检查长度（避免超限）
                full_chunk = "\n".join(chunk_lines)
                if len(full_chunk) > 600:
                    # 若超长，优先截断附件（因其对语义影响小）
                    if attach:
                        chunk_lines[-1] = "**附件:** [已省略]"
                        full_chunk = "\n".join(chunk_lines)
                    # 仍超长则警告（实际数据中极少发生）
                    if len(full_chunk) > 650:
                        print(f"⚠️ 警告：问答过长 ({len(full_chunk)} chars)：{product} - {q[:30]}...")

                lines.append(full_chunk)

    with open(output_md_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))

    print(f"✅ 已生成自包含Markdown：{output_md_path}")
    print("📌 使用建议：")
    print("  1. 在RAG平台选择【段落模式】")
    print("  2. 分段标识符: '【产品】' （或留空，用最大长度=600自动分）")
    print("  3. 关闭'删除URL'（保留附件链接）")

if __name__ == "__main__":
    input_csv = "产品知识类-产品问题答疑使用回复话术.csv"
    output_md = "产品知识问答_自包含版.md"

    if not os.path.exists(input_csv):
        print(f"❌ 文件不存在: {input_csv}")
    else:
        generate_context_injected_md(input_csv, output_md)