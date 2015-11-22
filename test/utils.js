import {expect} from 'chai';
import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const middlewares = [ thunk ];

// Creates a mock of Redux store with middleware.
//
// Ref: http://rackt.org/redux/docs/recipes/WritingTests.html
//
export function mockStore(getState, expectedActions, done) {
  if (!Array.isArray(expectedActions)) {
    throw new Error('expectedActions should be an array of expected actions.')
  }
  if (typeof done !== 'undefined' && typeof done !== 'function') {
    throw new Error('done should either be undefined or function.')
  }

  function mockStoreWithoutMiddleware() {
    let hasDoneBefore = false;

    return {
      getState() {
        return typeof getState === 'function' ?
          getState() :
          getState
      },

      dispatch(action) {
        // Do nothing if it has been done before.
        //
        if(hasDoneBefore){return;}

        const expectedAction = expectedActions.shift()

        try {
          // Remove timestamp in the payload
          //
          if(action.payload && action.payload.timestamp){
            delete action.payload.timestamp;
          }

          expect(action).to.eql(expectedAction);

          if (done && !expectedActions.length) {
            done()
            hasDoneBefore = true;
          }
          return action
        } catch (e) {
          done(e)
          hasDoneBefore = true;
        }
      }
    }
  }

  const mockStoreWithMiddleware = applyMiddleware(
    ...middlewares
  )(mockStoreWithoutMiddleware)

  return mockStoreWithMiddleware()
}
