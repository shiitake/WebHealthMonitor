import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {MonitorEndpoint} from 'monitorEndpoint';
import _ from 'underscore';

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
  sorting = false;
  forceEndpointCompute = new Date();

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
  
  get shortName(){
    return this.name.replace(/ |\./g, "_");
  }  

  showOrHide() {
    this.collapsed = this.collapsed == false;    
  }

  aStatusChanged(endpointGroup) {
    //Hack - y u no support array computeds Aurelia??
    this.forceEndpointCompute = new Date();
  }

  addUrl(options) {
    var newEndpoint = new MonitorEndpoint(options, this.http, this);
    this.endpoints.push(newEndpoint);
  }
  
  statusOrdered = ['error', 'unknown', 'ok'];
  @computedFrom('endpoints', 'filtered', 'forceEndpointCompute')
  get endPointsFiltered() {
    var endpointGroup = this;
    endpointGroup.sorting = true;
    var returnValue = _.chain(this.endpoints)
      .filter(function (endpoint) {
        return !endpointGroup.filtered || endpoint.name.toLowerCase().indexOf(endpointGroup.filtered.toLowerCase()) > -1;
      })
      .sortBy(function (endpoint) {
        return [endpointGroup.statusOrdered.indexOf(endpoint.status), endpoint.name].join("_");
      })
      .value();

    endpointGroup.sorting = false;
    return returnValue;
  }
}