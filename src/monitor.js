import {computedFrom} from 'aurelia-framework';

export class Monitor{
  urls = [];

  addUrl(options) {
    this.urls.push(new MonitorEndpoint(options));
  }

  constructor() {
    this.addUrl({
      "name": "test",
      "url": "http://www.example.com"
    });

    this.addUrl({
      "name": "test2",
      "url": "http://www.example.com"
    }); 
  }
}

export class MonitorEndpoint {
  constructor(options) {
    this.name = options.name;
    this.url = options.url;
  }
}