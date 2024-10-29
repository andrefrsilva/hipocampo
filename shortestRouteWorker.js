// shortestRouteWorker.js

onmessage = function(e) {
    var { startNodeId, goalNodeId, adjacencyList } = e.data;

    var path = dijkstra(startNodeId, goalNodeId, adjacencyList);

    if (path) {
        postMessage({ path: path });
    } else {
        postMessage({ error: 'Nenhum caminho encontrado entre os pontos selecionados.' });
    }
};

// Dijkstra's Algorithm
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

// Simple Priority Queue implementation
class PriorityQueue {
    constructor(comparator = (a, b) => a.distance < b.distance) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() { return this._heap.length; }
    isEmpty() { return this.size() === 0; }
    peek() { return this._heap[0]; }
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
