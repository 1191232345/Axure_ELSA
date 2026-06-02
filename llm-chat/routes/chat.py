from flask import Blueprint, request, jsonify, Response, stream_with_context
from models.chat import *
from models.config import get_config_by_id
import json
import requests
from openai import OpenAI

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

@chat_bp.route('/conversations', methods=['GET'])
def list_conversations():
    conversations = get_all_conversations()
    return jsonify(conversations)

@chat_bp.route('/conversations', methods=['POST'])
def create_conversation_route():
    data = request.json
    conversation_id = create_conversation(
        title=data.get('title', '新对话'),
        model_config_id=data.get('model_config_id')
    )
    return jsonify({'id': conversation_id, 'message': '对话创建成功'}), 201

@chat_bp.route('/conversations/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    conversation = get_conversation_by_id(conversation_id)
    if not conversation:
        return jsonify({'error': '对话不存在'}), 404
    
    messages = get_messages_by_conversation(conversation_id)
    conversation['messages'] = messages
    return jsonify(conversation)

@chat_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
def delete_conversation_route(conversation_id):
    delete_conversation(conversation_id)
    return jsonify({'message': '对话删除成功'})

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    messages = get_messages_by_conversation(conversation_id)
    return jsonify(messages)

@chat_bp.route('/stream', methods=['POST'])
def chat_stream():
    data = request.json
    conversation_id = data.get('conversation_id')
    user_message = data.get('message')
    model_config_id = data.get('model_config_id')
    
    if not user_message:
        return jsonify({'error': '消息不能为空'}), 400
    
    config = get_config_by_id(model_config_id)
    if not config:
        return jsonify({'error': '模型配置不存在'}), 404
    
    add_message(conversation_id, 'user', user_message)
    
    messages = get_messages_by_conversation(conversation_id)
    chat_messages = [{'role': msg['role'], 'content': msg['content']} for msg in messages]
    
    def generate():
        try:
            client = OpenAI(
                api_key=config['api_key'],
                base_url=config['base_url'] or None
            )
            
            stream = client.chat.completions.create(
                model=config['model_name'],
                messages=chat_messages,
                temperature=config['temperature'],
                max_tokens=config['max_tokens'],
                stream=True
            )
            
            full_response = ''
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield f"data: {json.dumps({'content': content})}\n\n"
            
            add_message(conversation_id, 'assistant', full_response)
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )

@chat_bp.route('/send', methods=['POST'])
def chat_send():
    data = request.json
    conversation_id = data.get('conversation_id')
    user_message = data.get('message')
    model_config_id = data.get('model_config_id')
    
    if not user_message:
        return jsonify({'error': '消息不能为空'}), 400
    
    config = get_config_by_id(model_config_id)
    if not config:
        return jsonify({'error': '模型配置不存在'}), 404
    
    add_message(conversation_id, 'user', user_message)
    
    messages = get_messages_by_conversation(conversation_id)
    chat_messages = [{'role': msg['role'], 'content': msg['content']} for msg in messages]
    
    try:
        client = OpenAI(
            api_key=config['api_key'],
            base_url=config['base_url'] or None
        )
        
        response = client.chat.completions.create(
            model=config['model_name'],
            messages=chat_messages,
            temperature=config['temperature'],
            max_tokens=config['max_tokens']
        )
        
        assistant_message = response.choices[0].message.content
        add_message(conversation_id, 'assistant', assistant_message)
        
        return jsonify({
            'message': assistant_message,
            'conversation_id': conversation_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500