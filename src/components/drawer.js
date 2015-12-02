import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './drawer.sass';

import {connect} from 'react-redux';

class Drawer extends React.Component {
  render () {
    return (
      <div className="mdl-layout__drawer">
        <span className="mdl-layout__title">Hi</span>
        Drawer!
      </div>
    );
  }
  componentDidUpdate() {
    componentHandler.upgradeElement(findDOMNode(this));
  }
}


export default connect(state => state)(Drawer);