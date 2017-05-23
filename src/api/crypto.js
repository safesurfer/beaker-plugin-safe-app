const { genHandle, getObj } = require('./helpers');

module.exports.manifest = {
  sha3Hash: 'promise',
  getAppPubSignKey: 'promise',
  getAppPubEncKey: 'promise',
  generateEncKeyPair: 'promise',
  getSignKeyFromRaw: 'promise',
  pubEncKeyKeyFromRaw: 'promise'
};

/**
 * Hash the given input with SHA3 Hash
 * @param appToken - the application token
 * @param inpt - input string
 * @return {Promise<Buffer>}
 */
module.exports.sha3Hash = (appToken, inpt) => {
  return getObj(appToken)
    .then((app) => app.crypto.sha3Hash(inpt));
};

/**
 * Get the public signing key
 * @param appToken - the application token
 * @return {Promise<SignKeyHandle>}
 */
module.exports.getAppPubSignKey = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.getAppPubSignKey()
      .then((signKey) => genHandle(obj.app, signKey)));
};

/**
 * Get the public encryption key
 * @param appToken - the application token
 * @return {Promise<PubEncKeyHandle>}
 */
module.exports.getAppPubEncKey = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.getAppPubEncKey()
      .then((encKey) => genHandle(obj.app, encKey)));
};

/**
 * Generate a new Asymmetric EncryptionKeyPair
 * @param appToken - the application token
 * @return {Promise<KeyPairHandle>}
 */
module.exports.generateEncKeyPair = (appToken) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.generateEncKeyPair()
      .then((kp) => genHandle(obj.app, kp)));
};

/**
 * Interpret the SignKey from a given raw string
 * @param appToken - the application token
 * @param raw - raw input string
 * @return {Promise<SignKeyHandle>}
 */
module.exports.getSignKeyFromRaw = (appToken, raw) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.getSignKeyFromRaw(raw)
      .then((signKey) => genHandle(obj.app, signKey)));
};

/**
 * Interprete the encryption Key from a given raw string
 * @param appToken - the application token
 * @param raw - raw input string
 * @return {Promise<PubEncKeyHandle>}
 */
module.exports.pubEncKeyKeyFromRaw = (appToken, raw) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.pubEncKeyKeyFromRaw(raw)
      .then((pubEncKey) => genHandle(obj.app, pubEncKey)));
};

/**
 * Interpret the secret encryption Key from a given raw string
 * @param appToken - the application token
 * @param raw - raw input string
 * @return {Promise<SecEncKey>}
 */
module.exports.secEncKeyKeyFromRaw = (appToken, raw) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.secEncKeyKeyFromRaw(raw)
      .then((secEncKey) => genHandle(obj.app, secEncKey)));
};

/**
 * Generate a new Asymmetric EncryptionKeyPair from raw secret and public keys
 * @param appToken - the application token
 * @param rawPublicKey
 * @param rawSecretKey
 * @return {Promise<KeyPair>}
 */
module.exports.generateEncKeyPairFromRaw = (appToken, rawPublicKey, rawSecretKey) => {
  return getObj(appToken)
    .then((obj) => obj.app.crypto.generateEncKeyPairFromRaw(rawPublicKey, rawSecretKey)
      .then((kp) => genHandle(obj.app, kp)));
};
