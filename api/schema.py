import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType
from models import User


class UserObject(SQLAlchemyObjectType):
    class Meta:
        model = User
