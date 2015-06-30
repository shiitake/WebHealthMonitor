import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

@inject(HttpClient)
export class Monitor {
  groups = [];
  urls = [];
  services = [];
  searchGroup = {};
  endpointsConfigUrl = 'endpoints.json';
  
  addGroups(options) {
    this.groups.push(new EndpointGroup(options, this.http));
  }
  
  getEndPointsList() {
    var results = '';
    this.http.get(this.endpointsConfigUrl)
      .then(response => {
        var data = JSON.parse(response.response);
        for (var endpointGroup in data) {
          this.addGroups({
            "name": endpointGroup,
            "urls": data[endpointGroup].urls
          });
        }
      });
  }
  

  constructor(http) {
    this.http = http;
    this.getEndPointsList();
    this.searchGroup = new SearchGroups(this.groups);
  }
}

//grouping
export class EndpointGroup {
  endpoints = [];
  collapsed = true;
  constructor(options, http) {
    this.http = http;
    this.name = options.name;
    if (options.urls) {
      for (var i=0; i<options.urls.length; i++) {
        this.addUrl(options.urls[i]);
      }
    }
  }
  
  @computedFrom('collapsed')
  get isExpanded(){
    switch (this.collapsed){
      case false: return "fa-angle-double-down fa-rotate-180";
      default: return "fa-angle-double-down";
    }
  }
  
  showOrHide() {
    this.collapsed = this.collapsed == false;    
  }

  addUrl(options) {
    this.endpoints.push(new MonitorEndpoint(options, this.http));
  }

}

//monitor
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

//search
export class SearchGroups {
  filteredGroups = [];
  allGroups = [];
  _searchText = '';

  addGroup(group) {
    allGroups.push(group);
  }
  
  get searchText() {
    return this._searchText;
  }
  
  set searchText(newValue) {
    this._searchText = newValue;
    if (newValue === '') {
      this.filteredGroups = [];
    } else {
      this.filteredGroups = this.allGroups.filter(x => x.abstract.indexOf(this._searchText) !== -1);
    }
  }
}