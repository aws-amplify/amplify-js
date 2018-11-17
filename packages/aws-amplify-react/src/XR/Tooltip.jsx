import * as React from 'react';
import * as AmplifyUI from '@aws-amplify/ui';

const Tooltip = (props) => {
  let classes = `${AmplifyUI.tooltip}`;
  
  if (props.autoShowTooltip) {
    classes = `${AmplifyUI.tooltip} ${AmplifyUI.autoShowTooltip}`;
  }

  return (
    <div className={classes} data-text={props.text}>
      {props.children}
    </div>
  )
}

export default Tooltip;