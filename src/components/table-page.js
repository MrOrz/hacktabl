import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import styles from './table-page.sass';
import {loadTable, navigateToTable} from '../actions';
import {connectToCurrentTable} from '../utils/connect';
import {iterateRows, concatAllParagraphs} from '../utils/traverse';
import {TABLE_CELL_PROPS} from '../utils/types'

class Cell extends React.Component {
  render() {
    return (
      <div className={styles.cell}>
        <pre>
          {JSON.stringify(this.props, null, '  ')}
        </pre>
      </div>
    )
  }
}

Cell.propTypes = TABLE_CELL_PROPS

class TablePage extends React.Component {
  componentDidMount() {
    let tableId = this.props.params.tableId;
    this.props.dispatch(navigateToTable(tableId))
    this.props.dispatch(loadTable(tableId));
  }

  render() {
    let rowElems = []
    if(!this.props.currentTable.data) {
      return <div>Loading...</div>
    }

    let lastDividerText = null
    let titlePart = null
    for(let row of iterateRows(this.props.currentTable.data.table.rows)) {
      let rowTitle = concatAllParagraphs(row.headers[row.headers.length-1])
      let dividerText = row.headers.slice(0, -1).map(
        paragraphs => concatAllParagraphs(paragraphs)).join('／');

      if(row.headers.length > 1 && dividerText !== lastDividerText) {
        titlePart = (
          <h6 className={styles.divider}>
            {dividerText}
          </h6>
        )

        lastDividerText = dividerText
      }else{
        titlePart = null
      }

      let cellElems = row.cells.map((cellProps, idx) => <Cell {...cellProps} key={idx} />)

      rowElems.push(
        <div className={styles.row} key={`${dividerText}-${rowTitle}`}>
          {titlePart}
          <h5>{rowTitle}</h5>
          <div className={styles.cellContainer}>
            {cellElems}
          </div>
        </div>
      )
    }
    return (
      <div>
        {rowElems}
      </div>
    )
  }
};

export default connectToCurrentTable(TablePage);