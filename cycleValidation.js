let collectedGraphComponent = []
// let graphComponentMatrix = [];

// for (let i=0; i<rows; i++){
//     let row = []
//     for (let j=0; j<cols; j++){
//         // WHy pushing array? More than 1 child relation(dependency) 
//         row.push([])
//     }
//     graphComponentMatrix.push(row);
// }

function isGraphCyclic(graphComponentMatrix){
    // Dependency -> visited, dfsvisited (2darray)
    let visited = [];
    let dfsVisited = [];

    for (let i=0; i<rows; i++){
        let visitedRow = []
        let dfsVisitedRow = []
        for (let j=0; j<cols; j++){
            visitedRow.push(false);
            dfsVisitedRow.push(false);
        }
        visited.push(visitedRow);
        dfsVisited.push(dfsVisitedRow);
    }

    for(let i=0; i<rows; i++){
        for (let j=0; j<cols; j++){
            if (visited[i][j] === false){
                let response = dfsCycleDetection (graphComponentMatrix, i, j, visited, dfsVisited);
                if (response == true) return [i,j];
            }
            
        }
    }

    return null;
}


// Start -> vis(True)  dfsvis(True)
// End -> dfsVis(False)
// If vis[i][j] == True -> already explored path, so go back no use to explore again
// Cycle detectio condition -> if vis[i][j] == true && dfsVis[i][j] == true -> cycle

function dfsCycleDetection(graphComponentMatrix, srcr, srcc,visited, dfsVisited) {
    visited[srcr][srcc] = true;
    dfsVisited[srcr][srcc] = true;

    for (let children=0; children<graphComponentMatrix[srcr][srcc].length; children++){
        let [crid,ccid] = graphComponentMatrix[srcr][srcc][children];
        if(visited[crid][ccid] === false){
            let response = dfsCycleDetection(graphComponentMatrix, crid,ccid, visited, dfsVisited);
            if (response === true) return true; //found cycle so return immediately so need to explore more
        }
        else if (visited[crid][ccid] === true && dfsVisited[crid][ccid] === true) {
            //found cycle so return immediately so need to explore more
            return true;
        }
    }

    dfsVisited[srcr][srcc] = false;
    return false;
}







