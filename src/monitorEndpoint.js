import {computedFrom} from 'aurelia-framework';
import lodash from 'lodash';

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
    this.joinData(options);
    this.startMonitor();
  }

  joinData(newData) {
    if (!newData) {
      return;
    }

    this.largeCard = this.largeCard || (newData && newData.ui && newData.ui.largeCard);

    if (newData.status) {
      this.status = newData.status;
    }

    if (newData.ui && newData.ui.info) {
      this.infoUrl = this.getInfoUrl(newData.ui.info);
    }

    if (newData.ui && newData.ui.infoData) {
      this.infoData = lodash.merge({}, this.infoData, newData.ui.infoData);
    }

    this.currentData = lodash.merge({}, this.currentData, newData);
  }
  
  startMonitor() {	     
    var endpoint = this;
    endpoint.checking = true;

    endpoint.http.jsonp(endpoint.url, 'callback')
      .then(response => {
        endpoint.checking = false;
        endpoint.status = "ok";
        endpoint.joinData(response.response);
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

  @computedFrom('currentData')
  get iconCss() {
    if (this.currentData && this.currentData.ui && this.currentData.ui.icon) {
      return this.currentData.ui.icon;
    }
    else {
      switch (this.currentData.type) {
        case 'FTP Server':
        case 'FTP File':
        case 'FTP Directory': return 'fa fa-files-o';
        case 'Service':
        case 'Windows Service': return 'fa fa-cogs';
        case 'Website': return 'fa fa-desktop';
      }
    }

    return '';
  }

  @computedFrom('iconCss')
  get shouldShowIcon() {
    return this.iconCss !== '';
  }

  @computedFrom('largeCard')
  get cardSizeCss() {
    return this.largeCard ? 'col-md-12' : 'col-md-4';
  }
  
  @computedFrom('infoUrl')
  get hasInfo() {
    return this.infoUrl && this.infoUrl.length > 0;
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
      case "name": 
      case "status":
      case "url":
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