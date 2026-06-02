from flask import jsonify

def success(data=None, message=None):
    response = {'success': True}
    if data is not None:
        response['data'] = data
    if message is not None:
        response['message'] = message
    return jsonify(response)

def error(message, code=400):
    return jsonify({'success': False, 'error': message}), code

def paginated(data, page, total_pages, total_items):
    return jsonify({
        'success': True,
        'data': data,
        'pagination': {
            'page': page,
            'total_pages': total_pages,
            'total_items': total_items
        }
    })