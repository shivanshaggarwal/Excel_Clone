// for delay wait purpose
function colorPromise() {
    return new Promise ((resolve, reject) => {
        setTimeout(() => {
            resolve();
        },1000)
    })
}

async function isGraphCyclicTracePath(graphComponentMatrix, cycleResponse){
    let [srcr, srcc] = cycleResponse;
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

    // for(let i=0; i<rows; i++){
    //     for (let j=0; j<cols; j++){
    //         if (visited[i][j] === false){
    //             let response = dfsCycleDetection (graphComponentMatrix, i, j, visited, dfsVisited);
    //             if (response == true) return true;
    //         }
            
    //     }
    // }

    let response = await dfsCycleDetectionTracePath(graphComponentMatrix, srcr, srcc, visited, dfsVisited);
    if (response === true) return Promise.resolve(true); 


    return Promise.resolve(false); 
}


// Coloring cells for tracking 
async function dfsCycleDetectionTracePath(graphComponentMatrix, srcr, srcc,visited, dfsVisited) {
    visited[srcr][srcc] = true;
    dfsVisited[srcr][srcc] = true;

    let cell = document.querySelector(`.cells[rid="${srcr}"][cid="${srcc}"]`);
    cell.style.backgroundColor = "lightblue";
    await colorPromise(); //1sec finished

    for (let children=0; children<graphComponentMatrix[srcr][srcc].length; children++){
        let [crid,ccid] = graphComponentMatrix[srcr][srcc][children];
        if(visited[crid][ccid] === false){
            let response = await dfsCycleDetectionTracePath(graphComponentMatrix, crid,ccid, visited, dfsVisited);
            if (response === true) {
                cell.style.backgroundColor = "transparent";
                await colorPromise(); //1sec finished
                return Promise.resolve(true); 
            }
        }
        else if (visited[crid][ccid] === true && dfsVisited[crid][ccid] === true) {
            let cyclicCell = document.querySelector(`.cells[rid="${crid}"][cid="${ccid}"]`);
            cyclicCell.style.backgroundColor = "lightsalmon";
            await colorPromise(); //1sec finished
            cyclicCell.style.backgroundColor = "transparent";
            await colorPromise(); //1sec finished
            cell.style.backgroundColor = "transparent";
            return Promise.resolve(true); 
        }
    }

    dfsVisited[srcr][srcc] = false;
    return Promise.resolve(false); 
}
