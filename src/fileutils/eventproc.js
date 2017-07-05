var fs = require('fs');
var dateformat = require('dateformat');


var filereader = require('./filereader');
var purchase = require('../models/datamodels').purchase;
var depthfirst = require('../algorithm/depthfirstvisitor').depthfirst;
var mergestats = require('../algorithm/depthfirstvisitor').exportstats;


var batchfilename = '/batch_log.json';
var eventfilename = '/stream_log.json';
var outputfilename = '/flagged_purchases.json';


var degrees = 1;
var trackedpurchases = 2;
var visitednodes = {};
var traversednodesinpath = [];
var sortedpricecollector = [];
var batchprocessstart = '';
var streamprocessstart = '';

var totalbefriendevents = 0;
var totalunfriendevents = 0;
var totalpurchaseevents = 0;


function anomalyhreshold(networkpurchases) {

    var mean = 0;
    networkpurchases.forEach(function(purchase) {
        mean += Number(purchase.amount);
    });

    mean /= networkpurchases.length;

    var sumsq = 0;
    networkpurchases.forEach(function(purchase) {
        sumsq += Math.pow(Number(purchase.amount) - mean, 2);
    });
    var sd = Math.sqrt(sumsq / networkpurchases.length);

    var anomalythreshold = mean + (3.0 * sd);
    return {
        'anomalythreshold': anomalythreshold,
        'mean': mean,
        'sd': sd
    }
}


var linecb = function(batchorstream, inputfiledir, outputfilestream, graph, readerevent, parsedline, lineNr) {
    if (readerevent == 'line') { // read a line event from stream
        if (batchorstream == 'batch') {
            if (parsedline.D) {
                // Depth read from header
                degrees = parsedline.D;
                console.log("Degrees : " + degrees);
                batchprocessstart = new Date().getTime();
            }

            if (parsedline.T) {
                // Tracked purchase read from header
                trackedpurchases = parsedline.T;
                console.log("Tracked Purchases : " + trackedpurchases);
            }
        }

        if (parsedline.event_type) {
            switch (parsedline.event_type) {
                case 'purchase':
                    var userpurchase = Object.create(purchase);
                    userpurchase.ts = new Date(parsedline.timestamp).getTime();
                    userpurchase.linenum = lineNr;
                    userpurchase.amount = parsedline.amount;
                    var node = graph.findVertex(parsedline.id, true);
                    if (node) {
                        totalpurchaseevents++;
                        node.addpurchase(userpurchase, trackedpurchases);
                        if (batchorstream == 'stream') {
                            // If event, we have to flag purchase as anomaly or not - the key question
                            // Walk the graph to figure that out
                            visitednodes = {};
                            traversednodesinpath = [];
                            sortedpricecollector = [];
                            traversednodesinpath.push(node.id);

                            //console.log('Event Stream processing for ' + JSON.stringify(userpurchase));
                            var ret = depthfirst(node, node.id, traversednodesinpath, visitednodes, degrees, sortedpricecollector, trackedpurchases);
                            var threshold = anomalyhreshold(ret[0]);
                            if (userpurchase.amount > threshold.anomalythreshold) { // THIS IS AN ANOMALY
                                var anomaly = {
                                    'event_type': 'purchase',
                                    'timestamp': dateformat(new Date(parsedline.timestamp), "yyyy-mm-dd hh:MM:ss"),
                                    'id': node.id,
                                    'amount': parsedline.amount,
                                    'mean': Number(threshold.mean).toFixed(2),
                                    'sd': Number(threshold.sd).toFixed(2)
                                };

                                outputfilestream.write(JSON.stringify(anomaly) + '\n');
                            }
                        }
                    }
                    break;
                case 'befriend':
                    totalbefriendevents++;
                    graph.befriend(parsedline.id1, parsedline.id2);
                    break;
                case 'unfriend':
                    totalunfriendevents++;
                    graph.unfriend(parsedline.id1, parsedline.id2);
                    break;
                default:
                    break;
            }
        }
    }
    else if (readerevent == 'end') {
        if (batchorstream == 'batch') {
            console.log('Batch processing took : ' + (new Date().getTime() - batchprocessstart) + ' milli seconds');
            streamprocessstart = new Date().getTime();
            filereader('stream', inputfiledir, inputfiledir + eventfilename, outputfilestream, graph, linecb);
        }
        else if (batchorstream == 'stream') {
            outputfilestream.end(
                function() {
                    console.log("Total # of merges : " + mergestats().mergesortcnt + " and it took " + (new Date().getTime() - mergestats().mergesortstarttime));
                    console.log('Stream processing took : ' + (new Date().getTime() - streamprocessstart) + ' milli seconds');
                    console.log('Befriend count: ' + totalbefriendevents + ' ; Unfriend count: ' + totalunfriendevents + ' ; Purchase count: ' + totalpurchaseevents);
                    outputfilestream.close();
                }
            );
        }
        else;
    }
    else;
}


var processfile = function(graph, inputfiledir, outputfiledir) {
    try {
        fs.unlinkSync(outputfiledir + outputfilename); // delete file it it exists already
    }
    catch (e) {}

    var outputfilestream = fs.createWriteStream(outputfiledir + outputfilename);
    filereader('batch', inputfiledir, inputfiledir + batchfilename, outputfilestream, graph, linecb);
}

module.exports.processfile = processfile;
