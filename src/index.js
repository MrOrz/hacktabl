// Global styles
import 'material-design-lite/src/material-design-lite.scss';
import './sass/index.sass';

// Material JS
import 'material-design-lite/material';

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './components/app';
import HomePage from './components/home-page';
import TablePage from './components/table-page';
import RowPage from './components/row-page';
import ItemPage from './components/item-page';

ReactDOM.render((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}>
      <IndexRoute component={HomePage} />
      <Route path=":tableId">
        <IndexRoute component={TablePage} />
        <Route path=":rowId" component={RowPage} />
        <Route path="item/:itemId" component={ItemPage} />
      </Route>
    </Route>
  </Router>
), document.getElementById('react-root'));