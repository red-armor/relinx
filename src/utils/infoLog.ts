/**
 * Intentional info-level logging for clear separation from ad-hoc console debug logging.
 */
function infoLog(...args: Array<any>) {
  console.log('**DEBUG**', ...args); // eslint-disable-line
}

export default infoLog;
