import fetch from 'isomorphic-fetch';
import * as cache from './utils/cache';
var parser = require('hacktabl-parser');

export const FETCHING_TABLE = 'FETCHING_TABLE';
export const SET_TABLE = 'SET_TABLE';
export const FETCHING_ERROR = 'FETCHING_ERROR';
export const NAVIGATE_TABLE = 'NAVIGATE_TABLE';

const setTable = (tableId, tableData, timestamp) => ({
  type: SET_TABLE,
  payload: {
    id: tableId,
    data: tableData,
    timestamp
  }
});

const setFetchState = (tableId, val) => ({
  type: FETCHING_TABLE,
  payload: {
    id: tableId,
    data: val,
    timestamp: Date.now()
  }
});

const setFetchError = (tableId, error) => ({
  type: FETCHING_ERROR,
  error: true,
  payload:{
    id: tableId,
    error,
    timestamp: Date.now()
  }
});

function currentlyFetchingTableId(state){
  return state.fetchingTable;
}

export function fetchAndParseTable(tableId) {
  return dispatch => {
    dispatch(setFetchState(tableId, true));

    return parser(tableId).then(data => {
      let timestamp = Date.now()

      // Update cache
      cache.setTable(tableId, {data, timestamp});

      dispatch(setTable(tableId, data, timestamp));
      dispatch(setFetchState(tableId, false));
    }).catch(error => {
      dispatch(setFetchError(tableId, error));
      dispatch(setFetchState(tableId, false));
    });
  };
}

export function loadCache(tableId) {
  let cached = cache.getTable(tableId);

  if(cached){
    let {data, timestamp} = cached;
    return setTable(tableId, data, timestamp);
  }else{
    return setTable(tableId, {}, 0);
  }
}

export function loadTable(tableId) {
  return (dispatch, getState) => {
    let state = getState();
    let tableState = state.tables && state.tables[tableId];

    // If no state at all, first load from cache
    if(!tableState){
      dispatch(loadCache(tableId));
    }

    // If not fetching this table, fetch the table
    if(!(tableState && tableState.isFetching)) {
      dispatch(fetchAndParseTable(tableId));
    }
  }
}

export function navigateToTable(tableId) {
  return {
    type: NAVIGATE_TABLE,
    payload: tableId
  }
}