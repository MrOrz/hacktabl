import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {Link} from 'react-router';
import {connect} from 'react-redux';

import styles from './table-page.sass';
import {loadTable, navigateToTable} from '../actions';
import {connectToCurrentTable} from '../utils/connect';
import {iterateRows, concatAllParagraphs} from '../utils/traverse';
import {TABLE_CELL_PROPS, RUN_PROPS, HYPERLINK_PROPS, PARAGRAPH_PROPS} from '../utils/types'

class Run extends React.Component {
  constructor() {
    super()
    this._handleClick = this._handleClick.bind(this)
  }

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
      <span className={classNames.join(' ')} style={style} onClick={this._handleClick}>{this.props.text}</span>
    )
  }

  _handleClick(evt) {
    // Ignore if no any comment to show for this run
    if(this.props.commentIds.length === 0){ return }
    evt.stopPropagation() // Don't trigger card's click

    this.props.onClick(findDOMNode(this).getBoundingClientRect(), this.props.commentIds)
  }
}

Run.propTypes = Object.assign({}, RUN_PROPS, {
  onClick: PropTypes.func.isRequired
})

Run = connect(state => ((state.tables[state.currentTableId]||{}).config || {}))(Run)

class Hyperlink extends React.Component {
  render() {
    let runElems = this.props.runs.map((run, id) => (
      <Run {...run} key={id} onClick={this.props.onRunClick} />
    ))
    return (
      <a href={this.props.href}>{runElems}</a>
    )
  }
}

Hyperlink.propTypes = Object.assign({}, HYPERLINK_PROPS, {
  onRunClick: PropTypes.func.isRequired
})

class Paragraph extends React.Component {
  render () {
    let childElems = this.props.children.map((child, idx) => {
      if(child.href) {
        return <Hyperlink {...child} key={idx} onRunClick={this.props.onRunClick} />
      } else {
        return <Run {...child} key={idx} onClick={this.props.onRunClick} />
      }
    })

    return <div>{childElems}</div>
  }
}

Paragraph.propTypes = Object.assign({}, PARAGRAPH_PROPS, {
  onRunClick: PropTypes.func.isRequired
})

class Cell extends React.Component {
  constructor() {
    super()
    this._handleRunClick = this._handleRunClick.bind(this)
    this._handleClick = this._handleClick.bind(this)
    this.state = {
      upperCardHeight: null,
      lowerCardHeight: null
    }
  }

  render() {
    let summaryParagraphElem = null
    if(this.props.summaryParagraphs.length>0 &&
       this.props.summaryParagraphs[0].children.length>0){
      let pElems = this.props.summaryParagraphs.map(
        (paragraph, idx) => <Paragraph key={idx} onRunClick={this._handleRunClick} {...paragraph} />
      )
      summaryParagraphElem = (
        <header className={styles.cellCardHeader}>
          {pElems}
        </header>
      )
    }

    let itemListElems = this.props.items.map((item, idx) => {
      // item is in the type "Paragraph" with item.level >= 0
      return <Paragraph key={idx} onRunClick={this._handleRunClick} {...item} />
    })

    let elemWhenEmpty = null
    if(!summaryParagraphElem && itemListElems.length === 0) {
      elemWhenEmpty = (
        <span>This is empty</span>
      )
    }

    if(this.state.upperCardHeight === null){
      return (
        <div className={styles.cell}>
          {createCardElemWithRef('card')}
        </div>
      )
    }else{
      return (
        <div className={styles.cell} onClick={this._handleClick}>
          <div className={styles.cellCardCropper} style={{
            height: `${this.state.upperCardHeight}px`
          }}>
            {createCardElemWithRef('upperCard')}
          </div>
          Comments!!
          <div className={styles.cellCardCropper} style={{
            height: `${this.state.lowerCardHeight}px`
          }}>
            {createCardElemWithRef('lowerCard', {
              transform: `translateY(${this.state.upperCardHeight*-1}px)`
            })}
          </div>
        </div>
      )
    }

    function createCardElemWithRef(ref, style={}) {
      return (
        <div className={styles.cellCard} ref={ref} style={style}>
          {summaryParagraphElem}
          <div className={styles.cellCardBody}>
            {itemListElems}
            {elemWhenEmpty}
          </div>
        </div>
      )
    }
  }

  _handleRunClick(runRect, commentIds) {
    let runBottom = runRect.bottom
    let clickedCardRef
    if(this.refs.card){
      clickedCardRef = this.refs.card
    }else{
      let upperCardBottom = findDOMNode(this.refs.upperCard).getBoundingClientRect().top + this.state.upperCardHeight

      if(upperCardBottom >= runBottom) {
        // Clicked run is at upper card
        clickedCardRef = this.refs.upperCard
      }else {
        clickedCardRef = this.refs.lowerCard
      }
    }

    let cardRect = findDOMNode(clickedCardRef).getBoundingClientRect()

    this.setState({
      upperCardHeight: runBottom - cardRect.top,
      lowerCardHeight: cardRect.bottom - runBottom
    })
  }

  _handleClick() {
    this.setState({
      upperCardHeight: null,
      lowerCardHeight: null
    })
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
    if(!this.props.currentTable.data.table) {
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