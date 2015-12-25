import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './app.sass';
import upgradeToMdl from '../utils/upgrade';
import {connectToCurrentTable} from '../utils/connect';
import {setUIState} from '../actions'

import Header from './header';
import Drawer from './drawer';
import Footer from './footer';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.onMainScroll = this.onMainScroll.bind(this);
  }

  render() {

    let table = this.props.currentTable.data && this.props.currentTable.data.table;
    let config = this.props.currentTable.data && this.props.currentTable.data.config;
    // Wrapping mdl-layout with another div to avoid nasty errors
    // caused by material-design-lite, since it changes the DOM of mdl-layout.
    //
    // Ref: http://stackoverflow.com/questions/31998227/using-material-design-lite-with-react
    //
    return (
      <div>
        <div ref="layout" className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-drawer">
          <Header table={table} config={config} />
          <Drawer table={table} config={config} />
          <main className={`mdl-layout__content ${styles.main}`}
                onScroll={this.onMainScroll}
                ref="main">
            {this.props.children}
            <Footer />
          </main>
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    upgradeToMdl(this.refs.layout);
    this.measureScrollbarSize()
  }
  componentDidMount() {
    upgradeToMdl(this.refs.layout);
    this.measureScrollbarSize()
  }

  onMainScroll(e) {
    this._scrollLeft = findDOMNode(this.refs.main).scrollLeft

    if(!this._frameRequested){
      this._frameRequested = true;
      requestAnimationFrame(() => {
        this.props.dispatch(setUIState({
          scrollLeft: this._scrollLeft
        }))
        this._frameRequested = false;
      });
    }
  }

  measureScrollbarSize() {
    let mainElem = findDOMNode(this.refs.main)
    this.props.dispatch(setUIState({
      scrollbarSize: mainElem.getBoundingClientRect().width - mainElem.clientWidth
    }))
  }
}

export default connectToCurrentTable(App);