export function concatAllRuns(runs) {
  return runs.reduce((sum, run) => {
    if(run.runs){ // Nested runs, like hyperlinks
      return sum + concatAllRuns(run.runs);
    }

    return sum + run.text;
  }, '');
}

export function flatternParagraph (paragraph) {
  return concatAllRuns(paragraph.children);
}

export function concatAllParagraphs (paragraphs, delimiter=' '){
  return paragraphs.map(p => flatternParagraph(p)).join(delimiter);
}

export function* iterateRows(rows) {

}

export function* iterateColumnHeaders(columns) {
  if(columns.length === 0) return;

  let dfsContexts = columns.map(column => ({level: 0, column})).reverse();
  let dfsStack = []; // stack of contexts, mimicing recursive function calls.

  while(dfsContexts.length > 0){
    let context = dfsContexts.pop();
    let column = context.column;
    let level = context.level;

    // dfsStack levels should be strictly increasing
    //
    while(dfsStack.length > 0 && dfsStack[dfsStack.length-1].level >= level){
      dfsStack.pop();
    }

    // Only record contexts with non-empty columns in dfsStack
    //
    let isEmpty = column.paragraphs.length === 1 && column.paragraphs[0].children.length === 0;
    if(!isEmpty){
      dfsStack.push(context);
    }

    if(column.children){
      // Go deeper
      //
      dfsContexts.push.apply(dfsContexts, column.children.map(column => ({level:level+1, column})).reverse());
    }else{
      // At leaf header, give out paragraphs for each column
      //
      yield dfsStack.map(context => context.column.paragraphs);
    }
  }
}