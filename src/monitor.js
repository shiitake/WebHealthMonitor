import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {MonitorEndpoint} from 'monitorEndpoint';

@inject(HttpClient)
export class Monitor {
  groups = [];
  urls = [];
  services = [];
  filter = '';
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
  
  set searchFilter(filter) {
    this.filter = filter;
    for (var i=0; i<this.groups.length; i++) {
      this.groups[i].filtered = this.filter;
    }
  }


  constructor(http) {
    this.http = http;
    this.getEndPointsList();
  }
}

//grouping
export class EndpointGroup {
  endpoints = [];
  collapsed = true;
  filtered = '';

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

  @computedFrom('endpoints', 'filtered')
  get endPointsFiltered() {
    if (!this.filtered) {
      return this.endpoints;
    }
    var endpointsFiltered = [];
    for (var i=0; i<this.endpoints.length; i++) {
      if (this.endpoints[i].name.toLowerCase().indexOf(this.filtered.toLowerCase()) > -1) {
        endpointsFiltered.push(this.endpoints[i]);
      }
    }
    return endpointsFiltered;
  }
}