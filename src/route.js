import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from './components/app';
import HomePage from './components/home-page';
import TablePage from './components/table-page';
import RowPage from './components/row-page';
import AboutPage from './components/about-page';
import ItemPage from './components/item-page';
import LoaderPage from './components/loader-page';

const route = (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path=":tableId" component={LoaderPage}>
      <IndexRoute component={TablePage} />
      <Route path="about" component={AboutPage} />
      <Route path=":rowId" component={RowPage} />
      <Route path="item/:itemId" component={ItemPage} />
    </Route>
  </Route>
);

export default route;
