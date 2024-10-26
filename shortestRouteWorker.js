// shortestRouteWorker.js

onmessage = function(e) {
    var { fromId, toId, adjacencyList } = e.data;

    // BFS variables
    var queue = [];
    var visited = {};
    var predecessor = {};

    queue.push(fromId);
    visited[fromId] = true;

    // BFS
    while (queue.length > 0) {
        var currentNode = queue.shift();

        if (currentNode === toId) {
            break;
        }

        var neighbors = adjacencyList[currentNode];
        if (neighbors) {
            neighbors.forEach(function(neighborObj) {
                var neighbor = neighborObj.node;
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    predecessor[neighbor] = currentNode;
                    queue.push(neighbor);
                }
            });
        }
    }

    // Reconstruct the path
    var path = [];
    var current = toId;

    if (!visited[toId]) {
        postMessage({ error: 'Nenhum caminho encontrado entre os pontos selecionados.' });
        return;
    }

    while (current !== undefined) {
        path.unshift(current);
        current = predecessor[current];
    }

    postMessage({ path: path });
};
