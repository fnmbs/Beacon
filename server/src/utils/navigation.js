export const buildGraph = (paths) => {
  const graph = {};
  paths.forEach((path) => {
    const from = String(path.from_location_id);
    const to = String(path.to_location_id);
    const distance = Number(path.distance_meters);

    if (!graph[from]) graph[from] = {};
    if (!graph[to]) graph[to] = {};

    graph[from][to] = distance;
    graph[to][from] = distance;
  });
  return graph;
};

export const findShortestPath = (graph, start, end) => {
  const distances = {};
  const previous = {};
  const nodes = new Set(Object.keys(graph));

  // Initialize
  nodes.forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[start] = 0;

  while (nodes.size) {
    // Get node with smallest distance
    let closestNode = null;
    nodes.forEach((node) => {
      if (closestNode === null || distances[node] < distances[closestNode]) {
        closestNode = node;
      }
    });

    if (distances[closestNode] === Infinity) break;
    nodes.delete(closestNode);

    // Update neighbors
    const neighbors = graph[closestNode];
    for (const neighbor in neighbors) {
      const alt = distances[closestNode] + neighbors[neighbor]; // neighbor distance
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = closestNode;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let u = end;
  while (previous[u]) {
    path.unshift(u);
    u = previous[u];
  }
  if (path.length) path.unshift(start);

  return { path, totalDistance: distances[end] };
};

export const estimateWalkingTime = (distanceMeters) => {
  const walkingSpeed = 1.4; // meters per second
  return distanceMeters / walkingSpeed; // seconds
};
