import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './drawer.sass';
import PureComponent from 'react-pure-render/component';
import {connect} from 'react-redux';

const PARAGRAPH_TYPE = React.PropTypes.shape({
  children: React.PropTypes.arrayOf(React.PropTypes.shape({
    text: React.PropTypes.string
  })).isRequired
});

function concatAllParagraphText(paragraphs) {
  return paragraphs.reduce((sum, p) =>
          sum + p.children.reduce((s, child) => s + child.text, '')
        , '');
}

class RowTitleItem extends PureComponent {
  render () {
    let text = concatAllParagraphText(this.props.paragraphs);
    return (
      <li>{text}</li>
    );
  }
}

RowTitleItem.propTypes = {
  paragraphs: React.PropTypes.arrayOf(PARAGRAPH_TYPE)
};

class RowTitleDelimiter extends PureComponent {
  render () {
    let textSegments = this.props.headers.map(header => concatAllParagraphText(header.paragraphs));

    return (
      <li>{textSegments.join('／')}</li>
    )
  }
}

RowTitleDelimiter.propTypes = {
  headers: React.PropTypes.arrayOf(React.PropTypes.shape({
    paragraphs: React.PropTypes.arrayOf(PARAGRAPH_TYPE)
  }))
};

export class RowTitleNav extends PureComponent {
  render () {
    let items = [];
    let lastTitleHeader = null;

    traverse(this.props.rows, [], 0);

    return (
      <ul>
        {items}
      </ul>
    );

    function traverse(rows, titleStack) {
      rows.forEach((row) => {
        if(row.children){ // Has children, not in the most detailed header yet
          titleStack.push(row);
          traverse(row.children, titleStack);
          titleStack.pop();
        }else{ // All row header is inside titleStack

          // Print delimiter if the header is nested and not previously printed
          // yet.
          //
          if(titleStack.length > 0 && lastTitleHeader !== titleStack[titleStack.length-1]){
            items.push(
              <RowTitleDelimiter key={""+Math.random()} headers={titleStack.slice(0)} />
            );
            lastTitleHeader = titleStack[titleStack.length-1];
          }

          items.push(
            <RowTitleItem key={""+Math.random()} paragraphs={row.paragraphs}/>
          )
        }
      })
    }
  }
}

RowTitleNav.propTypes = {
  rows: React.PropTypes.arrayOf(React.PropTypes.shape({
    paragraphs: React.PropTypes.array,
    colspan: React.PropTypes.number.isRequired,
    cells: React.PropTypes.array, // Most-detailed headers have this
    children: React.PropTypes.array // Top-level & middle level headers have this
  }))
};

RowTitleNav.defaultProps = {
  rows: []
};

class Drawer extends React.Component {
  render () {
    if(!this.props.data){
      return (
        <div className="mdl-layout__drawer">
          Loading...
        </div>
      )
    }
    let titleElem = "";
    if(this.props.data.config && this.props.data.config.TITLE){
      titleElem = <span className={`mdl-layout__title ${styles.title}`}>{this.props.data.config.TITLE}</span>
    }

    let navElem = "";
    if(this.props.data.table && this.props.data.table.rows){
      navElem = (
        <nav className={styles.menu}>
          <RowTitleNav rows={this.props.data.table.rows} />
        </nav>
      );
    }

    return (
      <div className="mdl-layout__drawer">
        {titleElem}
        {navElem}
      </div>
    );

  }
  componentDidUpdate() {
    componentHandler.upgradeElement(findDOMNode(this));
  }
}

export default connect(state => state.tables[state.currentTableId] || {})(Drawer);
