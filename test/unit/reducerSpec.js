import {expect} from 'chai';
import {FETCHING_TABLE, SET_TABLE, FETCHING_ERROR, NAVIGATE_TABLE} from '../../src/actions';
import {tables, currentTableId} from '../../src/reducers';
import assign from 'object-assign';

describe('tables reducer', () => {
  it('should set fetching state on specified table', () => {
    const INITIAL_STATE = {
      table1: {
        isFetching: false, data: 'foo',
        lastError: 'bar', lastFetchedAt: 0
      },
      table2: {
        isFetching: true, data: 'bar',
        lastError: 'bbar', lastFetchedAt: 1
      }
    };

    // Fetching
    //
    expect(tables(INITIAL_STATE, {
      type: FETCHING_TABLE,
      payload: {
        id: 'table1',
        data: true
      }
    })).to.eql(assign({}, INITIAL_STATE, {
      table1: assign({}, INITIAL_STATE.table1, {
        isFetching: true
      })
    }));

    // Fetch successful
    //
    expect(tables(INITIAL_STATE, {
      type: SET_TABLE,
      payload: {
        id: 'table2',
        data: 'new-bar',
        timestamp: 200
      }
    })).to.eql(assign({}, INITIAL_STATE, {
      table2: assign({}, INITIAL_STATE.table2, {
        lastFetchedAt: 200,
        data: 'new-bar',
        lastError: null
      })
    }));

    // Fetch failed
    //
    expect(tables(INITIAL_STATE, {
      type: FETCHING_ERROR,
      payload: {
        id: 'table2',
        data: 'new-error',
        timestamp: 400
      }
    })).to.eql(assign({}, INITIAL_STATE, {
      table2: assign({}, INITIAL_STATE.table2, {
        lastError: 'new-error'
      })
    }));

  });
});

describe('currentTableId reducer', () => {
  it('should set currentTableId', () => {
    expect(currentTableId('', {type: NAVIGATE_TABLE, payload:'FOO'}))
      .to.eql('FOO');
  });
});