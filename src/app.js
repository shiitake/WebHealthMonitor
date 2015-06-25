import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';

export class App {
  configureRouter(config, router){
    config.title = 'Aurelia';
    config.map([
      { route: ['','monitor'], name: 'monitor',      moduleId: './monitor',      nav: true, title:'Web Health Monitor' }
    ]);

    this.router = router;
  }
}
