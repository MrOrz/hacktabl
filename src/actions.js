import fetch from 'isomorphic-fetch';
import parser from 'hacktabl-parser';
import * as cache from './utils/cache';

export const FETCHING_TABLE = 'FETCHING_TABLE';
export const SET_TABLE = 'SET_TABLE';
export const FETCHING_ERROR = 'FETCHING_ERROR';

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
  let {data, timestamp} = cache.getTable(tableId);

  if(data){
    return setTable(tableId, data, timestamp);
  }
}
