import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './app.sass';
import upgradeToMdl from '../utils/upgrade';

import Header from './header';
import Drawer from './drawer';
import Footer from './footer';

export default class App extends React.Component {
  render() {
    // Wrapping mdl-layout with another div to avoid nasty errors
    // caused by material-design-lite, since it changes the DOM of mdl-layout.
    //
    // Ref: http://stackoverflow.com/questions/31998227/using-material-design-lite-with-react
    //
    return (
      <div>
        <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-drawer">
          <Header />
          <Drawer />
          <main className={`mdl-layout__content ${styles.main}`}>
            {this.props.children}
            <Footer />
          </main>
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    upgradeToMdl(this);
  }
  componentDidMount() {
    upgradeToMdl(this);
  }
}

