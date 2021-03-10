import os
import requests
import json
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from flask import (
    Flask, render_template, jsonify, request, send_from_directory)
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Resource, Api
from models import (
    db, User, Access, Holiday, Meal, Restaurant
)
from schema import UserObject, AccessObject, HolidayObject, MealObject, RestaurantObject
from config import BaseConfig
from utils import get_ip_address
from graphene import (ObjectType, Mutation, List, Field,
                      String, Union, Schema, Float, types, Boolean, Int, Enum)
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, jwt_refresh_token_required, get_jwt_identity)
from graphql import GraphQLError
from flask_graphql import GraphQLView
from graphene_sqlalchemy import SQLAlchemyConnectionField
from sqlalchemy import and_, or_


app = Flask(__name__)
app.config.from_object(BaseConfig)
db.init_app(app)
jwt = JWTManager(app)
api = Api(app)
migrate = Migrate(app, db)
flask_bcrypt = Bcrypt(app)
cors = CORS(app, supports_credentials=True)


# @app.route('/<filename>')
# def get_service_worker(filename):
#     basedir = os.path.dirname(os.path.abspath(__file__))
#     path = os.path.join(basedir, 'static', 'js')
#     if os.path.exists(os.path.join(path, filename)):
#         return send_from_directory(path, filename)
#     return jsonify({'message': '{}/{} is not exists'.format(path, filename)})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
    return render_template('index.html')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'assets'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/slackId/<username>')
def get_slack_id(username):
    response = requests.get(
        'https://slack.com/api/users.list?token={0}&channel=C4S7BP6SJ&limit=1000'.format(BaseConfig.SLACK_BOT_TOKEN))
    result = json.loads(response.text)
    for member in result['members']:
        if member['name'] == username:
            return jsonify({'id': member['id']})
    return jsonify({'id': 'ID를 찾을수 없습니다.'})


class UserQuery(ObjectType):
    users = List(UserObject)
    user = Field(UserObject, user_id=Int(required=True))
    me = Field(UserObject)

    @jwt_required
    def resolve_users(self, info):
        users = User.query.order_by(User.name).all()
        return users

    @jwt_required
    def resolve_user(self, info, user_id):
        user = User.query.filter_by(id=user_id).first()
        return user

    @jwt_required
    def resolve_me(self, info):
        me = User.query.filter_by(email=get_jwt_identity()).first()
        return me


class AccessQuery(ObjectType):
    access = List(AccessObject,
                  start_date=types.datetime.Date(),
                  end_date=types.datetime.Date(),
                  user_id=Int()
                  )
    last_access = Field(AccessObject)

    @jwt_required
    def resolve_access(self, info, start_date, end_date, user_id):
        end_date = end_date + timedelta(days=1)
        my_access = Access.query.filter(and_(Access.timestamp.between(
            start_date, end_date), Access.user_id == user_id)).order_by(Access.timestamp).all()
        return my_access

    @jwt_required
    def resolve_last_access(self, info):
        last_access = Access.query.order_by(Access.id.desc()).first()
        return last_access


class RestaurantQuery(ObjectType):
    restaurant = Field(RestaurantObject, id=Int(required=True))
    restaurants = List(RestaurantObject)

    @jwt_required
    def resolve_restaurant(self, info, id):
        restaurant = Restaurant.query.filter_by(id=id).first()
        return restaurant

    @jwt_required
    def resolve_restaurants(self, info):
        restaurants = Restaurant.query.all()
        return restaurants


class MealQuery(ObjectType):
    meal_list = List(List(MealObject), date=types.datetime.Date())

    @jwt_required
    def resolve_meal_list(self, info, date):
        restaurants = Restaurant.query.all()
        meal_list = []
        for restaurant in restaurants:
            restaurant_id = restaurant.id
            meal = Meal.query.filter(
                and_(Meal.eat_date == date, Meal.restaurant_id == restaurant_id)).order_by(Meal.id).all()
            meal_list.append(meal)
        return meal_list


class HolidayQuery(ObjectType):
    holidays = List(HolidayObject, searchMonth=types.datetime.Date())
    my_holidays = List(HolidayObject)

    @jwt_required
    def resolve_holidays(self, info, searchMonth):
        prev_date = searchMonth - relativedelta(months=1)
        next_date = searchMonth + relativedelta(months=2) - timedelta(days=1)
        holidays = Holiday.query.filter(
            and_(Holiday.start_date >= prev_date, Holiday.end_date <= next_date)).all()
        return holidays

    @jwt_required
    def resolve_my_holidays(self, info):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        my_holidays = Holiday.query.filter_by(
            user_id=user.id).order_by(Holiday.start_date).all()
        for my_holiday in my_holidays:
            my_holiday.end_date = my_holiday.end_date - timedelta(days=1)
        return my_holidays


class Query(UserQuery, AccessQuery, RestaurantQuery, MealQuery, HolidayQuery):
    pass


class UserCreate(Mutation):
    # no sign up. create only available admin.
    class Arguments:
        name = String(required=True)
        email = String(required=True)
        slack_id = String(required=True)

    user = Field(lambda: UserObject)

    @jwt_required
    def mutate(self, info, name, email, slack_id):
        current_user = get_jwt_identity()
        if not name or not email or not slack_id:
            raise GraphQLError('사용자 정보를 확인하세요.')
        user = User.query.filter_by(email=current_user).first()
        if user.level != 1:
            raise GraphQLError('관리자 전용 기능입니다. 어떻게 시도 하셨습니까 휴먼?')
        new_user = User(name=name, email=email, password=flask_bcrypt.generate_password_hash(
            'deepbio1008').decode('utf-8'), slack_id=slack_id)
        db.session.add(new_user)
        try:
            db.session.commit()
        except Exception as e:
            print(e)
            raise GraphQLError('Internal Server Error')
        return UserCreate(user=new_user)


class UserLogin(Mutation):
    class Arguments:
        email = String(required=True)
        password = String(required=True)

    access = String()
    refresh = String()
    user = Field(lambda: UserObject)

    def mutate(self, info, email, password):
        user = User.query.filter_by(email=email).first()
        if user and flask_bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(email)
            refresh_token = create_refresh_token(email)
            return UserLogin(access=access_token, refresh=refresh_token, user=user)
        else:
            raise GraphQLError('email or password is incorrect')


class UserRefresh(Mutation):
    access = String()

    @jwt_refresh_token_required
    def mutate(self, info):
        current_user = get_jwt_identity()
        return UserRefresh(access=create_access_token(identity=current_user))


class UserChangePassword(Mutation):
    class Arguments:
        current_password = String(required=True)
        new_password = String(required=True)
        check_new_password = String(required=True)

    response = String()

    @jwt_required
    def mutate(self, info, current_password, new_password, check_new_password):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        if user and flask_bcrypt.check_password_hash(user.password, current_password):
            if new_password == check_new_password:
                user.password = flask_bcrypt.generate_password_hash(
                    new_password).decode('utf-8')
                try:
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    print(e)
                    raise GraphQLError('Internal Server Error')
                return UserChangePassword(response={'ok': True})
            else:
                raise GraphQLError('password and new password are not matched')
        else:
            raise GraphQLError('current password is incorrect')


class UserResetPassword(Mutation):
    class Arguments:
        user_id = Int(required=True)

    response = String()

    @jwt_required
    def mutate(self, info, user_id):
        current_user = get_jwt_identity()
        admin = User.query.filter_by(email=current_user).first()
        if not admin.level:
            raise GraphQLError('관리자 전용 기능입니다. 어떻게 시도 하셨습니까 휴먼?')

        user = User.query.filter_by(id=user_id).first()
        user.password = flask_bcrypt.generate_password_hash(
            'deepbio1008').decode('utf-8')
        try:
            db.session.commit()
        except Exceptio as e:
            db.session.rollback()
            print(e)
            raise GraphQLError('Internal Server Error')
        return UserResetPassword(response={'ok': True})


class UserUpdate(Mutation):
    # holiday, level, enter date, join change. only available admin
    class Arguments:
        user_id = Int(required=True)
        annual = Float()
        alternative = Float()
        enter_date = types.datetime.Date()
        is_join = Boolean()
        level = Int()

    user = Field(lambda: UserObject)

    @jwt_required
    def mutate(self, info, user_id, annual=None, alternative=None, enter_date=None, is_join=None, level=None):
        current_user = get_jwt_identity()
        admin = User.query.filter_by(email=current_user).first()
        if not admin.level:
            raise GraphQLError('관리자 전용 기능입니다. 어떻게 시도 하셨습니까 휴먼?')
        user = User.query.filter_by(id=user_id).first()
        if user:
            user.annual = annual
            user.alternative = alternative
            user.enter_date = datetime.strptime(
                str(enter_date), '%Y-%m-%d')
            user.is_join = is_join
            user.level = level
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(e)
            raise GraphQLError('Internal Server Error')
        return UserUpdate(user=user)


class MealUpsert(Mutation):
    class Arguments:
        date = types.datetime.Date(required=True)
        restaurant_id = Int(required=True)
        meal_type = String(required=True)

    response = String()

    @jwt_required
    def mutate(self, info, date, restaurant_id, meal_type):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        _meal = Meal.query.filter(and_(
            Meal.user_id == user.id, Meal.meal_type == meal_type, Meal.eat_date == date)).first()
        if _meal:
            _meal.date = date
            _meal.restaurant_id = restaurant_id
            _meal.meal_type = meal_type
        else:
            new_meal = Meal(restaurant_id=restaurant_id,
                            user_id=user.id, meal_type=meal_type, eat_date=date)
            db.session.add(new_meal)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(e)
            raise GraphQLError('Internal Server Error')
        return MealUpsert(response={'ok': True})


class MealDelete(Mutation):
    class Arguments:
        date = types.datetime.Date(required=True)
        meal_type = String(required=True)

    response = String()

    @jwt_required
    def mutate(self, info, date, meal_type):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        meal = Meal.query.filter(and_(Meal.user_id == user.id, Meal.meal_type ==
                                      meal_type, Meal.eat_date == date)).first()
        if meal:
            db.session.delete(meal)
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(e)
                raise GraphQLError('Internal Server Error')
        return MealDelete(response={'ok': True})


class HolidayCreate(Mutation):
    class Arguments:
        start_date = types.datetime.Date(required=True)
        end_date = types.datetime.Date(required=True)
        holiday_type = String(required=True)

    holiday = Field(lambda: HolidayObject)

    @jwt_required
    def mutate(self, info, start_date, end_date, holiday_type):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        end_date = end_date + timedelta(days=1)
        counted_holiday = 0
        annual_count = 0
        alternative_count = 0

        if start_date > end_date:
            raise GraphQLError('날짜가 올바르지 않습니다. 날짜를 다시 지정 해주세요.')

        if holiday_type != 'ALLDAY':
            if (end_date - start_date).days != 1:
                raise GraphQLError('반차는 하루 단위로 사용 가능합니다.')
            counted_holiday = 0.5
        else:
            counted_holiday = (end_date - start_date).days

        if user.annual + user.alternative < counted_holiday:
            raise GraphQLError('잔여 연차/대체휴무가 부족합니다.')
        else:
            if user.alternative > counted_holiday:
                user.alternative = user.alternative - counted_holiday
                alternative_count = counted_holiday
            else:
                counted_holiday = counted_holiday - user.alternative
                alternative_count = user.alternative
                annual_count = counted_holiday
                user.alternative = 0
                user.annual = user.annual - counted_holiday

        new_holiday = Holiday(start_date=start_date, end_date=end_date,
                              user_id=user.id, holiday_type=holiday_type, annual_count=annual_count, alternative_count=alternative_count)
        db.session.add(new_holiday)
        try:
            db.session.commit()
        except Exception as e:
            print(e)
            db.session.rollback()
            raise GraphQLError('Internal Server Error')
        return HolidayCreate(holiday=new_holiday)


class HolidayUpdate(Mutation):
    class Arguments:
        holiday_id = Int()
        start_date = types.datetime.Date(required=True)
        end_date = types.datetime.Date(required=True)
        holiday_type = String(required=True)

    holiday = Field(lambda: HolidayObject)

    @jwt_required
    def mutate(self, info, holiday_id, start_date, end_date, holiday_type):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        _holiday = Holiday.query.filter_by(id=holiday_id).first()
        if not _holiday:
            raise GraphQLError('Holiday does not exists.')
        if _holiday.user_id != user.id:
            raise GraphQLError('Not your holiday')
        end_date = end_date + timedelta(days=1)
        counted_holiday = 0
        annual_count = 0
        alternative_count = 0

        if holiday_type != 'ALLDAY':
            if (end_date - start_date).days != 1:
                raise GraphQLError('반차는 하루 단위로 사용 가능합니다.')
            counted_holiday = 0.5
        else:
            counted_holiday = (end_date - start_date).days

        annual_original = user.annual + _holiday.annual_count
        alternative_original = user.alternative + _holiday.alternative_count

        if annual_original + alternative_original < counted_holiday:
            raise GraphQLError('잔여 연차/대체휴무가 부족합니다.')
        else:
            if alternative_original > counted_holiday:
                user.alternative = alternative_original - counted_holiday
                user.annual = annual_original
                alternative_count = counted_holiday
            else:
                counted_holiday = counted_holiday - alternative_original
                alternative_count = alternative_original
                annual_count = counted_holiday
                user.alternative = 0
                user.annual = annual_original - counted_holiday

        _holiday.start_date = start_date
        _holiday.end_date = end_date
        _holiday.holiday_type = holiday_type
        _holiday.annual_count = annual_count
        _holiday.alternative_count = alternative_count

        try:
            db.session.commit()
        except Exception as e:
            print(e)
            db.session.rollback()
            raise GraphQLError('Internal Server Error')
        return HolidayUpdate(holiday=_holiday)


class HolidayDelete(Mutation):
    class Arguments:
        holiday_id = Int()

    response = String()

    @jwt_required
    def mutate(self, info, holiday_id):
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        holiday = Holiday.query.filter_by(id=holiday_id).first()

        # if datetime.now() > holiday.start_date + timedelta(days=1):
        #     raise GraphQLError('지난 연차는 취소할 수 없습니다. 관리자에게 문의해 주세요.')

        if holiday.user_id != user.id:
            raise GraphQLError('Not your holiday')
        user.alternative = user.alternative + holiday.alternative_count
        user.annual = user.annual + holiday.annual_count

        db.session.delete(holiday)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(e)
            raise GraphQLError('Internal Server Error')
        return HolidayDelete(response={'ok': True})


class Mutation(ObjectType):
    user_create = UserCreate.Field()
    user_login = UserLogin.Field()
    user_refresh = UserRefresh.Field()
    user_change_password = UserChangePassword.Field()
    user_update = UserUpdate.Field()
    user_reset_password = UserResetPassword.Field()

    meal_upsert = MealUpsert.Field()
    meal_delete = MealDelete.Field()

    holiday_create = HolidayCreate.Field()
    holiday_update = HolidayUpdate.Field()
    holiday_delete = HolidayDelete.Field()


graphql_schema = Schema(query=Query, mutation=Mutation)

app.add_url_rule('/graphql', view_func=GraphQLView.as_view(
    'graphql',
    schema=graphql_schema, graphiql=True
))

if __name__ == '__main__':
    ip_address = get_ip_address()
    # app.run(host=ip_address, port=BaseConfig.APP_PORT)
    app.run(host='0.0.0.0', port=BaseConfig.APP_PORT)
