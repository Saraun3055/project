/**
 * Normalises a Mongoose document (or a `.lean()` object) into the plain JSON
 * shape the API has always returned: the legacy `id` field stays, the Mongo
 * `_id` / `__v` bookkeeping fields are dropped.
 */
const toPlain = (doc) => {
  if (doc === null || doc === undefined) return doc;
  const source = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  if (typeof source !== 'object') return source;

  const { _id: _id, __v: _v, ...rest } = source;
  return rest;
};

const toPlainList = (docs) => (docs || []).map(toPlain);

/** Customer profile view: everything except the password hash. */
const toProfile = (doc) => {
  const profile = toPlain(doc);
  if (profile && typeof profile === 'object') delete profile.passwordHash;
  return profile;
};

module.exports = { toPlain, toPlainList, toProfile };

