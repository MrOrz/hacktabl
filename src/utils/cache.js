export const MANIFEST_VERSION = '1';
function NOOP(){};

function setTableData(tableId, dataStr) {
  localStorage[tableId] = dataStr;
}

function resetLocalStorage() {
  localStorage.clear();
  localStorage.MANIFEST_VERSION = MANIFEST_VERSION;
}

if(typeof window === 'undefined'){
  exports.getTable = NOOP;
  exports.setTable = NOOP;

}else{

  // Clear localStorage if version does not match.
  //
  if(localStorage.MANIFEST_VERSION !== MANIFEST_VERSION){
    resetLocalStorage();
  }


  exports.getTable = function getTable(tableId) {
    let data = localStorage[tableId];

    if(data){
      data = JSON.parse(data);
    }

    return data;
  }

  exports.setTable = function setTable(tableId, newData) {
    let newDataStr = JSON.stringify(newData);

    try {
      setTableData(tableId, newDataStr);
    } catch (e) { // Probably quota exceeded
      resetLocalStorage();
      setTableData(tableId, newDataStr); // If still errors, just let it throw.
    }
  }
}
