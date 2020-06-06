from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum

db = SQLAlchemy()


class BaseModel(db.Model):
    """Base data model for all objects"""
    __abstract__ = True

    def __init__(self, *args):
        super().__init__(*args)

    def __repr__(self):
        """Define a base way to print models"""
        return '%s(%s)' % (self.__class__.__name__, {
            column: value
            for column, value in self._to_dict().items()
        })

    def json(self):
        """
        Define a base way to jsonify models, dealing with datetime objects
        """
        return {
            column: value if not isinstance(value, datetime.date)
            else value.strftime('%Y-%m-%d')
            for column, value in self._to_dict().items()
        }


class User(BaseModel, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300))
    email = db.Column(db.String(300), unique=True)
    password = db.Column(db.String(300))
    level = db.Column(db.Integer)
    created_at = db.Column(db.DateTime)

    def __init__(self, name, email, password, level=0):
        self.name = name
        self.email = email
        self.password = password
        self.level = level
        self.created_at = datetime.now()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
