import {createStore, applyMiddleware, compose} from 'redux';
import {SET_UI} from './actions'
import thunk from 'redux-thunk';
import rootReducer from './reducers';

var createStoreWithMiddleware

if(DEBUG){
  createStoreWithMiddleware = compose(
    applyMiddleware(thunk),
     window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore);
}else{
  createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
}

export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}
