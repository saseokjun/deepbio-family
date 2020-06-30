import sys
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta

basedir = os.path.dirname(os.path.abspath(__file__))
env_path = Path(basedir) / '.env'
load_dotenv(dotenv_path=env_path)


class BaseConfig(object):
    VERSION = os.environ['VERSION']
    SECRET_KEY = os.environ['SECRET_KEY']
    JWT_SECRET_KEY = os.environ['SECRET_KEY']
    JWT_TOKEN_LOCATION = 'headers'
    JWT_HEADER_TYPE = 'Bearer'
    # ACCESS_EXP_LENGTH = 10
    # REFRESH_EXP_LENGTH = 30
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_ARGUMENT_NAME = 'Authorization'
    DEBUG = bool(int(os.environ['DEBUG']))
    DB_NAME = os.environ['DB_NAME']
    DB_USER = os.environ['DB_USER']
    DB_PASS = os.environ['DB_PASS']
    DB_SERVICE = os.environ['DB_SERVICE']
    DB_PORT = os.environ['DB_PORT']
    SQLALCHEMY_DATABASE_URI = 'postgresql://{0}:{1}@{2}:{3}/{4}'.format(
        DB_USER, DB_PASS, DB_SERVICE, DB_PORT, DB_NAME
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = bool(int(os.environ[
        'SQLALCHEMY_TRACK_MODIFICATIONS'
    ]))
    APP_PORT = os.environ['APP_PORT']
    LOGGER_ROOT_PATH = os.environ['LOGGER_ROOT_PATH']
