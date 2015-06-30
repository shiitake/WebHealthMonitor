import {computedFrom} from 'aurelia-framework';

export class MonitorEndpoint {
  status = "unknown";
  intervalSpeed = 6000;
  checking = false;
  currentData = {};

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

    endpoint.http.jsonp(endpoint.url, 'callback')
      .then(response => {
        endpoint.checking = false;
        endpoint.status = "ok";
        endpoint.currentData = response.response;
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

  @computedFrom('currentData')
  get dataDetails() {
    var details = [];
    for (var key in this.currentData) {
      if (!this.isIgnoredDetail(key, this.currentData)) {
        details.push({
          "name": key,
          "value": this.currentData[key]
        }); 
      }
    }

    return details;
  }

  isIgnoredDetail(detailKey, data) {
    switch (detailKey) {
      case "ui": return true;
    }
    return data.ui && data.ui.hide && data.ui.hide[detailKey];
  }
}