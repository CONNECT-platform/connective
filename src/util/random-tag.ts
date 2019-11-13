export const _DefaultRandomTagCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
export const _DefaultRandomTagLength = 10;


export function createRandomTag(len = _DefaultRandomTagLength, charset = _DefaultRandomTagCharset) {
  let res = '';
  for (let i = 0; i < len; i++)
    res += charset[Math.floor(Math.random() * charset.length)];
  return res;
}


export default createRandomTag;