#!/usr/bin/env python3
"""
测试脚本：分析OCR识别和试题解析过程
"""

from question_parser import QuestionParser
from word_generator import WordGenerator

# 模拟OCR识别结果（基于用户提供的试卷）
sample_ocr_text = """第一单元知识通关

一、读句子，根据拼音写词语。
1. 篱笆边 xī shū( )的 zá cǎo( )中，小鸡们在觅食。
2. qīng tíng( )在 máo yán( )下飞来飞去。
3. 他有声有色地 miáo huì( )了当时那种自然、hé xié( )的画面。

二、选择题。
1. 下面加点字读音有误的一项是( )
A. 谈话(tán) 朴素(pǔ)
B. 绮丽(qǐ) 锄头(chú)
C. 应和(hè) 剥削(bō)
D. 占卜(bǔ) 倘若(tǎng)

2. 下列加点词语解释不正确的一项是( )
A. 惟有蜻蜓蛱蝶飞(只有)
B. 最喜小儿亡赖(无所事事)
C. 白发谁家翁媪(老翁和老妇)
D. 四时田园杂兴(随兴而写的诗)

3. 下面句子朗通节奏有误的一项是( )
A. 梅子金黄/杏子肥，麦花雪白/菜花稀。
B. 远上/寒山/石径斜，白云/生处/有人家。
C. 篱落疏疏/一径/深，树头新绿/未成/阴。
D. 醉里/吴音/相媚好，白发/谁家/翁媪？

4. 填入下列句子横线处的关联词最恰当的一项是( )
附近的石头上有妇女在捣衣，它们从不吃惊。
A. 如果……就……
B. 即使……也……
C. 虽然……但是……
D. 无论……都……

5. 下列表述不正确的一项是( )
A. 《清平乐·村居》的作者是宋代的辛弃疾，"清平乐"是词牌名，"村居"是词题。
B. 《乡下人家》为我们展现了一幅悠闲惬意的乡村生活图。
C. 《天窗》中那扇屋顶的小洞虽然给作者带来了无限的想象，但也说明作者童年的孤独。
D. 转述的时候要注意弄清楚要点，注意人称的转换。
"""

def test_parser():
    print("测试试题解析器...")
    print("=" * 60)
    
    parser = QuestionParser()
    parsed_data = parser.parse(sample_ocr_text)
    
    print("1. 原始OCR文本:")
    print(sample_ocr_text)
    print("=" * 60)
    
    print("2. 解析结果:")
    print(f"识别到的大题数量: {len(parsed_data['sections'])}")
    
    for i, section in enumerate(parsed_data['sections']):
        print(f"\n大题{i+1}: {section['title']}")
        print(f"类型: {section['section_type']}")
        print(f"小题数量: {len(section['questions'])}")
        
        for j, question in enumerate(section['questions']):
            print(f"  小题{j+1}: {question['number']}. {question['content']}")
            if question.get('options'):
                print(f"  选项数量: {len(question['options'])}")
                for option in question['options']:
                    print(f"    {option['letter']}. {option['content']}")
    
    print("=" * 60)
    print("3. 格式化为Word的数据:")
    formatted_data = parser.format_for_word(parsed_data)
    for i, section in enumerate(formatted_data):
        print(f"\n大题{i+1}: {section['title']}")
        print(f"Word类型: {section['type']}")

def test_word_generator():
    print("\n测试Word生成器...")
    print("=" * 60)
    
    generator = WordGenerator()
    generator.generate_from_text(sample_ocr_text, "第一单元知识通关")
    
    test_filename = "test_output.docx"
    generator.save(test_filename)
    print(f"测试Word文档已生成: {test_filename}")
    print("请打开文件查看生成效果")

if __name__ == "__main__":
    test_parser()
    test_word_generator()
