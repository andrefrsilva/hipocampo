// touristRouteWorker.js

onmessage = function(e) {
    var { fromId, toId, adjacencyList } = e.data;

    var k = 3; // Number of paths to find
    var paths = yenAlgorithm(fromId, toId, adjacencyList, k);

    if (paths.length > 1) {
        // Choose the second shortest path as the tourist route
        var touristPath = paths[1];

        postMessage({ path: touristPath });
    } else if (paths.length > 0) {
        // Only one path found, use it
        var touristPath = paths[0];
        postMessage({ path: touristPath });
    } else {
        postMessage({ error: 'Não foi possível encontrar um caminho turístico mais longo.' });
    }
};

// Include the PriorityQueue class here

// Simple Priority Queue implementation
class PriorityQueue {
    constructor(comparator = (a, b) => a.cost < b.cost) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    peek() {
        return this._heap[0];
    }
    push(value) {
        this._heap.push(value);
        this._siftUp();
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._greater(node, Math.floor((node - 1) / 2))) {
            this._swap(node, Math.floor((node - 1) / 2));
            node = Math.floor((node - 1) / 2);
        }
    }
    _siftDown() {
        let node = 0;
        while (
            (node * 2 + 1 < this.size() && this._greater(node * 2 + 1, node)) ||
            (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node))
        ) {
            let maxChild = (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node * 2 + 1))
                ? node * 2 + 2
                : node * 2 + 1;
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}

// Dijkstra's Algorithm
function dijkstra(startNodeId, goalNodeId, adjacencyList, removedEdges = new Set()) {
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
                var edgeId = neighborObj.edgeId;

                // Skip removed edges
                if (removedEdges.has(edgeId)) continue;

                var alt = distances[currentNodeId] + 1; // Assuming all edges have weight 1

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

// Yen's Algorithm
function yenAlgorithm(startNodeId, goalNodeId, adjacencyList, k) {
    var paths = [];
    var potentialPaths = new PriorityQueue((a, b) => a.cost < b.cost);

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
                if (!pathExistsInPaths(paths, totalPath)) {
                    potentialPaths.push({ path: totalPath, cost: totalCost });
                }
            }
        }

        if (potentialPaths.isEmpty()) break;

        var nextPath = potentialPaths.pop();
        paths.push(nextPath);
    }

    return paths.map(p => p.path);
}

function arraysEqual(a1, a2) {
    if (a1.length !== a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
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

function pathExistsInPaths(paths, newPath) {
    for (var pathObj of paths) {
        if (arraysEqual(pathObj.path, newPath)) {
            return true;
        }
    }
    return false;
}
