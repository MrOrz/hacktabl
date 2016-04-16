import React from 'react';
import {connect} from 'react-redux';
import {loadTable, navigateToTable} from '../actions';

class RowPage extends React.Component {
  componentDidMount() {
    let tableId = this.props.params.tableId;
    this.props.dispatch(navigateToTable(tableId))
    this.props.dispatch(loadTable(tableId))
  }

  render() {
    return this.props.children
  }
};

export default connect()(RowPage);
