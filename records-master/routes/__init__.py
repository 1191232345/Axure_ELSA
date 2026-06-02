from routes.employee import employee_bp
from routes.rating_item import rating_item_bp
from routes.evaluation import evaluation_bp
from routes.main import main_bp
from routes.department import department_bp
from routes.source import source_bp

def register_routes(app):
    app.register_blueprint(employee_bp)
    app.register_blueprint(rating_item_bp)
    app.register_blueprint(evaluation_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(department_bp)
    app.register_blueprint(source_bp)