const safeApp = require('safe-app');
const ipc = require('./ipc');
const { genHandle, getObj, freeObj } = require('./helpers');

module.exports.manifest = {
  initialise: 'promise',
  connect: 'promise',
  authorise: 'promise',
  connectAuthorised: 'promise',
  webFetch: 'promise',
  isRegistered: 'promise',
  canAccessContainer: 'promise',
  refreshContainersPermissions: 'promise',
  getContainersNames: 'promise',
  getHomeContainer: 'promise',
  getContainer: 'promise',
  getPubSignKey: 'promise',
  getEncKey: 'promise',
  getSignKeyFromRaw: 'promise',
  getEncKeyKeyFromRaw: 'promise',
  free: 'sync'
};

/**
 * Create a new SAFEApp instance without a connection to the network
 * @returns {Promise<SAFEAppToken>} new instace
 */
module.exports.initialise = (appInfo) => {
  if (this && this.sender) {
    const wholeUrl = this.sender.getURL();
    appInfo.scope = wholeUrl;
  } else {
    appInfo.scope = null;
  }

  return safeApp.initializeApp(appInfo)
    .then((app) => genHandle(app, null));
};

/**
 * Create a new, unregistered Session (read-only)
 * @returns {Promise<SAFEAppToken>} same instace
 */
module.exports.connect = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.connectUnregistered())
    .then(() => appToken);
};

/**
 * With the options object it can be opt for getting a container
 * for the app itself: opts.own_container=true
 * @returns {Promise<AuthURI>} auth granted URI
 */
module.exports.authorise = (appToken, permissions, options) => {
  return new Promise((resolve, reject) => {
    getObj(appToken)
      .then((obj) => obj.app.auth.genAuthUri(permissions, options)
        .then((authReq) => ipc.sendAuthReq(authReq, (err, res) => {
          if (err) {
            return reject(new Error('Unable to authorise the application: ', err)); // TODO send Error in specific
          }
          return resolve(res);
        })))
      .catch(reject);
  });
};

/**
 * Create a new, registered Session (read-write)
 * @returns {Promise<SAFEAppToken>} same instace
 */
module.exports.connectAuthorised = (appToken, authUri) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.loginFromURI(authUri))
    .then((_) => appToken);
};

/**
 * Authorise container request
 * @returns {Promise<AuthURI>} auth granted URI
 */
module.exports.authoriseContainer = (appToken, permissions) => {
  return new Promise((resolve, reject) => {
    getObj(appToken)
      .then((obj) => obj.app.auth.genContainerAuthUri(permissions)
        .then((authReq) => ipc.sendAuthReq(authReq, (err, res) => {
          if (err) {
            return reject(new Error('Unable to authorise the application: ', err)); // TODO send Error in specific
          }
          return resolve(res);
        })))
      .catch(reject);
  });
};

module.exports.webFetch = (appToken, url) => {
  return getObj(appToken)
    .then((obj) => obj.app.webFetch(url)
      .then((f) => app.immutableData.fetch(f.dataMapName))
      .then((i) => i.read())
    );
};

/**
 * Whether or not this is a registered/authenticated
 * session.
 *
 * @param {String} appToken - the application token
 * @returns {Boolean} true if this is an authenticated session
 **/
module.exports.isRegistered = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.registered);
};

/**
 * Whether or not this session has specifc permission access of a given
 * container.
 * @param {String} appToken - the application token
 * @arg {String} name  name of the container, e.g. `_public`
 * @arg {(String||Array<String>)} [permissions=['Read']] permissions to check for
 * @returns {Promise<Boolean>}
 **/
module.exports.canAccessContainer = (appToken, name, permissions) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.canAccessContainer(name, permissions));
};

/**
 * Refresh permissions for accessible containers from the network. Useful when
 * you just connected or received a response from the authenticator in the IPC protocol.
 * @param {String} appToken - the application token
 */
module.exports.refreshContainersPermissions = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.refreshContainersPermissions())
    .then((_) => appToken);
};

/**
 * Get the names of all containers found.
 * @param {String} appToken - the application token
 * @returns {Promise<[String]>} list of containers names
 */
module.exports.getContainersNames = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getContainersNames());
};

/**
 * Get the MutableData for the apps own container generated by Authenticator
 * @param appToken
 * @return {Promise<MutableDataHandle>} the handle for the MutableData behind it
 */
module.exports.getHomeContainer = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getHomeContainer()
      .then((md) => genHandle(obj.app, md)));
};

/**
 * Lookup and return the information necessary to access a container.
 * @param {String} appToken - the application token
 * @arg name {String} name of the container, e.g. `'_public'`
 * @returns {Promise<MutableDataHandle>} the handle for the MutableData behind it
 */
module.exports.getContainer = (appToken, name) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getContainer(name)
      .then((md) => genHandle(obj.app, md)));
};

/**
 * Get the public signing key of this session
 * @param {String} appToken - the application token
 * @returns {Promise<SignKeyHandle>}
 **/
module.exports.getPubSignKey = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getPubSignKey()
      .then((pubSignKey) => genHandle(obj.app, pubSignKey)));
};

/**
 * Get the public encryption key of this session
 * @param {String} appToken - the application token
 * @returns {Promise<EncKeyHandle>}
 **/
module.exports.getEncKey = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getEncKey()
      .then((encKey) => genHandle(obj.app, encKey)));
};

/**
 * Interprete the SignKey from a given raw string
 * @param {String} appToken - the application token
 * @param {String} raw
 * @returns {Promise<SignKeyHandle>}
 **/
module.exports.getSignKeyFromRaw = (appToken, raw) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getSignKeyFromRaw(raw)
      .then((signKey) => genHandle(obj.app, signKey)));
};

/**
 * Interprete the encryption Key from a given raw string
 * @param {String} appToken - the application token
 * @arg {String} raw
 * @returns {Promise<EncKeyHandle>}
 **/
module.exports.getEncKeyKeyFromRaw = (appToken, raw) => {
  return getObj(appToken)
    .then((obj) => obj.app.auth.getEncKeyKeyFromRaw(raw)
      .then((encKey) => genHandle(obj.app, encKey)));
};

/**
 * Free the SAFEApp instance from memory
 * @param {String} appToken - the application token
 */
module.exports.free = (appToken) => freeObj(appToken);
