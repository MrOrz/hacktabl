import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {Link} from 'react-router';
import {connect} from 'react-redux';

import styles from './table-page.sass';
import {loadTable, navigateToTable} from '../actions';
import {connectToCurrentTable} from '../utils/connect';
import {iterateRows, concatAllParagraphs} from '../utils/traverse';
import Cell from './cell'

function RowHeader(props) {
  let ancestorElem = props.ancestorText ? (
    <small>{props.ancestorText}／</small>
  ) : ''

  return (
    <h5 className={styles.rowHeader} style={{
      transform: `translate3d(${props.scrollLeft}px,0,0)`
    }}>{ancestorElem}{props.rowTitle}</h5>
  )
}

RowHeader.propTypes = {
  ancestorText: PropTypes.string,
  rowTitle: PropTypes.string,
  scrollLeft: PropTypes.number
}

RowHeader = connect(state => state.ui)(RowHeader)

class TablePage extends React.Component {
  componentDidMount() {
    let tableId = this.props.params.tableId;
    this.props.dispatch(navigateToTable(tableId))
    this.props.dispatch(loadTable(tableId));
  }

  render() {
    let rowElems = []
    if(!(this.props.currentTable.data && this.props.currentTable.data.table)) {
      return <div>Loading...</div>
    }

    let lastAncestorText = null

    for(let row of iterateRows(this.props.currentTable.data.table.rows)) {
      let rowTitle = concatAllParagraphs(row.headers[row.headers.length-1])
      let ancestorText = row.headers.slice(0, -1).map(
        paragraphs => concatAllParagraphs(paragraphs)).join('／');

      let cellElems = row.cells.map((cellProps, idx) => <Cell {...cellProps} commentMap={this.props.currentTable.data.table.commentMap} key={idx} />)

      let isDivider = ancestorText === '' || ancestorText !== lastAncestorText

      rowElems.push(
        <div className={`${styles.row} ${isDivider ? styles.isDivider : ''}`} key={`${ancestorText}-${rowTitle}`}>
          <RowHeader ancestorText={ancestorText} rowTitle={rowTitle} />
          <div className={styles.cellContainer}>
            {cellElems}
          </div>
        </div>
      )

      lastAncestorText = ancestorText
    }
    return (
      <div>
        {rowElems}
      </div>
    )
  }
};

export default connectToCurrentTable(TablePage);
