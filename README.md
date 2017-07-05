# Code for Insight challenge

This project is developed with node. I am new to node and decided this would be a good way to learn as well.

## APPROACH
As this used a social network, I decided a graph would be the ideal data structure and would need to have some sort of traversal mechanism also to visit the nodes and process purchase data. I also realized a need to efficiently sort data as historical purchase data across a user's network had to be sorted and the top 'T' purchases used for anomaly detection.


## DATA STRUCTURES
Each node object would represent a user and contain the user's purchase history in descending order. I build the graph using befriend and unfriend operations. The user's immediate network of nodes is maintained in an array.  

The purchase history of each user is saved in the node as an array also with descending order i.e. latest entry in the files would be at the top of the array. 

When a purcahse event is processed from stream, a traversal of the graph starting from the user node is done using a depth first traversal algorithm. As each node is visited, the purchase history is collected, sorted and the top 'T' kept for anomaly detection. After this, the flagging event is written out. 

## BATCH vs STREAM PROCESSING
I have kept the batch and stream processing to have the same logic. Both files are processed through the same logic except when processing an event from the stream, additional anomaly detection is done using the algorithm above.

## NODE FRAMEWORK DEPENDENCIES
I needed two libraries as the node core libraries could not support file processing well. These are "event-stream" and dateformat.  Both are initialized using "npm install" and executing *run.sh* should install both node modules

## OPTIMIZATIONS
I focused more on correctness and have not done much optimizations as there was not enough time. Few things I tried did not work well and did not have time to analyze further - for example, not doing the mergesort if a node's most recent purchase history is older than the last entry in the depth traversal.

## UNIT TESTS
I added a few unit tests to validate.

