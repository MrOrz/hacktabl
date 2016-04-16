import React from 'react';
import {connectToCurrentTableConfig} from '../utils/connect'
import styles from './about-page.sass';

class AboutPage extends React.Component {
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
