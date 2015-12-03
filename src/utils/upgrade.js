import {findDOMNode} from 'react-dom';

export default function upgradeToMdl(ref){
  if(!ref){
    ref = this;
  }
  componentHandler.upgradeElement(findDOMNode(ref));
}