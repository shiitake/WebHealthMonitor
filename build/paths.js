var path = require('path');

var appRoot = 'src/';
var outputRoot = 'dist/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  style: 'styles/**/*.css',
  output: outputRoot,
  sourceMapRelativePath: '../' + appRoot,
  templates: 'templates/**/*.html',
  templatesOutput: outputRoot + "templates/"
};
