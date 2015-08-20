FROM node:slim

RUN \
	npm install http-server -g

ADD dist /etc/web-health-monitor/dist
ADD jspm_packages /etc/web-health-monitor/jspm_packages
ADD index.html /etc/web-health-monitor/index.html
ADD config.js /etc/web-health-monitor/config.js

WORKDIR /etc/web-health-monitor

EXPOSE 80

CMD http-server /etc/web-health-monitor -p 80