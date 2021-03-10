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
    annual = db.Column(db.Float)
    alternative = db.Column(db.Float)
    slack_id = db.Column(db.String(50))
    enter_date = db.Column(db.DateTime)
    is_join = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime)

    def __init__(self, name, email, password, slack_id='', level=0, annual=0, alternative=0, enter_date='1970-01-01', is_join=True):
        self.name = name
        self.email = email
        self.password = password
        self.slack_id = slack_id
        self.level = level
        self.annual = annual
        self.alternative = alternative
        self.enter_date = enter_date
        self.is_join = is_join
        self.created_at = datetime.now()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def is_active(self):
        """True, as all users are active."""
        return True

    def get_id(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.id

    def is_authenticated(self):
        """Return True if the user is authenticated."""
        return self.authenticated

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False


class Access(BaseModel, db.Model):
    __tablename__ = 'access'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'))
    timestamp = db.Column(db.DateTime)
    access_type = db.Column(
        Enum('ON', 'OFF', 'ACCESS', 'IN', 'OUT', name='access_type'), nullable=False)

    user = db.relationship('User')
    db.Index('access_index', user_id, timestamp, unique=True)

    def __init__(self, user_id, timestamp, access_type):
        self.user_id = user_id
        self.timestamp = timestamp
        self.access_type = access_type

    def _to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "timestamp": self.timestamp,
            "access_type": self.access_type
        }


class Holiday(BaseModel, db.Model):
    __tablename__ = 'holiday'

    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'))
    holiday_type = db.Column(
        Enum('AM', 'PM', 'ALLDAY', name='holiday_type'), nullable=False)
    annual_count = db.Column(db.Float)
    alternative_count = db.Column(db.Float)

    db.Index('holiday_index', user_id, start_date,
             end_date, holiday_type, unique=True)
    user = db.relationship('User')

    def __init__(self, start_date, end_date, user_id, holiday_type, annual_count, alternative_count):
        self.start_date = start_date
        self.end_date = end_date
        self.user_id = user_id
        self.holiday_type = holiday_type
        self.annual_count = annual_count
        self.alternative_count = alternative_count


class Meal(BaseModel, db.Model):
    __tablename__ = 'meal'

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    meal_type = db.Column(
        Enum('LUNCH', 'DINNER', name='meal_type'), nullable=False)
    eat_date = db.Column(db.DateTime)

    db.Index('meal_index', user_id, meal_type, eat_date, unique=True)
    user = db.relationship('User')
    restaurant = db.relationship('Restaurant')

    def __init__(self, restaurant_id, user_id, meal_type, eat_date):
        self.restaurant_id = restaurant_id
        self.user_id = user_id
        self.meal_type = meal_type
        self.eat_date = eat_date


class Restaurant(BaseModel, db.Model):
    __tablename__ = 'restaurant'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300))
    bill_type = db.Column(db.String(100))

    def __init__(self, name, bill_type):
        self.name = name
        self.bill_type = bill_type
