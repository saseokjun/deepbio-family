FROM ubuntu:18.04

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN cd /etc/apt && sed -i 's/archive.ubuntu.com/ftp.daum.net/g' sources.list
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get -qq -y install git curl build-essential
RUN apt-get -qq -y install python3
RUN apt-get -qq -y install python3-pip

COPY requirements.txt /
RUN pip3 install -r requirements.txt
RUN rm requirements.txt
RUN mkdir /app

WORKDIR /app