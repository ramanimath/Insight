// Reads given files line by line async, parses into JSON and invokes prpvidedprovided callback

var fs = require('fs'),
    util = require('util'),
    stream = require('stream'),
    es = require('event-stream');

var lineNr = 0;

var logJSON = function(line) {
    var jsonobjs = JSON.parse(line);
    console.log(jsonobjs);
}

var filereader = function(batchorstream, inputfiledir, inputfilepath, outputfilestream, graph, linecb) {
    var parsedline = {};
    var s = fs.createReadStream(inputfilepath)
        .pipe(es.split())
        .pipe(es.mapSync(function(line) {

                // pause the readstream
                s.pause();

                lineNr += 1;

                // process line here and call s.resume() when rdy
                parsedline = {};
                if (line) {
                    parsedline = JSON.parse(line);
                    linecb(batchorstream, inputfiledir, outputfilestream, graph, 'line', parsedline, lineNr);
                }

                // resume the readstream, possibly from a callback
                s.resume();
            })
            .on('error', function(err) {
                console.log('Error while reading file.', err);
            })
            .on('end', function() {
                console.log('Processed all records in ' + inputfilepath);
                linecb(batchorstream, inputfiledir, outputfilestream, graph, 'end', parsedline, -1);
            })
        );
};

module.exports = filereader;
