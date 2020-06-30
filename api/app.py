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
    db, User
)
from schema import UserObject
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


@app.route('/')
def home():
    return render_template('index.html')


class UserQuery(ObjectType):
    users = List(UserObject)
    user = Field(UserObject, user_id=Int(required=True))
    me = Field(UserObject)

    @jwt_required
    def resolve_users(self, info):
        users = User.query.order_by(User.id).all()
        return users

    @jwt_required
    def resolve_user(self, info, user_id):
        user = User.query.filter_by(id=user_id).first()
        return user

    @jwt_required
    def resolve_me(self, info):
        me = User.query.filter_by(email=get_jwt_identity()).first()
        return me


class Query(UserQuery):
    pass


class UserCreate(Mutation):
    class Arguments:
        name = String(required=True)
        email = String(required=True)
        password = String(required=True)

    user = Field(lambda: UserObject)

    @jwt_required
    def mutate(self, info, name, email, password):
        current_user = get_jwt_identity()
        if not name or not email or not slack_id:
            raise GraphQLError('사용자 정보를 확인하세요.')
        new_user = User(
            name=name,
            email=email,
            password=flask_bcrypt.generate_password_hash(
                passwod).decode('utf-8')
        )
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


class Mutation(ObjectType):
    user_create = UserCreate.Field()
    user_login = UserLogin.Field()
    user_refresh = UserRefresh.Field()
    user_change_password = UserChangePassword.Field()


graphql_schema = Schema(query=Query, mutation=Mutation)

app.add_url_rule('/graphql', view_func=GraphQLView.as_view(
    'graphql',
    schema=graphql_schema, graphiql=True
))

if __name__ == '__main__':
    ip_address = get_ip_address()
    app.run(host='0.0.0.0', port=BaseConfig.APP_PORT)
