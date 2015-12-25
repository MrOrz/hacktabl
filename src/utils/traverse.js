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

// Traverse nested hacktabl header cells, which is in the form of:
// {paragraphs: [...], children: [...(only available in non-leaf header cells)...]]}
//
function* iterateHeaders(nestedHeaders) {
  if(nestedHeaders.length === 0) return;

  let dfsContexts = nestedHeaders.map(header => ({level: 0, header})).reverse();
  let dfsStack = []; // stack of contexts, mimicing recursive function calls.

  while(dfsContexts.length > 0){
    let context = dfsContexts.pop();
    let header = context.header;
    let level = context.level;

    // dfsStack levels should be strictly increasing
    //
    while(dfsStack.length > 0 && dfsStack[dfsStack.length-1].level >= level){
      dfsStack.pop();
    }

    // Only record contexts with non-empty headers (which might be caused by rowspan / colspan) in dfsStack.
    // However if the empty header is top-level, we should still add the header because
    // users might forgotten to give a header
    //
    let isEmpty = header.paragraphs.length === 1 && header.paragraphs[0].children.length === 0;
    if(!isEmpty || level === 0){
      dfsStack.push(context);
    }

    if(header.children){
      // Go deeper
      //
      dfsContexts.push.apply(dfsContexts, header.children.map(header => ({level:level+1, header})).reverse());
    }else{
      // At leaf header, give out header cells for each traversal path
      //
      yield dfsStack.map(context => context.header);
    }
  }
}

// Returns an array of:
//  headers: array of paragraphs(which is also an arry) of header cells of each level.
//  cells: an array of the data cells
//
// For example please see unit test.
//
export function* iterateRows(rows) {
  for(let headers of iterateHeaders(rows)) {
    let headerParagraphs = headers.map(header => header.paragraphs);
    let cells = headers[headers.length-1].cells;
    yield {headers: headerParagraphs, cells};
  }
}

// Returns an array of paragraphs(which is also an array) of header cells of each level.
//
// For example please see unit test.
//
export function* iterateColumnHeaders(columns) {
  for(let headers of iterateHeaders(columns)){
    yield headers.map(header => header.paragraphs);
  }
}