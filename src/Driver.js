var eventproc = require('./fileutils/eventproc');
var Graph = require('./models/datamodels').Graph;

var inputfiledir = 'log_input';
var outputfiledir = 'log_output';


var graph = new Graph();
eventproc.processfile(graph, inputfiledir, outputfiledir);
