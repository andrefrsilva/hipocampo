onmessage = function(e) {
    var { startNodeId, goalNodeId, adjacencyList } = e.data;

    var queue = [];
    var visited = new Set();
    var predecessor = {};

    queue.push(startNodeId);
    visited.add(startNodeId);

    while (queue.length > 0) {
        var currentNode = queue.shift();

        if (currentNode === goalNodeId) {
            var path = [];
            var node = goalNodeId;

            while (node !== undefined) {
                path.unshift(node);
                node = predecessor[node];
            }
            postMessage({ path: path });
            return;
        }

        var neighbors = adjacencyList[currentNode];
        if (neighbors) {
            for (var neighborObj of neighbors) {
                var neighborId = neighborObj.node;

                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    predecessor[neighborId] = currentNode;
                    queue.push(neighborId);
                }
            }
        }
    }

    postMessage({ error: 'Nenhum caminho encontrado entre os pontos selecionados.' });
};
