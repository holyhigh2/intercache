import {startsWith} from "myfx/string";
import {each} from 'myfx/collection'
import {eq,omitBy} from 'myfx/object'
import {
  isFunction,
  isNil,
  isDefined,
  isBlank,
  isRegExp,
  isString,
} from 'myfx/is'

import ms from 'mystores'

let Store:any = ms

const PERSISTENCE_TAG = "intercache::persistence";
const DEFAULT_PREFFIX = "intercache_";
let Caches: { [key: string]: any } = {};
const Options: {
  persistence: boolean | 'store'|'cookie'|'indexed';
  keyPreffix: string;
  validator: (rs: any) => boolean;
} = {
  persistence: false,
  keyPreffix: DEFAULT_PREFFIX,
  validator: (rs) => !isNil(rs),
};

//初始化
if (eq(Store.get(PERSISTENCE_TAG), "1")) {
  unserialize();
}

async function unserialize() {
  const ks = await Store.keys()
  ks.forEach(async (k:string) => {
    try {
      const v = await Store.get(k)
      Caches[k] = JSON.parse(v);
    } catch (error) { }
  });
}

/**
 * 创建一个代理了缓存控制逻辑的异步函数
 * @param getter 数据getter
 * @param key 缓存key，支持函数或字符串。使用函数可实现同一接口不同参数进行不同缓存
 * @return 缓存化后的getter函数
 */
export function cacheable(getter: Function, key: ((params: any[]) => string|Promise<string>) | string, options?: { validator?: (rs: any) => boolean }): (...params: any[]) => Promise<any> {
  let pfx = Options.keyPreffix;
  options = options || {}
  let validator = options.validator || Options.validator
  return (function (key,validator) {
    return async function (...params: any[]) {
      let k = key
      if(isFunction(key)){
        k = await key(params)
      }
      let wholeKey = pfx + k;
      if (isDefined(Caches[wholeKey])) {
        return Caches[wholeKey];
      } else {
        const rs = await getter.call(null, ...params);
        if (validator(rs)) {
          Caches[wholeKey] = rs;

          if (Options.persistence) {
            Store.set(wholeKey,rs)
          }
        }
        return rs;
      }
    }
  })(key, validator)
}

/**
 * 删除指定key对应的缓存数据
 * @param {string | RegExp} key 缓存key。如果类型是字符串必须严格相等，如果类型是正则执行test
 */
function del(key: string | RegExp) {
  if (isString(key)) {
    key = Options.keyPreffix + key;
    Caches[key] = undefined;
    Store.remove(key)
  } else if (isRegExp(key)) {
    each(Caches, (v: any, k: string) => {
      if ((key as RegExp).test(k)) {
        Caches[k] = undefined;
        Store.remove(k)
      }
    });
  }
}

/**
 * 删除所有缓存数据
 */
function delAll() {
  each(Caches, (v: any, k: string) => {
    if (startsWith(k, Options.keyPreffix, 0)) {
      Store.remove(k)
    }
  });
  Caches = {};
}

/**
 * 更新指定key缓存数据
 * @param {string} key 缓存key
 * @param {any} data 缓存数据
 */
function put(key: string, data: any) {
  key = Options.keyPreffix + key;
  Caches[key] = data;
  if (Options.persistence) {
    Store.set(key, data)
  }
}

/**
 * 检测指定key是否存在缓存数据
 * @param {string} key 缓存key
 * @return true如果存在
 */
function has(key: string): boolean {
  key = Options.keyPreffix + key;
  return !!Caches[key];
}

/**
 * 获取指定key缓存数据
 * @param key 
 * @returns 
 */
function get(key?: string): any {
  key = Options.keyPreffix + key;
  return Caches[key];
}

/**
 * 获取所有缓存map
 * @returns 
 */
function getAll(): any {
  return omitBy(Caches, (v, k) => k === PERSISTENCE_TAG);
}

export default {
  add: cacheable,
  del,
  delAll,
  put,
  has,
  get,
  getAll,
  //getter & setter
  set persistence(v: boolean|'store'|'cookie'|'indexed') {
    Options.persistence = v;
    if(v === 'cookie'){
      Store = ms.getStore('cookie')
    }else if(v === 'indexed'){
      Store = ms.getStore('indexed')
    } else if (v) {
      Store = ms.getStore('store')
    }
    
    if (v) {
      Store.set(PERSISTENCE_TAG, "1")
      unserialize();
    }
  },
  get persistence() {
    return Options.persistence;
  },
  set keyPreffix(v: string) {
    Options.keyPreffix = isBlank(v) ? DEFAULT_PREFFIX : v;
  },
  get keyPreffix() {
    return Options.keyPreffix;
  },
  set validator(v: (rs: any) => boolean) {
    Options.validator = v;
  },
  get validator() {
    return Options.validator;
  },
};
