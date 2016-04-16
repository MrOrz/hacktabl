import React from 'react';
import {connectToCurrentTableConfig} from '../utils/connect'
import {setUIState} from '../actions'
import styles from './about-page.sass';

class AboutPage extends React.Component {
  componentDidMount() {
    this.props.dispatch(setUIState({
      activeRowId: -1
    }))
  }

  render() {
    if(!this.props.currentTableConfig) return (
      <div>
        No config yet
      </div>
    )

    return (
      <div className={styles.root}>
        <iframe src={this.props.currentTableConfig.INFO_URL} />
      </div>
    )
  }
};

export default connectToCurrentTableConfig(AboutPage)
