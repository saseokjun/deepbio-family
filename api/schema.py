import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType
from models import User, Access, Holiday, Meal, Restaurant


class UserObject(SQLAlchemyObjectType):
    class Meta:
        model = User


class AccessObject(SQLAlchemyObjectType):
    class Meta:
        model = Access


class HolidayObject(SQLAlchemyObjectType):
    class Meta:
        model = Holiday


class MealObject(SQLAlchemyObjectType):
    class Meta:
        model = Meal


class RestaurantObject(SQLAlchemyObjectType):
    class Meta:
        model = Restaurant
