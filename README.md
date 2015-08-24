# WebHealthMonitor
A Web UI that monitors services that implement the WebHealthMonitor REST healthcheck interface

## Getting started using the UI

### Step 1: Create Endpoints to monitor

Create a file called endpoints.json: 
```
{
  "applicationGroupOne": {
    "urls": [
      {
        "name": "Example One",
        "url": "http://www.example.com/one"
      }, 
      {
        "name": "Example Two",
        "url": "http://www.example.com/two"
      }
    ]
  }
}
```

Where the urls are REST Endpoints that implement our standard interface.

To get started, here are some modules you can use to monitor various services:
* https://github.com/thealah/rest-ftp-health-facade
* https://github.com/thealah/rest-windows-service-health-facade
* https://github.com/thealah/rest-node-health-fascade

You can also customize the endpoints to contain additional information or change how they look in the ui:

```
{
  "applicationGroupOne": {
    "urls": [
      {
        "name": "Example One",
        "url": "http://www.example.com/one",
        "ui": {
          "icon": "fa fa-bolt"
        }
      }, 
      {
        "name": "Example Two",
        "url": "http://www.example.com/two",
        "description": "This is the second example endpoint"
      }
    ]
  }
}
```
### Step 2: Use the WebHealthMonitor client-side application.

You have two options to use WebHealthMonitor:
* Use the public Docker container
* Download the latest release manually and host the static files on a web server

### Using the public Docker container

Create a Dockerfile to add your endpoints.json:
```
FROM sengland/webhealthmonitor

ADD endpoints.json /etc/web-health-monitor/endpoints.json
```

Run the following commands:

```
docker build -t="webmonitor" .
docker run -d --name="webmonitor" -p 80:8080 webmonitor
```

You should now be able to go to http://localhost:8080/ to view the Web Health Monitor

### Manually Hosting WebHealthMonitor
You can host the UI by [downloading the latest release](https://github.com/dtinteractive/WebHealthMonitor/releases/download/0.1.0/dist.zip) and then hosting the static files.

Any webserver should do (Apache, IIS, Nginx), but make sure to configure the webserver to allow hosting the endpoints.json configuration file, explained further below.

To host .json files in IIS, add a MIME type ".json" with the type "application/json".

## Implementing a Health Check Endpoint interface

### Use a plugin

There are several plugins you can use to check the Health of various apps:

* [FTP Sites, Files, and Directories] (https://github.com/thealah/rest-ftp-health-facade)
* [Windows Services, IIS Websites] (https://github.com/thealah/rest-windows-service-health-facade)
* [Node helper module to implement your own endpoint] (https://github.com/thealah/rest-node-health-fascade)

### Build your own

A Health Check Endpoint responds to HTTP Gets with jsonp support. It should return a status code of 200 when it is healthy.

All other endpoint specification parameters are optional, but here is an example of extra data being sent during a health check:

```
{
  "type":"Website",
  "host":"www.dealertrack.com",
  "numberOfProducts": 9001,
  "ignoreMe": "I don't want this to show up in the UI",
  "ui": {
    "info":"/info",
    "hide": ["ignoreMe"],
    "icon": "fa fa-bolt",
    "largeCard": true
  }
}
```

The fields "type" and "host" should be implemented where it makes sense. 

"type" indicates what type of thing is being checked. Current values are:

* Website
* Service
* Windows Service
* FTP Server
* FTP File
* FTP Directory

"host" is the hostname of the thing being checked.

"ignoreMe" is being ignored through the field "ui:hide".

"ui:info" defines an additional REST endpoint that returns additional json data if you wish to know more information about the 'thing' that is not directly related to it's health (description, for example)

"ui:largeCard" will have the card span the entire width of the container instead of a third of it.

"ui:icon" is a [Font Awesome Icon](http://fortawesome.github.io/Font-Awesome/icons/) that helps identify your endpoint application.

"numberOfProducts", in this case, is not part of the standard interface. Any json properties that are not part of the interface are displayed on the Health Check card in the UI.

## Contributors - Getting Started

To run the app, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  >**Note:** This next command only applies to Windows users with Visual Studio installed. Replace "2012" with your version of Visual Studio.
  ```shell
  npm config set msvs_version 2012
  ```

  ```shell
  npm install
  ```
3. Ensure that [Gulp](http://gulpjs.com/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g gulp
  ```
4. Ensure that [jspm](http://jspm.io/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g jspm
  ```
  > **Note:** jspm queries GitHub to install semver packages, but GitHub has a rate limit on anonymous API requests. It is advised that you configure jspm with your GitHub credentials in order to avoid problems. You can do this by executing `jspm registry config github` and following the prompts.
5. Install the client-side dependencies with jspm:

  ```shell
  jspm install -y
  ```
  >**Note:** Windows users, if you experience an error of "unknown command unzip" you can solve this problem by doing `npm install -g unzip` and then re-running `jspm install`.
6. To run the app, execute the following command:

```shell

gulp watch
```
