import {createStore, applyMiddleware} from 'redux';
import {SET_UI} from './actions'
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';


var createStoreWithMiddleware

if(DEBUG){
  let loggerMiddleware = createLogger({
    // Don't log SET_UI actions, since they are too often
    //
    predicate: (getState, action) => action.type !== SET_UI
  })
  createStoreWithMiddleware = applyMiddleware(
  thunk, loggerMiddleware)(createStore);
}else{
  createStoreWithMiddleware = applyMiddleware(
  thunk)(createStore);
}

export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}
