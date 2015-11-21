import fetch from 'isomorphic-fetch';
import parser from 'hacktabl-parser';
import * as cache from './utils/cache';

export const FETCHING_TABLE = 'FETCHING_TABLE';
export const SET_TABLE = 'SET_TABLE';
export const FETCHING_ERROR = 'FETCHING_ERROR';

function setTable(tableId, tableData) {
  return {
    type: SET_TABLE,
    payload: {
      id: tableId,
      data: tableData
    }
  }
}

function setFetchState(tableId, val) {
  return {
    type: FETCHING_TABLE,
    payload: {
      id: tableId,
      data: val
    }
  };
}

function currentlyFetchingTableId(state){
  return state.fetchingTable;
}

export function fetchAndParseTable(tableId) {
  return dispatch => {
    dispatch(setFetchState(tableId, true));

    return parser(tableId).then(data => {
      // Update cache
      cache.setTable(tableId, data);

      dispatch(setTable(tableId, data));
      dispatch(setFetchState(tableId, false));
    }).catch(error => {
      dispatch({
        type: FETCHING_ERROR,
        error: true,
        payload:{
          id: tableId,
          error
        }
      });
      dispatch(setFetchState(tableId, false));
    });
  };
}

export function loadCache(tableId) {
  let tableData = cache.getTable(tableId);

  if(tableData){
    return setTable(tableId, tableData);
  }
}
