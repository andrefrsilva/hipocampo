importScripts('https://cdn.jsdelivr.net/npm/fastpriorityqueue@0.6.3/FastPriorityQueue.js');

onmessage = function(e) {
    var { fromId, toId, adjacencyList } = e.data;

    var k = 3; // Number of paths to find
    var paths = yenAlgorithm(fromId, toId, adjacencyList, k);

    if (paths.length > 1) {
        // Choose the second shortest path as the tourist route
        var touristPath = paths[1];

        postMessage({ path: touristPath });
    } else {
        postMessage({ error: 'Não foi possível encontrar um caminho turístico mais longo.' });
    }
};

// Dijkstra's Algorithm
function dijkstra(startNodeId, goalNodeId, adjacencyList, removedEdges = new Set()) {
    var distances = {};
    var previous = {};
    var queue = new FastPriorityQueue((a, b) => a.distance < b.distance);

    // Initialize distances
    for (var nodeId in adjacencyList) {
        distances[nodeId] = Infinity;
    }
    distances[startNodeId] = 0;

    queue.add({ id: startNodeId, distance: 0 });

    while (!queue.isEmpty()) {
        var current = queue.poll();
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
                var edgeId = neighborObj.edgeId;

                // Skip removed edges
                if (removedEdges.has(edgeId)) continue;

                var alt = distances[currentNodeId] + 1; // Assuming all edges have weight 1

                if (alt < distances[neighborId]) {
                    distances[neighborId] = alt;
                    previous[neighborId] = currentNodeId;
                    queue.add({ id: neighborId, distance: alt });
                }
            }
        }
    }

    // No path found
    return null;
}

// Yen's Algorithm
function yenAlgorithm(startNodeId, goalNodeId, adjacencyList, k) {
    var paths = [];
    var potentialPaths = new FastPriorityQueue((a, b) => a.cost < b.cost);

    // Step 1: Find the shortest path
    var firstPath = dijkstra(startNodeId, goalNodeId, adjacencyList);
    if (!firstPath) return paths;
    paths.push({ path: firstPath, cost: firstPath.length });

    for (var i = 1; i < k; i++) {
        var previousPath = paths[i - 1].path;
        for (var j = 0; j < previousPath.length - 1; j++) {
            var spurNode = previousPath[j];
            var rootPath = previousPath.slice(0, j + 1);

            var removedEdges = new Set();

            // Remove edges that are part of previous paths
            for (var pathObj of paths) {
                var path = pathObj.path;
                if (path.length > j && arraysEqual(rootPath, path.slice(0, j + 1))) {
                    var edgeToRemove = getEdgeIdBetweenNodes(path[j], path[j + 1], adjacencyList);
                    if (edgeToRemove) removedEdges.add(edgeToRemove);
                }
            }

            // Calculate spur path from spur node to goal
            var spurPath = dijkstra(spurNode, goalNodeId, adjacencyList, removedEdges);

            if (spurPath) {
                // Combine root path and spur path to form a new path
                var totalPath = rootPath.slice(0, -1).concat(spurPath);
                var totalCost = totalPath.length;
                potentialPaths.add({ path: totalPath, cost: totalCost });
            }
        }

        if (potentialPaths.isEmpty()) break;

        var nextPath = potentialPaths.poll();
        paths.push(nextPath);
    }

    return paths.map(p => p.path);
}

function arraysEqual(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
}

function getEdgeIdBetweenNodes(nodeA, nodeB, adjacencyList) {
    var neighbors = adjacencyList[nodeA];
    if (neighbors) {
        for (var neighborObj of neighbors) {
            if (neighborObj.node === nodeB) {
                return neighborObj.edgeId;
            }
        }
    }
    return null;
}
