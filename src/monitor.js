import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {MonitorEndpoint} from 'monitorEndpoint';

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