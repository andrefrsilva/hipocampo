// touristRouteWorker.js

onmessage = function(e) {
    var { fromId, toId, adjacencyList } = e.data;

    // Step 1: Find the shortest path
    var shortestPath = dijkstra(fromId, toId, adjacencyList);

    if (!shortestPath) {
        postMessage({ error: 'No path found between the selected points.' });
        return;
    }

    // Step 2: Increase weights of edges in the shortest path
    var adjustedAdjacencyList = JSON.parse(JSON.stringify(adjacencyList)); // Deep copy

    for (var i = 0; i < shortestPath.length - 1; i++) {
        var fromNode = shortestPath[i];
        var toNode = shortestPath[i + 1];

        adjustEdgeWeight(adjustedAdjacencyList, fromNode, toNode, 10); // Increase weight by 10
    }

    // Step 3: Find the tourist path
    var touristPath = dijkstra(fromId, toId, adjustedAdjacencyList);

    if (!touristPath || arraysEqual(shortestPath, touristPath)) {
        postMessage({ error: 'No alternative tourist route found.' });
    } else {
        postMessage({ path: touristPath });
    }
};

// Adjust edge weights in the adjacency list
function adjustEdgeWeight(adjacencyList, fromNode, toNode, weightIncrease) {
    var adjust = function(nodeA, nodeB) {
        var neighbors = adjacencyList[nodeA];
        for (var neighbor of neighbors) {
            if (neighbor.node === nodeB) {
                neighbor.weight += weightIncrease;
                break;
            }
        }
    };
    adjust(fromNode, toNode);
    adjust(toNode, fromNode); // For undirected graph
}

// Modify Dijkstra's algorithm to use edge weights
function dijkstra(startNodeId, goalNodeId, adjacencyList) {
    var distances = {};
    var previous = {};
    var queue = new PriorityQueue((a, b) => a.distance < b.distance);

    // Initialize distances
    for (var nodeId in adjacencyList) {
        distances[nodeId] = Infinity;
    }
    distances[startNodeId] = 0;

    queue.push({ id: startNodeId, distance: 0 });

    while (!queue.isEmpty()) {
        var current = queue.pop();
        var currentNodeId = current.id;

        if (currentNodeId === goalNodeId) {
            // Reconstruct path
            var path = [];
            var node = goalNodeId;

            while (node !== undefined) {
                path.unshift(node);
                node = previous[node];
            }
            return path;
        }

        var neighbors = adjacencyList[currentNodeId];
        if (neighbors) {
            for (var neighborObj of neighbors) {
                var neighborId = neighborObj.node;
                var edgeWeight = neighborObj.weight || 1; // Use weight if available

                var alt = distances[currentNodeId] + edgeWeight;

                if (alt < distances[neighborId]) {
                    distances[neighborId] = alt;
                    previous[neighborId] = currentNodeId;
                    queue.push({ id: neighborId, distance: alt });
                }
            }
        }
    }

    // No path found
    return null;
}

// Simple Priority Queue implementation (include as before)
class PriorityQueue {
    constructor(comparator = (a, b) => a.distance < b.distance) {
        this._heap = [];
        this._comparator = comparator;
    }
    // ... (rest of the PriorityQueue class)
}

// Arrays equal function
function arraysEqual(a1, a2) {
    if (a1.length !== a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
}
