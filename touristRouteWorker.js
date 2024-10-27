// touristRouteWorker.js

onmessage = function(e) {
    console.log('touristRouteWorker.js is running');

    var { fromId, toId, adjacencyList } = e.data;

    var maxDepth = 10; // Adjust as needed
    var found = false;
    var bestPath = [];
    var visitedEdges = {};

    function dfs(currentNode, targetNode, depth, path) {
        if (depth > maxDepth) return;
        if (currentNode === targetNode) {
            if (path.length > bestPath.length) {
                bestPath = path.slice();
                found = true;
            }
            return;
        }

        var neighbors = adjacencyList[currentNode];
        if (!neighbors) return;

        for (var i = 0; i < neighbors.length; i++) {
            var neighborObj = neighbors[i];
            var neighbor = neighborObj.node;
            var edgeId = neighborObj.edgeId;

            if (!visitedEdges[edgeId]) {
                visitedEdges[edgeId] = true;
                path.push({ node: neighbor, edgeId: edgeId });
                dfs(neighbor, targetNode, depth + 1, path);
                path.pop();
                visitedEdges[edgeId] = false;
            }
        }
    }

    dfs(fromId, toId, 0, [{ node: fromId, edgeId: null }]);

    if (!found) {
        postMessage({ error: 'Nenhum caminho encontrado entre os pontos selecionados.' });
        return;
    }

    postMessage({ bestPath: bestPath });
};
