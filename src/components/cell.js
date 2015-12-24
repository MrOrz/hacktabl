import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {Link} from 'react-router';
import {connect} from 'react-redux';
import PureComponent from 'react-pure-render/component'

import styles from './cell.sass';
import {DATA_CELL_PROPS, RUN_PROPS, HYPERLINK_PROPS, PARAGRAPH_PROPS} from '../utils/types'

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
    this.props.onClick(findDOMNode(this).getBoundingClientRect(), this.props.commentIds)
  }
}

Run.propTypes = Object.assign({}, RUN_PROPS, {
  onClick: PropTypes.func.isRequired
})

Run = connect(state => ((state.tables[state.currentTableId]||{}).config || {}))(Run)

function Hyperlink(props) {
  let runElems = props.runs.map((run, id) => (
    <Run {...run} key={id} onClick={props.onRunClick} />
  ))
  return (
    <a href={props.href}>{runElems}</a>
  )
}

Hyperlink.propTypes = Object.assign({}, HYPERLINK_PROPS, {
  onRunClick: PropTypes.func.isRequired
})

function Paragraph (props) {
  let childElems = props.children.map((child, idx) => {
    if(child.href) {
      return <Hyperlink {...child} key={idx} onRunClick={props.onRunClick} />
    } else {
      return <Run {...child} key={idx} onClick={props.onRunClick} />
    }
  })

  return <div>{childElems}</div>
}

Paragraph.propTypes = Object.assign({}, PARAGRAPH_PROPS, {
  onRunClick: PropTypes.func.isRequired
})

function Comment (props){
  let date = new Date(props.date)
  return <div>{props.text}</div>
}

Comment.propTypes = {
  author: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Date instance, or string-serialized date
  text: PropTypes.string.isRequired,
  type: PropTypes.string
}

class CellContent extends PureComponent {
  render() {
    let summaryParagraphElem = null
    if(this.props.summaryParagraphs.length>0 &&
       this.props.summaryParagraphs[0].children.length>0){
      let pElems = this.props.summaryParagraphs.map(
        (paragraph, idx) => <Paragraph key={idx} onRunClick={this.props.onRunClick} {...paragraph} />
      )
      summaryParagraphElem = (
        <header className={styles.cellContentHeader}>
          {pElems}
        </header>
      )
    }

    let itemListElems = this.props.items.map((item, idx) => {
      // "item" is in the type "Paragraph" with item.level >= 0.
      // "item.ref" will cause error because "ref" is reserved prop in React.js.
      //
      let paragraphProps = Object.assign({}, item, {reference: item.ref})
      delete paragraphProps.ref
      return <Paragraph key={idx} onRunClick={this.props.onRunClick} {...paragraphProps} />
    })

    let elemWhenEmpty = null
    if(!summaryParagraphElem && itemListElems.length === 0) {
      elemWhenEmpty = (
        <span>This is empty</span>
      )
    }

    return (
      <div className={styles.cellContent} style={this.props.style}>
        {summaryParagraphElem}
        <div className={styles.cellContentBody}>
          {itemListElems}
          {elemWhenEmpty}
        </div>
      </div>
    )
  }
}

CellContent.propTypes = DATA_CELL_PROPS

export default class Cell extends React.Component {
  constructor() {
    super()
    this._handleRunClick = this._handleRunClick.bind(this)
    this._handleClickAway = this._handleClickAway.bind(this)
    this.state = {
      upperContentHeight: null,
      lowerContentHeight: null,
      commentIds: []
    }
  }

  render() {
    let commentElems = this.state.commentIds.map(id => <Comment key={id} {...this.props.commentMap[id]} />)

    if(this.state.upperContentHeight === null){
      return (
        <div className={styles.cell}>
          <CellContent ref="content" onRunClick={this._handleRunClick} {...this.props} />
        </div>
      )
    }else{
      return (
        <div className={styles.cell}>
          <div className={styles.cellContentCropper} style={{
            height: `${this.state.upperContentHeight}px`
          }}>
            <CellContent ref="upperContent" onRunClick={this._handleRunClick} {...this.props} />
          </div>
          <div className={styles.commentBlock}>
            {commentElems}
          </div>
          <div className={styles.cellContentCropper} style={{
            height: `${this.state.lowerContentHeight}px`
          }}>
            <CellContent ref="lowerContent" onRunClick={this._handleRunClick} style={{
              transform: `translateY(${this.state.upperContentHeight*-1}px)`
            }}  {...this.props}/>
          </div>
        </div>
      )
    }
  }

  _handleRunClick(runRect, commentIds=[]) {
    let runBottom = runRect.bottom
    let clickedContentRef
    if(this.refs.content){
      clickedContentRef = this.refs.content
    }else{
      let upperContentBottom = findDOMNode(this.refs.upperContent).getBoundingClientRect().top + this.state.upperContentHeight

      if(upperContentBottom >= runBottom) {
        // Clicked run is at upper content
        clickedContentRef = this.refs.upperContent
      }else {
        clickedContentRef = this.refs.lowerContent
      }
    }

    let contentRect = findDOMNode(clickedContentRef).getBoundingClientRect()

    this.setState({
      upperContentHeight: runBottom - contentRect.top,
      lowerContentHeight: contentRect.bottom - runBottom,
      commentIds
    })

    document.addEventListener('click', this._handleClickAway)
  }

  _handleClickAway(e) {
    // Skip if the clicked target is inside this cell
    //
    if(findDOMNode(this).contains(e.target)) {return}

    this.setState({
      upperContentHeight: null,
      lowerContentHeight: null,
      commentIds: []
    })

    document.removeEventListener('click', this._handleClickAway)
  }
}

Cell.propTypes = Object.assign({}, DATA_CELL_PROPS, {
  commentMap: PropTypes.object.isRequired
})