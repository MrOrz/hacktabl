import {combineReducers} from 'redux';
import {FETCHING_TABLE, SET_TABLE, FETCHING_ERROR} from './actions';
import assign from 'object-assign';

function table(state = {
  isFetching: false,
  lastFetchedAt: 0,
  data: {},
  lastError: null
}, action) {
  switch(action.type){
    case FETCHING_TABLE:
      return assign({}, state, {isFetching: action.payload.data});
    case FETCHING_ERROR:
      return assign({}, state, {
        lastError: action.payload.data
      });

    case SET_TABLE:
      return assign({}, state, {
        lastFetchedAt: action.payload.timestamp,
        lastError: null,
        data: action.payload.data
      });
  }

}

export function tables(state={}, action) {
  let tableId = action.payload.id;

  switch(action.type){
    case FETCHING_TABLE:
    case FETCHING_ERROR:
    case SET_TABLE:
      return assign({}, state, {
        [tableId]: table(state[tableId], action)
      });

    default:
      return state;
  }
}

var rootReducer = combineReducers({
  tables
});

export default rootReducer;
