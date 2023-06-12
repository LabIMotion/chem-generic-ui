const successLevel = 'success';
const errorLevel = 'error';

export const notifyError = (message = 'operation error', title = 'Error') => {
  return {
    message,
    title,
    lvl: errorLevel,
    isSuccess: false,
  };
};

export const notifySuccess = (
  message = 'operation successfully',
  title = 'Success'
) => {
  return {
    message,
    title,
    lvl: successLevel,
    isSuccess: true,
  };
};

export const notifyDummyAdd = (
  isSuccess = true,
  message = 'add dummy field successfully',
  title = 'Add dummy field'
) => (isSuccess ? notifySuccess(message, title) : notifyError(message, title));

export const notifyFieldAdd = (
  isSuccess,
  message = 'add new field successfully',
  title = 'Add new field'
) => (isSuccess ? notifySuccess(message, title) : notifyError(message, title));

export const notifyFieldRemove = (
  isSuccess = true,
  message = 'remove field successfully',
  title = 'Remove field'
) => (isSuccess ? notifySuccess(message, title) : notifyError(message, title));

// export const notifyLayerUpdate = (
//   isSuccess = true,
//   message = 'update layer successfully',
//   title = 'Update layer'
// ) => (isSuccess ? notifySuccess(message, title) : notifyError(message, title));

export const notifyLayerUpdate = (
  info = { type: null, layerKey: null },
  message = 'update layer successfully',
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
      return notifySuccess(message, title);
  }
};
