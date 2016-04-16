import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {TABLE_WITH_META_TYPE} from '../utils/types'
import styles from './table-page.sass';
import {loadTable, navigateToTable, setUIState} from '../actions';
import {connectToCurrentTable} from '../utils/connect';
import {iterateRows, concatAllParagraphs} from '../utils/traverse';
import Cell from './cell'

class RowHeader extends React.Component {
  render() {
    let ancestorElem = this.props.ancestorText ? (
      <small>{this.props.ancestorText}／</small>
    ) : ''

    return (
      <h5 className={styles.rowHeader} style={{
        transform: `translate3d(${this.props.scrollLeft}px,0,0)`
      }}>{ancestorElem}{this.props.rowTitle}</h5>
    )
  }
}

RowHeader.propTypes = {
  ancestorText: PropTypes.string,
  rowTitle: PropTypes.string,
  scrollLeft: PropTypes.number
}

RowHeader = connect(state => state.ui)(RowHeader)

class TablePage extends React.Component {
  constructor() {
    super()
    this._handleScroll = this._handleScroll.bind(this)
  }

  componentDidMount() {
    let tableId = this.props.params.tableId;
    this.props.dispatch(navigateToTable(tableId))
    this.props.dispatch(loadTable(tableId))
  }

  render() {
    let rowElems = []
    if(!(this.props.currentTable.data && this.props.currentTable.data.table)) {
      return <div>Loading...</div>
    }

    let lastAncestorText = null

    let rowId = 0
    for(let row of iterateRows(this.props.currentTable.data.table.rows)) {
      let rowTitle = concatAllParagraphs(row.headers[row.headers.length-1])
      let ancestorText = row.headers.slice(0, -1).map(
        paragraphs => concatAllParagraphs(paragraphs)).join('／');

      let cellElems = row.cells.map((cellProps, idx) => <Cell {...cellProps} commentMap={this.props.currentTable.data.table.commentMap} key={idx} />)

      let isDivider = ancestorText === '' || ancestorText !== lastAncestorText

      rowElems.push(
        <div className={`${styles.row} ${isDivider ? styles.isDivider : ''}`}
             key={`${ancestorText}-${rowTitle}`} ref={`row${rowId}`}>
          <RowHeader ancestorText={ancestorText} rowTitle={rowTitle}/>
          <div className={styles.cellContainer}>
            {cellElems}
          </div>
        </div>
      )
      rowId += 1

      lastAncestorText = ancestorText
    }
    return (
      <div>
        {rowElems}
      </div>
    )
  }

  componentWillUpdate(nextProps) {
    if(this.props.scrollTop !== nextProps.scrollTop){
      this._handleScroll()
    }

    if(this.props.scrollingTo !== nextProps.scrollingTo) {
      this._scrollTo(nextProps.scrollingTo)
    }
  }

  _scrollTo(idx) {
    let sectionElem = findDOMNode(this.refs[`row${idx}`])
    sectionElem.scrollIntoView()
  }

  _handleScroll() {
    let idx = 0
    let sectionRef

    while(sectionRef = this.refs[`row${idx}`]) {
      let isReached = findDOMNode(sectionRef).getBoundingClientRect().top <= this.props.headerHeight

      if(!isReached) {
        this.props.dispatch(setUIState({
          activeRowId: idx-1
        }))
        break
      }
      idx += 1
    }
  }
};

TablePage.propTypes = {
  currentTable: TABLE_WITH_META_TYPE.isRequired,
  scrollTop: PropTypes.number,
  headerHeight: PropTypes.number,
  scrollingTo: PropTypes.any
}

export default connect(state => {
  let currentTable = state.tables[state.currentTableId] || {}
  return {
    currentTable,
    scrollTop: state.ui.scrollTop,
    headerHeight: state.ui.headerHeight,
    scrollingTo: state.ui.scrollingTo
  }
})(TablePage);
