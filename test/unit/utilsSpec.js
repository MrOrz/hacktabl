import {expect} from 'chai';
import {spy} from 'sinon';
import assign from 'object-assign';

const FILE_UNDER_TEST = '../../src/utils/cache';

describe('cache', () => {
  let cache;

  before(() => {
    const MANIFEST_VERSION = require(FILE_UNDER_TEST).MANIFEST_VERSION;

    // Pass browser test required by utils/cache
    global.window = {};

    // Mock localStorage
    //
    const fakeLocalStorage = {
      clear: function clear() {
        global.localStorage = assign({}, fakeLocalStorage);
      },
      MANIFEST_VERSION
    };
    fakeLocalStorage.clear();

    // Force reload utils/cache
    //
    delete require.cache[require.resolve(FILE_UNDER_TEST)];
    cache = require(FILE_UNDER_TEST);
  });

  it('should be able to load from cache', () => {
    const TABLE_ID = 'FOO';
    localStorage[TABLE_ID] = '{"foo": "bar"}';

    expect(cache.getTable(TABLE_ID)).to.eql({foo: 'bar'});
  });

  it('should be able to set cache then load cache', () => {
    const TABLE_ID = 'FOO2';
    const DATA = {fooo: "barr"};
    cache.setTable(TABLE_ID, DATA);

    expect(cache.getTable(TABLE_ID)).to.eql(DATA);
  });

  after(() => {
    delete global.window;
    delete global.localStorage;
  });
});