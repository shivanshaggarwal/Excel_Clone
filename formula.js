for( let i=0; i<rows; i++){
    for (let j=0; j<cols; j++){
        let cell = document.querySelector(`.cells[rid="${i}"][cid="${j}"]`);
        cell.addEventListener("blur", (e) => {
            let address = addressBar.value;
            let [activeCell,cellProp] = activecell(address);
            let enteredData = activeCell.innerText;
            if (enteredData === cellProp.value) return;

            cellProp.value = enteredData;

            // if data modified remove parent child relation, formula empty, update children with new hardcoded (modified) value;

            removeChildFromParent(cellProp.formula);
            cellProp.formula = "";
            updateChildrenCells(address);            
        })
    }
}

let formulaBar = document.querySelector(".formula-bar")
formulaBar.addEventListener("keydown", async (e) =>{
    let inputFormula = formulaBar.value;
    if(e.key === 'Enter' && inputFormula){
        
        
        // If change in formula, break old Parent child relation, eval new formula, add new parent-child relation.
        let address = addressBar.value;
        let [cell, cellProp] = activecell(address);
        if(inputFormula !== cellProp.formula) removeChildFromParent(cellProp.formula);
        
        addChildToGraphComponent(inputFormula,address);
        // Check formula is cyclic or not then evaluate and update
        let cycleResponse = isGraphCyclic(graphComponentMatrix);
        console.log("cycleResponse" , cycleResponse)
        if (cycleResponse){
            // alert("Your formula is cyclic");
            let response = confirm("Your graph is cyclic. Do you want to trace your path?");
            while (response === true){
                // Keep on tracking color until user is satisfied
                await isGraphCyclicTracePath(graphComponentMatrix, cycleResponse);
                response = confirm("Your graph is cyclic. Do you want to trace your path?");
            }
            removeChildFromGraphComponent(inputFormula,address);
            return;
        }
        let evaluatedValue = evaluateFormula(inputFormula);

        //TO update UI and cellProp in db
        setCellUiAndCellProp(evaluatedValue,inputFormula,address);
        addChildToParent(inputFormula);
        console.log(sheetDB);
        updateChildrenCells(address);
    }
})

function addChildToGraphComponent(formula, childAddress){
    let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for (let i=0; i<encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >=65 && asciiValue <=90){
            let [prid,pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            
            graphComponentMatrix[prid][pcid].push([crid,ccid]);
        }
    }
}

function removeChildFromGraphComponent(formula, childAddress){
    let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split("");
    for (let i=0; i<encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >=65 && asciiValue <=90){
            let [prid,pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);

            graphComponentMatrix[prid][pcid].pop();
        }
    }
}

function updateChildrenCells(parentAddress) {
    let [parentCell,parentCellProp] = activecell(parentAddress)
    let childrenList = parentCellProp.children.split(",");
    // console.log("children are", childrenList);
    for (let i=1; i<childrenList.length; i++){
        let childAddress = childrenList[i];
        // console.log("childaddress is", childAddress);
        let [childCell,childCellProp] = activecell(childAddress);
        let childFormula = childCellProp.formula;

        let evaluatedValue = evaluateFormula(childFormula);
        setCellUiAndCellProp(evaluatedValue,childFormula,childAddress);
        updateChildrenCells(childAddress);
    }
}

function addChildToParent(formula){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ") ;
    for (let i=0; i<encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >=65 && asciiValue <=90){
            let [parentCell,parentCellProp] = activecell(encodedFormula[i]);
            parentCellProp.children += "," + childAddress;
        }
    }
}

function removeChildFromParent(formula){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for (let i=0; i<encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >=65 && asciiValue <=90){
            let [parentCell, parentCellProp] = activecell(encodedFormula[i]);
            let idx = parentCellProp.children.indexOf(childAddress);
            parentCellProp.children = parentCellProp.children.slice(idx-1,1);
        }
    }
}

function evaluateFormula(formula){
    let encodedFormula = formula.split(" "); 
    for (let i=0; i<encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >=65 && asciiValue <=90){
            let [cell,cellProp] = activecell(encodedFormula[i]);
            encodedFormula[i] = cellProp.value;
        }
    }
    let decodedFormula = encodedFormula.join(" ");
    return eval(decodedFormula);
}

function setCellUiAndCellProp(evaluatedValue,formula,address){
    let [cell,cellProp] = activecell(address);

    //UI update
    cell.innerText = evaluatedValue;
    //DB update
    cellProp.value = evaluatedValue;
    cellProp.formula = formula;
}