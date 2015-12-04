import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './app.sass';
import upgradeToMdl from '../utils/upgrade';
import {connectToCurrentTable} from '../utils/connect';

import Header from './header';
import Drawer from './drawer';
import Footer from './footer';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      scrollLeft: 0
    };

    this.onMainScroll = this.onMainScroll.bind(this);
  }

  render() {

    let table = this.props.data && this.props.data.table;
    let config = this.props.data && this.props.data.config;
    // Wrapping mdl-layout with another div to avoid nasty errors
    // caused by material-design-lite, since it changes the DOM of mdl-layout.
    //
    // Ref: http://stackoverflow.com/questions/31998227/using-material-design-lite-with-react
    //
    return (
      <div>
        <div ref="layout" className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-drawer">
          <Header table={table} config={config} scrollLeft={this.state.scrollLeft} />
          <Drawer table={table} config={config} />
          <main className={`mdl-layout__content ${styles.main}`}
                onScroll={this.onMainScroll}
                ref="main">
            {this.props.children}
            <Footer scrollLeft={this.state.scrollLeft} />
          </main>
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    upgradeToMdl(this.refs.layout);
  }
  componentDidMount() {
    upgradeToMdl(this.refs.layout);
  }

  onMainScroll(e) {
    this._scrollLeft = findDOMNode(this.refs.main).scrollLeft

    if(!this._frameRequested){
      this._frameRequested = true;
      requestAnimationFrame(() => {
        this.setState({scrollLeft: this._scrollLeft});
        this._frameRequested = false;
      });
    }
  }
}

export default connectToCurrentTable(App);