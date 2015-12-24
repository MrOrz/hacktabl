import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import styles from './table-page.sass';
import {loadTable, navigateToTable} from '../actions';
import {connectToCurrentTable} from '../utils/connect';
import {iterateRows, concatAllParagraphs} from '../utils/traverse';
import {TABLE_CELL_PROPS, RUN_PROPS, HYPERLINK_PROPS, PARAGRAPH_PROPS} from '../utils/types'

class Run extends React.Component {
  render() {
    let style = {}
    let classNames = []

    if(true) { // config.HIGHLIGHT
      if(this.props.isB) {style.fontWeight = 'bold'}
      if(this.props.isU) {style.textDecoration = 'underline'}
      if(this.props.isI) {style.fontStyle = 'italic'}
    }

    if(this.props.commentIds.length) {
      classNames.push(styles.hasComment)
    }

    return (
      <span className={classNames.join(' ')} style={style}>{this.props.text}</span>
    )
  }
}

Run.propTypes = RUN_PROPS
Run = connect(state => ((state.tables[state.currentTableId]||{}).config || {}))(Run)

class Hyperlink extends React.Component {
  render() {
    let runElems = this.props.runs.map((run, id) => (
      <Run {...run} key={id} />
    ))
    return (
      <a href={this.props.href}>{runElems}</a>
    )
  }
}

Hyperlink.propTypes = HYPERLINK_PROPS

class Paragraph extends React.Component {
  render () {
    let childElems = this.props.children.map((child, idx) => {
      if(child.href) {
        return <Hyperlink {...child} key={idx} />
      } else {
        return <Run {...child} key={idx} />
      }
    })

    return <div>{childElems}</div>
  }
}

Paragraph.propTypes = PARAGRAPH_PROPS

class Cell extends React.Component {
  render() {
    let summaryParagraphElem = null
    if(this.props.summaryParagraphs.length>0 &&
       this.props.summaryParagraphs[0].children.length>0){
      let pElems = this.props.summaryParagraphs.map((paragraph, idx) => <Paragraph key={idx} {...paragraph} />)
      summaryParagraphElem = (
        <header className={styles.cellCardHeader}>
          {pElems}
        </header>
      )
    }

    let itemListElems = this.props.items.map((item, idx) => {
      // item is in the type "Paragraph" with item.level >= 0
      return <Paragraph key={idx} {...item} />
    })

    let elemWhenEmpty = null
    if(!summaryParagraphElem && itemListElems.length === 0) {
      elemWhenEmpty = (
        <span>This is empty</span>
      )
    }

    return (
      <div className={styles.cell}>
        <div className={styles.cellCard}>
          {summaryParagraphElem}
          <div className={styles.cellCardBody}>
            {itemListElems}
            {elemWhenEmpty}
          </div>
        </div>
      </div>
    )
  }
}

Cell.propTypes = TABLE_CELL_PROPS

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

    let lastAncestorText = null

    for(let row of iterateRows(this.props.currentTable.data.table.rows)) {
      let rowTitle = concatAllParagraphs(row.headers[row.headers.length-1])
      let ancestorText = row.headers.slice(0, -1).map(
        paragraphs => concatAllParagraphs(paragraphs)).join('／');

      let cellElems = row.cells.map((cellProps, idx) => <Cell {...cellProps} key={idx} />)

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