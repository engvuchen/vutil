const fs = require('fs');
const pkg = require('../../package.json');
const { exec } = require('child_process');

/**
 * @param {Function} fn
 * @returns success => result; fail => undefined
 */
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      // 最后一个参数往往是 错误处理回调函数
      args.push((err, ...result) => {
        if (err) {
          reject();
          console.error(fn.name, err);
          return;
        }
        resolve(...result);
      });
      fn.apply(null, args);
    });
  };
}
const asyncAccess = promisify(fs.access);
const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);
const asyncMkdir = promisify(fs.mkdir);
const asyncReadDir = promisify(fs.readdir);
const asyncExec = promisify(exec);
function promiseQueue(promiseList) {
  let p = Promise.resolve();
  const arr = [];
  promiseList.forEach(promise => {
    // 在 promise 链后，附加新的 promise
    p = p.then(promise).then(data => {
      arr.push(data);
      return arr;
    });
  });
  return p;
}

/**
 * @param {Object} { type: '', name: '', msg: '' }
 */
function showMessage({ type = 'info', name = '', msg = '' }) {
  ({ type, name, msg } = [].slice.call(arguments).reduce((accu, cur) => Object.assign(accu, cur)));
  const newMsg = `[${pkg.name}]: ${name ? name : ''} ${msg}`;
  if (type === 'info') {
    vsWindow.showInformationMessage(newMsg);
  } else if (type === 'error') {
    vsWindow.showErrorMessage(newMsg);
    console.error(newMsg);
  }
}
/**
 * @param {Object} { name: '', msg: '' }
 */
const showInfo = showMessage.bind(null, { type: 'info' });
/**
 * @param {Object} { name: '', msg: '' }
 */
const showError = showMessage.bind(null, { type: 'error' });

module.exports = {
  asyncAccess,
  asyncReadFile,
  asyncWriteFile,
  asyncMkdir,
  asyncReadDir,
  asyncExec,
  promiseQueue,
  showInfo,
  showError,
};
