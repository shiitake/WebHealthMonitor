import {computedFrom} from 'aurelia-framework';

export class MonitorEndpoint {
  _status = "unknown";
  intervalSpeed = 6000;
  checking = false;
  currentData = {};
  showInfo = false;
  gettingInfo = false;
  infoUrl = '';
  infoData = {};

  constructor(options, http, parentGroup) {
    this.parentGroup = parentGroup;
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
        if (response.response && response.response.ui) {
          endpoint.infoUrl = this.getInfoUrl(response.response.ui.info);
        }
        setTimeout(function () { endpoint.startMonitor(); }, endpoint.intervalSpeed);
      })
      .catch(response => {
        this.checking = false;
        this.status = "error";
        setTimeout(function () { endpoint.startMonitor(); }, endpoint.intervalSpeed);
      });
  }

  getInfoUrl(relativeUrl) {
    var l = document.createElement("a");
    l.href = this.url;

    return "http://" + l.hostname + ":" + l.port + relativeUrl;
  }

  getInfo(e) {
    if (!this.hasInfo) {
      return;
    }

    $(e.target).parents("compose").children(".modal").modal();

    this.gettingInfo = true;
    this.http.jsonp(this.infoUrl, 'callback')
      .then(response => {
        this.infoData = response.response;
        this.gettingInfo = false;
      })
      .catch(response => {
        this.status = "error";
      });
  }

  get status() {
    return this._status;
  }
  set status(val) {
    var oldVal = this._status;
    this._status = val;
    if (oldVal !== this._status) {
      this.parentGroup.aStatusChanged(); 
    }
  }

  @computedFrom('infoUrl')
  get hasInfo() {
    return this.infoUrl && this.infoUrl.length > 0;
  }

  @computedFrom('hasInfo')
  get clickInfoCss() {
    return this.hasInfo ? "cursor: help;" : "";
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
    return data && data.ui && data.ui.hide && data.ui.hide[detailKey];
  }

  @computedFrom('infoData')
  get infoDataDetails() {
    var details = [];
    for (var key in this.infoData) {
      if (!this.isIgnoredDetail(key)) {
        details.push({
          "name": key,
          "value": this.infoData[key]
        }); 
      }
    }
    
    return details;
  }
}