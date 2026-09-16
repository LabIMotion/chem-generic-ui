import React from 'react';
import { permitFN } from '@ui/common/fnCfg';

export function fnToggle(Component) {
  const { fnId } = Component;

  return function FnToggled(props) {
    if (!fnId) {
      return <Component {...props} />;
    }

    if (permitFN(fnId) === false) {
      return null;
    }

    return <Component {...props} />;
  };
}
