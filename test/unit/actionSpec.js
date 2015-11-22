import {expect} from 'chai';
import { mockStore } from '../utils';
import * as actions from '../../src/actions';

describe('fetchAndParseTable', () => {

  // Helper functions that expects an array of actions.
  //
  function expectActionsAfterDispatch(tableId, expectedActions, injectedParser, done, state = {}){
    actions.__Rewire__('parser', injectedParser);

    let store = mockStore(state, expectedActions, done);
    store.dispatch(actions.fetchAndParseTable(tableId));
  }

  it('should dispatch "FETCHING_TABLE" and "SET_TABLE" in correct order', done => {

    const TABLE_ID = 'FOO';
    const TABLE_DATA = {foo: 'bar'};

    const EXPECTED_ACTIONS = [
      {type: actions.FETCHING_TABLE, payload: {id: TABLE_ID, data: true}},
      {type: actions.SET_TABLE, payload: {id: TABLE_ID, data: TABLE_DATA}},
      {type: actions.FETCHING_TABLE, payload: {id: TABLE_ID, data: false}},
    ];

    const SUCCESS_PARSER = tableId => Promise.resolve(TABLE_DATA);

    expectActionsAfterDispatch(TABLE_ID, EXPECTED_ACTIONS, SUCCESS_PARSER, done);
  });

  it('should dispatch "FETCHING_TABLE" and "FETCHING_ERROR" in correct order', done => {

    const TABLE_ID = 'FOO';
    const ERROR_DATA = {foo: 'bar'};

    // expect() is inside mockStore.
    const EXPECTED_ACTIONS = [
      {type: actions.FETCHING_TABLE, payload: {id: TABLE_ID, data: true}},
      {type: actions.FETCHING_ERROR, error: true, payload: {id: TABLE_ID, error:ERROR_DATA}},
      {type: actions.FETCHING_TABLE, payload: {id: TABLE_ID, data: false}},
    ];

    const FAILING_PARSER = tableId => Promise.reject(ERROR_DATA);

    expectActionsAfterDispatch(TABLE_ID, EXPECTED_ACTIONS, FAILING_PARSER, done);
  });

  afterEach(() => {
    actions.__ResetDependency__('parser');
  });
});

describe('loadCache', () => {
  it('should dispatch "SET_TABLE" with the data returned by cache', () => {
    actions.__Rewire__('cache', {getTable: tableId => ({data: 'foo', timestamp: 0})});
    expect(actions.loadCache('foo')).to.have.property('type', actions.SET_TABLE);
  });
});
