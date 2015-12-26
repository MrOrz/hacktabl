import {combineReducers} from 'redux';
import {FETCHING_TABLE, SET_TABLE, FETCHING_ERROR, NAVIGATE_TABLE, SET_UI} from './actions';

function table(state = {
  isFetching: false,
  lastFetchedAt: 0,
  data: {},
  lastError: null
}, action) {
  switch(action.type){
    case FETCHING_TABLE:
      return Object.assign({}, state, {isFetching: action.payload.data});
    case FETCHING_ERROR:
      return Object.assign({}, state, {
        lastError: action.payload.data
      });

    case SET_TABLE:
      return Object.assign({}, state, {
        lastFetchedAt: action.payload.timestamp,
        lastError: null,
        data: action.payload.data
      });
  }

}

export function tables(state={}, action) {

  switch(action.type){
    case FETCHING_TABLE:
    case FETCHING_ERROR:
    case SET_TABLE:
      let tableId = action.payload.id;
      return Object.assign({}, state, {
        [tableId]: table(state[tableId], action)
      });

    default:
      return state;
  }
}

export function currentTableId(state='', action) {
  switch(action.type){
    case NAVIGATE_TABLE:
      return action.payload;
    default:
      return state;
  }
}

export function ui(state={
  scrollLeft: 0,
  scrollTop: 0,
  scrollingTo: null,
  headerHeight: 0,
  activeRowId: -1
}, action) {
  switch(action.type){
    case SET_UI:
      return Object.assign({}, state, action.payload)
    default:
      return state
  }
}

var rootReducer = combineReducers({
  tables,
  currentTableId,
  ui
});

export default rootReducer;
