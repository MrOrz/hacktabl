import React from 'react';
import {Link} from 'react-router';
import styles from './table-page.sass';

export default class TablePage extends React.Component {
  render() {
    return (
      <div>
        <h1>Table {this.props.params.tableId}</h1>
        <Link to="/president2017">president2017</Link>
        <Link to="/president2016">president2016</Link>
      </div>
    )
  }
};