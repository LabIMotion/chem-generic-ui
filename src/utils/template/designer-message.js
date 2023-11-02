const successLevel = 'success';
const errorLevel = 'error';

export const notifyError = (msg = 'operation error', title = 'Error') => {
  return {
    msg,
    title,
    lvl: errorLevel,
    isSuccess: false,
  };
};

export const notifySuccess = (
  msg = "Operation successfully. Remember to save once you've finished editing.",
  title = 'Success'
) => {
  return {
    msg,
    title,
    lvl: successLevel,
    isSuccess: true,
  };
};

export const notifyDummyAdd = (
  isSuccess = true,
  msg = 'add dummy field successfully',
  title = 'Add dummy field'
) => (isSuccess ? notifySuccess(msg, title) : notifyError(msg, title));

export const notifyFieldAdd = (
  isSuccess = true,
  msg = 'add new field successfully',
  title = 'Add new field'
) => (isSuccess ? notifySuccess(msg, title) : notifyError(msg, title));

export const notifyFieldRemove = (
  isSuccess = true,
  msg = 'remove field successfully',
  title = 'Remove field'
) => (isSuccess ? notifySuccess(msg, title) : notifyError(msg, title));

export const notifyLayerUpdate = (
  info = { type: null, layerKey: null },
  msg = 'update layer successfully',
  title = 'Update layer'
) => {
  const { type, layerKey } = info;
  switch (type) {
    case 'checkWorkflow':
      return notifyError(
        [
          `Cannot change the attribute 'used in Workflow?'`,
          `because this layer [${layerKey}] is currently used in workflow.`,
        ].join(' '),
        title
      );
    case 'checkRestriction':
      return notifyError(
        [
          'Cannot be used in Workflow',
          `because the Layer Restriction of this layer [${layerKey}] has been set.`,
        ].join(' '),
        title
      );
    default:
      return notifySuccess(msg, title);
  }
};
