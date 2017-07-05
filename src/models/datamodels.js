// Contains the data models for graph, vertex (nodes) and contained log data

// Purchased Item
var purchase = {
    ts: 0,
    linenum: 0,
    amount: 0
};

var removeNodeFromNetwork = function(src, tgt) {
    var idxtoremove = -1;
    if (src && tgt) {
        for (var i = 0; i < src.sortednetwork.length; i++) {
            if (src.sortednetwork[i].id == tgt.id) {
                idxtoremove = i;
                break;
            }
        }
    }
    if (idxtoremove != -1)
        src.sortednetwork.splice(idxtoremove, 1);
};



/******  VERTEX - THIS IS THE NODE THAT HOLDS USER ID AND LIST OF PURCHASES BY THAT USER *********************/

function Vertex(id) {
    this.id = id;
    this.sortednetwork = []; // my network sorted based on timestamp & linenumber in file; contains related vertices
    this.sortedpurchasehist = [];
};


Vertex.prototype.befriend = function(tgt) {
    if (tgt && !this.findFriend(tgt.id)) { // If not a friend already
        this.sortednetwork.push(tgt);
        tgt.sortednetwork.push(this);
    }
};


Vertex.prototype.unfriend = function(tgt) {
    removeNodeFromNetwork(this, tgt);
    removeNodeFromNetwork(tgt, this);
};


Vertex.prototype.addpurchase = function(purchist) {
    this.sortedpurchasehist.unshift(purchist);
};

Vertex.prototype.getpurchasehist = function() {
    return this.sortedpurchasehist;
};

Vertex.prototype.getnetwork = function() {
    return this.sortednetwork;
};

Vertex.prototype.findFriend = function(id) {
    for (var i = 0; i < this.sortednetwork.length; i++) {
        if (this.sortednetwork[i].id === id)
            return this.sortednetwork[i];
    }
};


var testcreatevertex = function(id, purchasehistories) {
    var ver = new Vertex(id);

    for (var i = 0; i < purchasehistories.length; i++) {
        var pur = Object.create(purchase);
        pur.ts = purchasehistories[i][0];
        pur.amount = purchasehistories[i][1];
        pur.linenum = purchasehistories[i][2];
        ver.addpurchase(pur);
    }
    return ver;
}


/******  GRAPH - THIS IS CONTAINED FOR ALL NODES IN THE NEXTWORK  *********************/

function Graph() {
    this.nodes = {};
};

// Befriend two nodes. Create them if they do not exist already
Graph.prototype.befriend = function(srcid, tgtid) {
    // If nodes do not exist already, create them
    var srcnode = this.findVertex(srcid, true);
    var tgtnode = this.findVertex(tgtid, true);

    srcnode.befriend(tgtnode);
}

// Unfriend two nodes
Graph.prototype.unfriend = function(srcid, tgtid) {
    var srcnode = this.findVertex(srcid);
    var tgtnode = this.findVertex(tgtid);

    if (srcnode && tgtnode) {
        srcnode.unfriend(tgtnode);
    }
}

// Find a node; If create and node not present create it and add to network
Graph.prototype.findVertex = function(id, create) {
    var node = this.nodes[id];
    if (!node && create) {
        this.nodes[id] = new Vertex(id);
    }
    return this.nodes[id];
}

/*****************************************/


module.exports.purchase = purchase;
module.exports.Vertex = Vertex;
module.exports.Graph = Graph;
module.exports.testcreatevertex = testcreatevertex;
