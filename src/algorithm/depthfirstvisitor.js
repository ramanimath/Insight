/* Walk the graph depth first recursively; 
Add checks to ensure cyclical paths are not traversed 
While walking harvest purchase histories of each node and initiate mergesort to get purchses sorted
*/

var Vertex = require('../models/datamodels').Vertex;
var mergesort = require('./mergesort');


var depthfirst = function(vertex, rootid, traversednodesinpath, visitednodes, depth, sortedpurchasesfromwalk, maxnumberofpurchases) {

    if (vertex) {
        if (depth != 0) {
            for (var i = 0; i < vertex.getnetwork().length; i++) {

                var myfriend = vertex.getnetwork()[i];
                var ismyfriendinpath = traversednodesinpath.find(function(val) {
                    return val == myfriend.id;
                });

                //Walk only IF (not visited already AND not in my path already) 
                if (!visitednodes.hasOwnProperty(myfriend.id) && !ismyfriendinpath) {
                    //console.log("PUSH friend " + myfriend.id + " of " + vertex.id);
                    traversednodesinpath.push(myfriend.id);
                    //console.log("Before recurse at Node : " + myfriend.id + " with " + JSON.stringify(sortedpurchasesfromwalk));
                    var retdata = depthfirst(myfriend, rootid, traversednodesinpath, visitednodes, depth - 1, sortedpurchasesfromwalk, maxnumberofpurchases);
                    sortedpurchasesfromwalk.length = 0;
                    sortedpurchasesfromwalk.push(retdata);
                    //console.log("After recurse of Node : " + myfriend.id + " with " + JSON.stringify(sortedpurchasesfromwalk));
                }
                else {
                    //console.log("SKIP friend " + myfriend.id + " of " + vertex.id);
                }
            }
        }

        if (depth == 0 || vertex.id != rootid) {
            visitednodes[vertex.id] = '';

            sortedpurchasesfromwalk.push(vertex.getpurchasehist());
            //console.log("Harvesting purchases of " + ((depth == 0) ? "leaf " : "parent ") + vertex.id + " at depth : " + depth);
            //console.log("Before merge : " + JSON.stringify(sortedpurchasesfromwalk));
            sortedpurchasesfromwalk = mergesort(sortedpurchasesfromwalk, maxnumberofpurchases);
            //console.log("POP " + vertex.id);
            //console.log("After merge : " + JSON.stringify(sortedpurchasesfromwalk));
            traversednodesinpath.pop();
        }
        return sortedpurchasesfromwalk; //Finally
    }
};


module.exports = depthfirst;
