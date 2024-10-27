onmessage = function (e) {
    var { fromId, toId, adjacencyList, maxAttempts, maxSteps } = e.data;

    var bestPath = [];
    var attempt = 0;

    while (attempt < maxAttempts) {
        var path = randomWalk(fromId, toId, adjacencyList, maxSteps);
        if (path.length > bestPath.length) {
            bestPath = path;
        }
        attempt++;
    }

    if (bestPath.length === 0) {
        postMessage({ error: 'Nenhum caminho encontrado entre os pontos selecionados.' });
        return;
    }

    postMessage({ path: bestPath });
};

function randomWalk(startId, goalId, adjacencyList, maxSteps) {
    var path = [startId];
    var visited = new Set();
    visited.add(startId);

    var currentNode = startId;
    var steps = 0;

    while (currentNode !== goalId && steps < maxSteps) {
        var neighbors = adjacencyList[currentNode];
        var unvisitedNeighbors = neighbors.filter(n => !visited.has(n.node));

        if (unvisitedNeighbors.length === 0) {
            // Dead end, backtrack
            break;
        }

        // Choose a random neighbor
        var randomNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

        currentNode = randomNeighbor.node;
        path.push(currentNode);
        visited.add(currentNode);
        steps++;
    }

    if (currentNode === goalId) {
        return path;
    } else {
        return [];
    }
}
