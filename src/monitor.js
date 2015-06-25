import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

@inject(HttpClient)
export class Monitor{
  urls = [];

  addUrl(options) {
    this.urls.push(new MonitorEndpoint(options, this.http));
  }

  constructor(http) {
    this.http = http;
    this.addUrl({
      "name": "Test Error DNS",
      "url": "http://api.flickrasdfasdfasdf.com/services/feeds/photos_public.gne?tags=mountain&tagmode=any&format=json"
    });

    this.addUrl({
      "name": "Test Flickr",
      "url": "http://api.flickr.com/services/feeds/photos_public.gne?tags=mountain&tagmode=any&format=json"
    }); 
  }
}

export class MonitorEndpoint {
  status = "unknown";
  intervalSpeed = 6000;
  checking = false;

  constructor(options, http) {
    this.http = http;
    this.name = options.name;
    this.url = options.url;
    if (options.status) {
      this.status = options.status;
    }
    this.startMonitor();
  }

  
  startMonitor() {
    var endpoint = this;
    endpoint.checking = true;

    endpoint.http.jsonp(endpoint.url)
      .then(response => {
        endpoint.checking = false;
        endpoint.status = "ok";
        setTimeout(function () { endpoint.startMonitor(); }, endpoint.intervalSpeed);
      })
      .catch(response => {
        this.checking = false;
        this.status = "error";
        setTimeout(function () { endpoint.startMonitor(); }, endpoint.intervalSpeed);
      });
  }

  @computedFrom('status')
  get statusCss() {
    switch (this.status.toLowerCase()) {
      case "ok": return "panel-success";
      case "unknown": return "panel-default";
      default: return "panel-danger";
    }
  }

  @computedFrom('status')
  get isDown() {
    switch (this.status.toLowerCase()) {
      case "ok": 
      case "unknown": return false;
      default: return true;
    }
  }
}