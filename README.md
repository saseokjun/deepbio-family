# Flask Graphql Boilerplate

This boilerplate based on python3, flask, react, graphql, apollo and axios.

## Usage

### 1. git clone

```
$ git clone https://github.com/saseokjun/flask-graphql-boilerplate.git
```

### 2-1. backend server initialize and run

```
$ cd <PROJECT_ROOT_DIRECTORY>
$ docker-compose up -d
$ cd api
$ virtualenv --python=python3 venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ ./migrate.sh
$ python app.py
```

### 2-2. frontend initialize and run
```
$ cd <PROJECT_ROOT_DIRECTORY>
$ cd web
$ yarn install (or npm install)
$ yarn start (or npm start)

```
