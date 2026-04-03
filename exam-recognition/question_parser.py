import re
from typing import List, Dict, Any

class QuestionParser:
    def __init__(self):
        self.section_pattern = re.compile(r'^[一二三四五六七八九十]+[、\.．]\s*(.+)$')
        self.question_pattern = re.compile(r'^(\d+)[、\.．]\s*(.+)$')
        self.option_pattern = re.compile(r'^([A-D])[、\.．]\s*(.+)$')
        self.score_pattern = re.compile(r'[（(]\s*(\d+)\s*分\s*[)）]')
    
    def parse(self, text: str) -> Dict[str, Any]:
        lines = text.split('\n')
        parsed_data = {
            'sections': [],
            'raw_text': text
        }
        
        current_section = None
        current_question = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            section_match = self.section_pattern.match(line)
            if section_match:
                if current_section:
                    parsed_data['sections'].append(current_section)
                
                current_section = {
                    'type': 'section',
                    'title': line,
                    'section_type': section_match.group(1).strip(),
                    'questions': []
                }
                current_question = None
                continue
            
            question_match = self.question_pattern.match(line)
            if question_match:
                if current_question and current_section:
                    current_section['questions'].append(current_question)
                
                question_number = question_match.group(1)
                question_content = question_match.group(2)
                
                score_match = self.score_pattern.search(line)
                score = int(score_match.group(1)) if score_match else None
                
                current_question = {
                    'type': 'question',
                    'number': int(question_number),
                    'content': question_content,
                    'full_text': line,
                    'score': score,
                    'options': []
                }
                continue
            
            option_match = self.option_pattern.match(line)
            if option_match and current_question:
                option_letter = option_match.group(1)
                option_content = option_match.group(2)
                
                current_question['options'].append({
                    'letter': option_letter,
                    'content': option_content,
                    'full_text': line
                })
                continue
        
        if current_question and current_section:
            current_section['questions'].append(current_question)
        if current_section:
            parsed_data['sections'].append(current_section)
        
        return parsed_data
    
    def identify_question_type(self, section_title: str) -> str:
        section_title_lower = section_title.lower()
        
        if '选择' in section_title:
            return 'choice'
        elif '填空' in section_title:
            return 'fill_blank'
        elif '判断' in section_title:
            return 'judgment'
        elif '简答' in section_title or '问答' in section_title:
            return 'short_answer'
        elif '计算' in section_title:
            return 'calculation'
        elif '应用' in section_title:
            return 'application'
        else:
            return 'unknown'
    
    def format_for_word(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        formatted_data = []
        
        for section in parsed_data.get('sections', []):
            section_data = {
                'title': section['title'],
                'type': self.identify_question_type(section['title']),
                'questions': []
            }
            
            for question in section.get('questions', []):
                question_data = {
                    'number': question['number'],
                    'content': question['content'],
                    'score': question.get('score'),
                    'options': question.get('options', [])
                }
                section_data['questions'].append(question_data)
            
            formatted_data.append(section_data)
        
        return formatted_data
