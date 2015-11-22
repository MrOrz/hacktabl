import React from 'react';
import styles from './table-page.sass';

export default class TablePage extends React.Component {
  render() {
    return (
      <div>Table {this.props.params.tableId}</div>
    )
  }
};