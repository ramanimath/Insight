// I do a merge sort to merge as I visit vertices - purchase history per node is sorted descending (per timestamp) per vertex. 

function maxindex(a) {
    var max = {},
        i = 0,
        n = a.length;

    max.linenum = -Infinity;
    max.ts = -Infinity;
    max.index = -1;

    var maxindx = -1;
    if (a[0] && a[1]) {
        var diff = a[0].ts - a[1].ts;
        if (a[0].ts > a[1].ts) {
            maxindx = 0;
        }
        else if (a[0].ts === a[1].ts) {
            maxindx = (a[0].linenum > a[1].linenum) ? 0 : 1;
        }
        else
            maxindx = 1;
    }
    else if (a[0]) {
        maxindx = 0;
    }
    else if (a[1]) {
        maxindx = 1;
    }
    else
        maxindx = -1;

    return maxindx;
    /*
    for (; i < n; ++i) {
        if (a[i]) {
            if (a[i].ts > max.ts) { // compare timestamps
                max.ts = parseInt(a[i].ts);
                max.linenum = parseInt(a[i].linenum);
                max.index = i;
            }
            else if (parseInt(a[i].ts) === max.ts) { // if timestames are the same, compare file linenumbers
                if (a[i].linenum > max.linenum) {
                    max.linenum = parseInt(a[i].linenum);
                    max.index = i;
                }
            }
        }
    }

    return max.index;*/
}


// assumption: purchase histories in each node are already sorted descending by timestamp i.e. latest purchase is first.
// returns a sorted array  of purchases
var mergesort = function(purchasehistoriestomerge, maxnumberofpurchases) {

    var sortedpricecollector = [];

    if (purchasehistoriestomerge.length == 1) {
        var purchasehist = purchasehistoriestomerge[0];
        for (var i = 0; i < (purchasehist.length || i < maxnumberofpurchases); i++) {
            if (purchasehist[i])
                sortedpricecollector.push(purchasehist[i]);
        }
    }
    else {
        var x = [];
        var nodeindices = [];
        for (var i = 0; i < purchasehistoriestomerge.length; i++) {
            nodeindices[i] = 0;
            x[i] = purchasehistoriestomerge[i][0];
        }

        var largestindex = 1;
        while (largestindex >= 0 && (sortedpricecollector.length < maxnumberofpurchases)) {
            // find index of node that contains the largest value; -1 if exhausted all purchases
            largestindex = maxindex(x);
            if (largestindex >= 0) {
                sortedpricecollector.push(x[largestindex]);
                ++nodeindices[largestindex];
                if (purchasehistoriestomerge[largestindex].length > nodeindices[largestindex]) {
                    x[largestindex] = purchasehistoriestomerge[largestindex][nodeindices[largestindex]]; // use next most recent purchase hist for this node
                }
                else {
                    // remove this node from the list to compare as it has exhausted its purchase history
                    x[largestindex] = undefined;
                }
            }
        }
    }

    return sortedpricecollector;
}


module.exports = mergesort;
