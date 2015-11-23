import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import styles from './table-page.sass';
import {loadTable} from '../actions';

class TablePage extends React.Component {
  componentDidMount() {
    this.props.dispatch(loadTable(this.props.params.tableId));
  }

  render() {
    const tableData = JSON.stringify(this.props.tables, null, '  ')
    return (
      <div>
        <h1>Table {this.props.params.tableId}</h1>
        <pre>{tableData}</pre>
      </div>
    )
  }
};

export default connect(state => state)(TablePage);