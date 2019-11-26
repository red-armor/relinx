/**
 * Intentional info-level logging for clear separation from ad-hoc console debug logging.
 */
function infoLog(...args) {
  console.log('**DEBUG**', ...args);
}

export default infoLog
