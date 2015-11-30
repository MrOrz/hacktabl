// Global styles
import 'material-design-lite/src/material-design-lite.scss';
import './sass/index.sass';

// Material JS
import 'material-design-lite/material';

import React from 'react';
import ReactDOM from 'react-dom';
import {Router} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {Provider} from 'react-redux';

import * as actions from './actions';
import configureStore from './configure-store';
import route from './route';

// From server-side rendering of script/archive.js
var dehydratedState = window.__dehydrated;

const store = configureStore(dehydratedState);

ReactDOM.render((
  <Provider store={store}>
    <Router history={createBrowserHistory()}>
      {route}
    </Router>
  </Provider>
), document.getElementById('react-root'));