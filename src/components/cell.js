import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom'
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {connectToCurrentTableConfig} from '../utils/connect'
import PureComponent from 'react-pure-render/component'

import styles from './cell.sass';
import {DATA_CELL_PROPS, RUN_PROPS, HYPERLINK_PROPS, PARAGRAPH_PROPS, CONFIG_TYPE} from '../utils/types'

class Run extends React.Component {
  constructor() {
    super()
    this._handleClick = this._handleClick.bind(this)
  }

  render() {
    let style = {}
    let classNames = [styles.run]

    if(this.props.config.HIGHLIGHT) {
      if(this.props.isB) {style.fontWeight = 'bold'}
      if(this.props.isU) {style.textDecoration = 'underline'}
      if(this.props.isI) {style.fontStyle = 'italic'}
    }


    // Styling by comment types
    this.props.commentIds.forEach(commentId => {
      let type = this.props.commentMap[commentId].type
      let typeClassNames = this.props.config.COMMENT_TYPE_MAP[type]
      if(typeClassNames){
        let hashedClassNames = typeClassNames.map(cls => styles[cls])
        classNames.push.apply(classNames, hashedClassNames)
      }else{
        classNames.push(styles.hasUnidentifiedComment)
      }
    })



    return (
      <span className={classNames.join(' ')} style={style} onClick={this._handleClick}>{this.props.text}</span>
    )
  }

  _handleClick(evt) {
    // Ignore if no any comment to show for this run
    if(this.props.commentIds.length === 0){ return }
    this.props.onClick(this, this.props.commentIds)

    // Prevent propagation to <Paragraph /> onClick.
    evt.stopPropagation()
  }
}

Run.propTypes = Object.assign({}, RUN_PROPS, {
  onClick: PropTypes.func.isRequired,
  config: CONFIG_TYPE.isRequired, // table config
  commentMap: PropTypes.object
})

Run = connect(state => ({commentMap: ((state.tables[state.currentTableId]||{}).data.table||{}).commentMap}))(Run)

function Hyperlink(props) {
  let runElems = props.runs.map((run, id) => (
    <Run {...run} key={id} onClick={props.onRunClick} config={props.config} />
  ))
  let anchorProps = {}
  if(props.target){
    anchorProps.target = props.target
  }

  return (
    <a href={props.href} {...anchorProps}>{runElems}</a>
  )
}

Hyperlink.propTypes = Object.assign({}, HYPERLINK_PROPS, {
  onRunClick: PropTypes.func.isRequired,
  target: PropTypes.string,
  config: CONFIG_TYPE.isRequired
})

class Paragraph extends PureComponent {
  constructor(){
    super()
    this._handleClick = this._handleClick.bind(this)
    this._mapChildToElem = this._mapChildToElem.bind(this)
  }

  render(){
    let childElems = this.props.children.map(this._mapChildToElem())

    if(childElems.length === 0) {
      return null // No content at all
    }

    let classNames = []
    if(this.props.type === 'cellItem'){
      classNames.push(styles.cellItem)
      if(this.props.isActive){
        classNames.push(styles.isActive)

        if(this.props.reference.length > 0){
          let refChildElems = this.props.reference.map(this._mapChildToElem('_blank'))
          childElems.push(
            <div key="reference" className={styles.reference}>
              {refChildElems}
            </div>
          )
        }
      }

      if(this.props.config.EMPHASIZE_NO_REF &&
         this.props.reference.length === 0){
        classNames.push(styles.hasNoRef)
      }
    }

    return <div className={classNames.join(' ')} onClick={this._handleClick}>{childElems}</div>
  }

  _handleClick() {
    if(!this.props.onClick){ return }
    this.props.onClick(this.props.activeIdx)
  }

  _mapChildToElem(anchorTarget) {
    return (child, idx) => {
      if(child.href) {
        return <Hyperlink {...child} key={idx} onRunClick={this.props.onRunClick}
                          target={anchorTarget} config={this.props.config} />
      } else {
        return <Run {...child} key={idx} onClick={this.props.onRunClick}
                    config={this.props.config} />
      }
    }
  }
}

Paragraph.propTypes = Object.assign({}, PARAGRAPH_PROPS, {
  onRunClick: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['normal', 'cellItem']),
  isActive: PropTypes.bool, // For type=cellItem
  onClick: PropTypes.func,
  activeIdx: PropTypes.number, // Key to pass back when onClick() is invoked
  config: CONFIG_TYPE
})

Paragraph.defaultProps = {
  type: 'normal'
}

function Comment (props){
  let date = new Date(props.date)
  let typeClassNames = props.config.COMMENT_TYPE_MAP[props.type]

  if(typeClassNames){
    typeClassNames = typeClassNames.map(cls => styles[cls])
  }else{
    typeClassNames = []
  }

  return (
    <article className={styles.comment}>
      <header title={date.toLocaleString()}>
        <div className={`${styles.commentType} ${typeClassNames.join(' ')}`}>{props.type}</div>
        <div className={styles.commentAuthor}>by {props.author}</div>
      </header>
      <div>{props.text || '其他'}</div>
    </article>
  )
}

Comment.propTypes = {
  author: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Date instance, or string-serialized date
  text: PropTypes.string.isRequired,
  type: PropTypes.string
}

// Cannot be a stateless function because we need putting refs on CellContent.
//
class CellContent extends PureComponent {
  render() {
    let summaryParagraphElem = null
    if(this.props.summaryParagraphs.length>0 &&
       this.props.summaryParagraphs[0].children.length>0){
      let pElems = this.props.summaryParagraphs.map(
        (paragraph, idx) => <Paragraph key={idx} onRunClick={this.props.onRunClick} config={this.props.config} {...paragraph} />
      )
      summaryParagraphElem = (
        <header className={styles.cellContentHeader}>
          {pElems}
        </header>
      )
    }

    let listItemElems = this.props.items.map((item, idx) => {
      return (
        <Paragraph key={idx} type="cellItem"
                   isActive={idx===this.props.activeItemIdx}
                   onClick={this.props.onItemClick} activeIdx={idx}
                   onRunClick={(runElem, commentIds) => this.props.onRunClick(runElem, commentIds, idx) }
                   config={this.props.config}

                   level={item.level} children={item.children}
                   labels={item.labels} reference={item.ref} />
      )
    })

    let elemWhenEmpty = null
    let classNames = []

    if(!summaryParagraphElem && listItemElems.length === 0) {
      classNames.push(styles.isEmpty)
      elemWhenEmpty = (
        <span>
          目前沒有論述。
          <a href={this.props.config.EDIT_URL}>一起幫忙寫吧！</a>
        </span>
      )
    }

    return (
      <div className={`${styles.cellContent} ${classNames.join(' ')}`} style={this.props.style}>
        {summaryParagraphElem}
        {listItemElems}
        {elemWhenEmpty}
      </div>
    )
  }
}

CellContent.propTypes = Object.assign({}, DATA_CELL_PROPS, {
  activeItemIdx: PropTypes.any,
  onRunClick: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  config: CONFIG_TYPE
})

const INIITAL_CELL_STATE = {
  upperContentHeight: null,
  lowerContentHeight: null,
  tipLeft: null,
  commentIds: [],
  activeItemIdx: null
}

// Adjust split position manually
//
const SPLIT_Y_OFFSET = 2 // px

class Cell extends React.Component {
  constructor() {
    super()
    this._handleRunClick = this._handleRunClick.bind(this)
    this._handleItemClick = this._handleItemClick.bind(this)
    this._handleClickAway = this._handleClickAway.bind(this)

    this.state = INIITAL_CELL_STATE
  }

  render() {
    let commentBlockElem = null // zero-height when no commentIds
    if(this.state.commentIds.length > 0){
      commentBlockElem = (
        <div className={styles.commentBlock}>
          {
            this.state.commentIds.map(id =>
              <Comment key={id} {...this.props.commentMap[id]} config={this.props.currentTableConfig} />
            )
          }
        </div>
      )
    }

    if(this.state.upperContentHeight === null){
      // Normal mode, only has one <CellContent />
      //
      return (
        <div className={styles.cell}>
          <CellContent ref="content"
                       onRunClick={this._handleRunClick}
                       onItemClick={this._handleItemClick}
                       activeItemIdx={this.state.activeItemIdx}
                       items={this.props.items}
                       config={this.props.currentTableConfig}
                       summaryParagraphs={this.props.summaryParagraphs} />
        </div>
      )
    }else{
      // Split mode, has two <CellContent />s and a comment block in between
      //
      return (
        <div className={styles.cell}>
          <div className={styles.cellContentCropper} style={{height: `${this.state.upperContentHeight}px`}}>
            <CellContent ref="upperContent"
                         onRunClick={this._handleRunClick}
                         onItemClick={this._handleItemClick}
                         activeItemIdx={this.state.activeItemIdx}
                         items={this.props.items}
                         config={this.props.currentTableConfig}
                         summaryParagraphs={this.props.summaryParagraphs} />
            <div className={`${styles.tip} ${styles.upperTip}`} style={{left: `${this.state.tipLeft}px`}}></div>
          </div>
          <div className={styles.cellContentCropper}>
            <div className={`${styles.tip} ${styles.lowerTip}`} style={{left: `${this.state.tipLeft}px`}}></div>
            {commentBlockElem}
          </div>
          <div className={styles.cellContentCropper} style={{height: `${this.state.lowerContentHeight}px`}}>
            <CellContent ref="lowerContent"
                         onRunClick={this._handleRunClick}
                         onItemClick={this._handleItemClick}
                         activeItemIdx={this.state.activeItemIdx}
                         items={this.props.items}
                         summaryParagraphs={this.props.summaryParagraphs}
                         config={this.props.currentTableConfig}
                         style={{transform: `translateY(${this.state.upperContentHeight*-1}px)`}} />
          </div>
        </div>
      )
    }
  }

  _handleItemClick(idx){
    // Reset all when item is clicked
    //
    this.setState(Object.assign({}, INIITAL_CELL_STATE, {
      activeItemIdx: idx,
    }))
    this._setupClickAway()
  }

  _handleRunClick(runElem, commentIds=[], activeItemIdx=null) {
    // These would change the cell height, but does not destroy the runElem.
    // Set these states first.
    //
    this.setState({
      commentIds: [], // Set commentBlock height to 0
      activeItemIdx
    }, this._calculateSplitHeights.bind(this, runElem, commentIds))
  }

  _calculateSplitHeights(runElem, commentIds) {
    let runRect = findDOMNode(runElem).getBoundingClientRect()
    let clickedContentRef
    if(this.refs.content){
      clickedContentRef = this.refs.content
    }else{
      // Since commentBlock height is 0 now,
      // we can calculate split heights without being interfered by commentBlock height.

      let upperContentBottom = findDOMNode(this.refs.upperContent).getBoundingClientRect().top + this.state.upperContentHeight

      if(upperContentBottom >= runRect.bottom) {
        // Clicked run is at upper content
        clickedContentRef = this.refs.upperContent
      }else {
        clickedContentRef = this.refs.lowerContent
      }
    }

    let contentRect = findDOMNode(clickedContentRef).getBoundingClientRect()

    this.setState({
      commentIds,
      tipLeft: runRect.left - contentRect.left,
      upperContentHeight: runRect.bottom - contentRect.top + SPLIT_Y_OFFSET,
      lowerContentHeight: contentRect.bottom - runRect.bottom - SPLIT_Y_OFFSET,
    })

    this._setupClickAway()
  }

  _setupClickAway() {
    // Remove click handler before setup to avoid binding the handler twice
    //
    document.removeEventListener('click', this._handleClickAway)
    document.addEventListener('click', this._handleClickAway)
  }

  _handleClickAway(e) {
    // Skip if the clicked target is inside this cell
    //
    if(findDOMNode(this).contains(e.target)) {return}

    this.setState(INIITAL_CELL_STATE)

    document.removeEventListener('click', this._handleClickAway)
  }
}

Cell.propTypes = Object.assign({}, DATA_CELL_PROPS, {
  commentMap: PropTypes.object.isRequired
})

export default connectToCurrentTableConfig(Cell)
