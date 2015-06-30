import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

@inject(HttpClient)
export class Monitor{
  groups = [];
  urls = [];
  services = [];
  searchGroup = {};
  url = 'http://newdev.cmgeneral.local:9091/';
  port = '9091';

  addUrl(options) {
    this.urls.push(new MonitorEndpoint(options, this.http));
  }
  
  addGroups(options) {
    this.groups.push(new EndpointGroup(options));
  }
  
  getServiceList(){
    debugger; 
    var results = '';       
    this.http.jsonp(this.url)
      .then(response => {
        handleResponse(response.content);
//        results = response.content;        
  //      this.services = response.content.services;
        });        
        console.log(results);
  }
  
  handleResponse(response) {
    var results = response;
    console.log(results);
  }
  

  constructor(http) {
    this.http = http;
    this.addUrl({
      "name": "NewDev",
      "url": "http://newdev.cmgeneral.local:9091/"
    });
    
    this.addUrl({
      "name": "Test Error DNS",
      "url": "http://api.flickrasdfasdfasdf.com/services/feeds/photos_public.gne?tags=mountain&tagmode=any&format=json"
    });

    this.addUrl({
      "name": "Test Flickr",
      "url": "http://api.flickr.com/services/feeds/photos_public.gne?tags=mountain&tagmode=any&format=json"
    }); 
    
    this.addGroups({
      "name": "Group1",
      "urls" : this.urls
    });
    
    this.addUrl({
      "name": "Test Flickr 2",
      "url": "http://api.flickr.com/services/feeds/photos_public.gne?tags=mountain&tagmode=any&format=json"
    }); 
    
    this.addUrl({
      "name": "Test Error DNS 2",
      "url": "http://api.flickr.com/services/feeds/photos_public.gne?tags=mountain&tagmode=any&format=json"
    });
    
    this.addGroups({
      "name": "Group2",
      "urls" : this.urls
    }); 
    this.searchGroup = new SearchGroups(this.groups);
    debugger;
    this.getServiceList();
    
  }
}

//grouping
export class EndpointGroup {
  collapsed = true;
  constructor(options) {
    this.name = options.name;
    this.urls = options.urls;    
  }
  
  @computedFrom('collapsed')
  get isExpanded(){
    switch (this.collapsed){
      case false: return "fa-angle-double-down fa-rotate-180";
      default: return "fa-angle-double-down";
    }
  }
  
  showOrHide(){    
    this.collapsed = this.collapsed == false;    
  }
}

//get services
export class WindowsService {    
  constructor(name, baseurl){
    this.name = name;
    this.url = baseurl + "/" + name.replace(' ', '_');
  }
}


//monitor
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

//search
export class SearchGroups {
  filteredGroups = [];
  _searchText = '';
  
  constructor(allGroups) {
    this.allGroups = allGroups;
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