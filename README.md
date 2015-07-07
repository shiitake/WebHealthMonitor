# WebHealthMonitor
A Web UI that monitors services that implement our REST healthcheck interface

## Getting Started

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

## Implementing a Health Check Endpoint

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
    "hide": ["ignoreMe"]
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
