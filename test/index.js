/**
   * intercache v0.1.1
   * A lightweight cache interface can make your data-getters cacheable in a non-intrusive way
   * @holyhigh2
   * https://github.com/holyhigh2/intercache
   */
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.intercache = {}));
})(this, (function (exports) { 'use strict';

    function isNil(v) {
        return v === null || v === undefined;
    }

    function toString(v) {
        if (isNil(v))
            return '';
        if (v === 0 && 1 / v < 0)
            return '-0';
        return v.toString();
    }

    function isRegExp(v) {
        return typeof v === 'object' && v instanceof RegExp;
    }

    function isString(v) {
        return typeof v === 'string' || v instanceof String;
    }

    const PRIMITIVE_TYPES = [
        'string',
        'number',
        'bigint',
        'boolean',
        'undefined',
        'symbol',
    ];
    function isObject(v) {
        return null !== v && PRIMITIVE_TYPES.indexOf(typeof v) < 0;
    }

    function startsWith(str, searchStr, position) {
        return toString(str).startsWith(searchStr, position);
    }

    function isUndefined(v) {
        return v === undefined;
    }

    function isFunction(v) {
        return typeof v == 'function' || v instanceof Function;
    }

    function isArray(v) {
        return Array.isArray(v);
    }

    function identity(v) {
        return v;
    }

    function toPath$1(path) {
        let chain = path;
        if (isArray(chain)) {
            chain = chain.join('.');
        }
        else {
            chain += '';
        }
        const rs = (chain + '')
            .replace(/\[([^\]]+)\]/gm, '.$1')
            .replace(/^\./g, '')
            .split('.');
        return rs;
    }

    function get$1(obj, path, defaultValue) {
        if (!isObject(obj))
            return defaultValue;
        const chain = toPath$1(path);
        let target = obj;
        for (let i = 0; i < chain.length; i++) {
            const seg = chain[i];
            target = target[seg];
            if (!target)
                break;
        }
        if (target === undefined)
            target = defaultValue;
        return target;
    }

    function prop(path) {
        return (obj) => {
            return get$1(obj, path);
        };
    }

    function toPath(path) {
        return toPath$1(path);
    }

    function eq$1(a, b) {
        if (Number.isNaN(a) && Number.isNaN(b))
            return true;
        return a === b;
    }

    function isMatchWith(target, props, comparator = eq$1) {
        if (isNil(props))
            return true;
        const ks = Object.keys(props);
        if (!isObject(target))
            return false;
        let rs = true;
        for (let i = ks.length; i--;) {
            const k = ks[i];
            const v1 = target[k];
            const v2 = props[k];
            if (isObject(v1) && isObject(v2)) {
                if (!isMatchWith(v1, v2, comparator)) {
                    rs = false;
                    break;
                }
            }
            else {
                if (!comparator(v1, v2, k, target, props)) {
                    rs = false;
                    break;
                }
            }
        }
        return rs;
    }

    function isMatch(object, props) {
        return isMatchWith(object, props, eq$1);
    }

    function matcher(props) {
        return (obj) => {
            return isMatch(obj, props);
        };
    }

    function iteratee(value) {
        if (isUndefined(value)) {
            return identity;
        }
        else if (isFunction(value)) {
            return value;
        }
        else if (isString(value)) {
            return prop(value);
        }
        else if (isArray(value)) {
            return prop(toPath(value));
        }
        else if (isObject(value)) {
            return matcher(value);
        }
        return () => false;
    }

    function isArrayLike(v) {
        if (isString(v) && v.length > 0)
            return true;
        if (!isObject(v))
            return false;
        const list = v;
        if (list.length !== undefined) {
            const proto = list.constructor.prototype;
            if (isFunction(proto.item))
                return true;
            if (isFunction(list[Symbol.iterator]))
                return true;
        }
        return false;
    }

    function isSet(v) {
        return v instanceof Set;
    }

    function isMap(v) {
        return v instanceof Map;
    }

    function _eachIterator(collection, callback, forRight) {
        let values;
        let keys;
        if (isString(collection) || isArrayLike(collection)) {
            let size = collection.length;
            if (forRight) {
                while (size--) {
                    const r = callback(collection[size], size, collection);
                    if (r === false)
                        return;
                }
            }
            else {
                for (let i = 0; i < size; i++) {
                    const r = callback(collection[i], i, collection);
                    if (r === false)
                        return;
                }
            }
        }
        else if (isSet(collection)) {
            let size = collection.size;
            if (forRight) {
                values = Array.from(collection);
                while (size--) {
                    const r = callback(values[size], size, collection);
                    if (r === false)
                        return;
                }
            }
            else {
                values = collection.values();
                for (let i = 0; i < size; i++) {
                    const r = callback(values.next().value, i, collection);
                    if (r === false)
                        return;
                }
            }
        }
        else if (isMap(collection)) {
            let size = collection.size;
            keys = collection.keys();
            values = collection.values();
            if (forRight) {
                keys = Array.from(keys);
                values = Array.from(values);
                while (size--) {
                    const r = callback(values[size], keys[size], collection);
                    if (r === false)
                        return;
                }
            }
            else {
                for (let i = 0; i < size; i++) {
                    const r = callback(values.next().value, keys.next().value, collection);
                    if (r === false)
                        return;
                }
            }
        }
        else if (isObject(collection)) {
            keys = Object.keys(collection);
            let size = keys.length;
            if (forRight) {
                while (size--) {
                    const k = keys[size];
                    const r = callback(collection[k], k, collection);
                    if (r === false)
                        return;
                }
            }
            else {
                for (let i = 0; i < size; i++) {
                    const k = keys[i];
                    const r = callback(collection[k], k, collection);
                    if (r === false)
                        return;
                }
            }
        }
    }

    function each(collection, callback) {
        _eachIterator(collection, callback, false);
    }

    function map(collection, itee) {
        const rs = [];
        const cb = iteratee(itee);
        each(collection, (v, k, c) => {
            const r = cb(v, k, c);
            rs.push(r);
        });
        return rs;
    }

    function keys(obj) {
        if (obj === null || obj === undefined)
            return [];
        return Object.keys(obj);
    }

    function values(obj) {
        return keys(obj).map((k) => obj[k]);
    }

    function toArray(collection) {
        if (isArray(collection))
            return collection.concat();
        if (isFunction(collection))
            return [collection];
        if (isSet(collection)) {
            return Array.from(collection);
        }
        else if (isString(collection)) {
            return collection.split('');
        }
        else if (isArrayLike(collection)) {
            return Array.from(collection);
        }
        else if (isMap(collection)) {
            return Array.from(collection.values());
        }
        else if (isObject(collection)) {
            return values(collection);
        }
        return [collection];
    }

    function flat(array, depth = 1) {
        if (depth < 1)
            return array.concat();
        const rs = toArray(array).reduce((acc, val) => {
            return acc.concat(Array.isArray(val) && depth > 0 ? flat(val, depth - 1) : val);
        }, []);
        return rs;
    }

    function flatMap(collection, itee, depth) {
        return flat(map(collection, itee), depth || 1);
    }

    function isNumber(v) {
        return typeof v === 'number' || v instanceof Number;
    }

    function isDate(v) {
        return v instanceof Date;
    }

    function isBoolean(v) {
        return typeof v === 'boolean' || v instanceof Boolean;
    }

    function eq(a, b) {
        return eq$1(a, b);
    }

    function omitBy(obj, predicate) {
        const rs = {};
        if (obj === null || obj === undefined)
            return rs;
        Object.keys(obj).forEach(k => {
            let v = obj[k];
            if (!(predicate || identity)(v, k)) {
                rs[k] = v;
            }
        });
        return rs;
    }

    function isBlank(v) {
        return v === null || v === undefined || (v + '').trim().replace(/\t|\n|\f|\r/mg, '').length === 0;
    }

    function isDefined(v) {
        return v !== undefined;
    }

    function isNaN(v) {
        return Number.isNaN(v);
    }

    function isNull(v) {
        return null === v;
    }

    function g(e,t,r,n){if("a"===r&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return "m"===r?n:"a"===r?n.call(e):n?n.value:t.get(e)}function p(e,t,r,n,o){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!o)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!o:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return "a"===n?o.call(e,r):o?o.value=r:t.set(e,r),r}var h,w,d,S;const y="_ms_",v={storeType:"store",serializer:JSON.stringify};function k(e){if(isString(e))return [e,"string"];if(isDate(e))return [e.getTime()+"","date"];if(isNumber(e))return [e+"","number"];if(isBoolean(e))return [e+"","boolean"];if(isUndefined(e))return ["","undefined"];if(isNull(e))return ["","null"];if(isNaN(e))return ["","nan"];if(isRegExp(e)){let t=e.toString();return [t.substring(1,t.length-1),"exp"]}return isFunction(e)?[e.toString(),"function"]:isObject(e)?[v.serializer(e),"json"]:["$","string"]}function b(e,t){switch(t){case"string":return e;case"date":return new Date(parseInt(e));case"number":return Number(e);case"boolean":return "true"==e;case"undefined":return;case"null":return null;case"nan":return NaN;case"exp":return new RegExp(e);case"function":return new Function(e);case"json":return JSON.parse(e)}}function I(e){return y+encodeURIComponent(e)}class ${keys(){return flatMap(Object.keys(localStorage),(e=>startsWith(e,y)?e:[]))}clear(){each(this.keys(),(e=>{startsWith(e,y)&&localStorage.removeItem(e);}));}has(e){const t=I(e);return !(!localStorage.getItem(I(t))&&!sessionStorage.getItem(I(t)))}set(e,t,r){if(0==r)return !1;const n=I(e),[o,s]=k(t);if(!r){const e=[-1,o,s];return sessionStorage.setItem(n,JSON.stringify(e)),!0}let a=r||-1;const c=[a<0?r:Date.now()+1e3*a,o,s];return localStorage.setItem(n,JSON.stringify(c)),!0}get(e){const t=I(e);let r=sessionStorage.getItem(t);if(r){const[e,t,n]=JSON.parse(r);return b(t,n)}if(r=localStorage.getItem(t),r){const[e,n,o]=JSON.parse(r);return parseInt(e)<Date.now()?(localStorage.removeItem(t),null):b(n,o)}return null}getString(e){const t=I(e);let r=sessionStorage.getItem(t);if(r){const[e,t]=JSON.parse(r);return t}if(r=localStorage.getItem(t),r){const[e,n]=JSON.parse(r);return parseInt(e)<Date.now()?(localStorage.removeItem(t),null):n}return null}remove(e){const t=I(e);return !!this.has(e)&&(localStorage.removeItem(t),sessionStorage.removeItem(t),!0)}}class x{keys(){const t=document.cookie.match(/(?:^|;)\s*([^=]*)=/gm);return flatMap(t,(e=>startsWith(e.replace(/^;\s*/,""),y)?e.replace(/^;\s*/,"").replace("=",""):[]))}clear(){each(this.keys(),(e=>{e=e.replace(/^;\s*/,""),startsWith(e,y)&&this.remove(e.replace(y,""));}));}has(e){const t=I(e);return !!document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*${t}\\s*=\\s*([^;]*).*$)|^.*$`),"$1")}set(e,t,r,n){if(0==r)return !1;if(!e)return !1;const o=I(e),[s,a]=k(t),c=[s,a];(null==n?void 0:n.path)&&c.push(n.path),(null==n?void 0:n.domain)&&c.push(n.domain);let i=o+"="+JSON.stringify(c);if(r){const e=new Date(2147483647e3).getTime();i+=";expires="+(r=Date.now()+(r<0?e:1e3*r));}return (null==n?void 0:n.path)&&(i+=";path="+n.path),(null==n?void 0:n.domain)&&(i+=";domain="+n.path),(null==n?void 0:n.secure)&&(i+=";secure"),document.cookie=i,!0}get(e){const t=I(e),r=document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*${t}\\s*=\\s*([^;]*).*$)|^.*$`),"$1");if(r){const[e,t]=JSON.parse(r);return b(e,t)}return null}getString(e){const t=I(e),r=document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*${t}\\s*=\\s*([^;]*).*$)|^.*$`),"$1");if(r){const[e,t]=JSON.parse(r);return e}return null}remove(e){const t=I(e),r=document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*${t}\\s*=\\s*([^;]*).*$)|^.*$`),"$1");if(!r)return !1;const[n,o,s,a]=JSON.parse(r);let c=t+"=;expires="+new Date(-1).toUTCString();return s&&(c+=";path="+s),a&&(c+=";domain="+a),document.cookie=c,!0}}const N="_mystore_";let O=null;class P{constructor(){h.add(this),w.set(this,void 0),d.set(this,[]);const e=this;if(O)return;const r=indexedDB.open("MyStore",1);r.onupgradeneeded=function(t){(O=p(e,w,this.result,"f")).createObjectStore("storage",{keyPath:N});},r.onsuccess=function(r){O=p(e,w,this.result,"f"),each(g(e,d,"f"),(({cmd:t,res:r,args:n})=>{let o=t.call(e,...n);o.then&&o.then((e=>r(e)));}));},r.onerror=function(e){console.error(e);};}keys(){const e=g(this,w,"f")||O;if(!e){const e=this;return new Promise(((t,r)=>{g(e,h,"m",S).call(e,e.keys,t);}))}return new Promise(((t,r)=>{const n=e.transaction("storage","readwrite").objectStore("storage").getAllKeys();n.onsuccess=function(e){t(n.result);},n.onerror=function(e){r(e);};}))}clear(){(g(this,w,"f")||O).transaction("storage","readwrite").objectStore("storage").clear();}set(e,t,r){const n=I(e),o=g(this,w,"f")||O;if(!o){const n=this;return new Promise(((o,s)=>{g(n,h,"m",S).call(n,n.set,o,e,t,r);}))}return new Promise(((e,s)=>{const a=o.transaction("storage","readwrite").objectStore("storage").put({[N]:n,value:t,expires:r});a.onsuccess=function(t){e(a.result.value);},a.onerror=function(e){s(e);};}))}get(e){const t=I(e),r=g(this,w,"f")||O;if(!r){const t=this;return new Promise(((r,n)=>{g(t,h,"m",S).call(t,t.get,r,e);}))}return new Promise(((e,n)=>{const o=r.transaction("storage","readwrite").objectStore("storage").get(t);o.onsuccess=function(t){e(o.result.value);},o.onerror=function(e){n(e);};}))}getString(e){return null}remove(e){const t=I(e),r=g(this,w,"f")||O;if(!r){const t=this;return new Promise(((r,n)=>{g(t,h,"m",S).call(t,t.remove,r,e);}))}return new Promise(((e,n)=>{const o=r.transaction("storage","readwrite").objectStore("storage").delete(t);o.onsuccess=function(t){e(o.result.value);},o.onerror=function(e){n(e);};}))}has(e){const t=I(e),r=g(this,w,"f")||O;if(!r){const t=this;return new Promise(((r,n)=>{g(t,h,"m",S).call(t,t.has,r,e);}))}return new Promise(((e,n)=>{const o=r.transaction("storage","readwrite").objectStore("storage").get(t);o.onsuccess=function(t){e(!!o.result);},o.onerror=function(e){n(e);};}))}}function j(e){switch(e){case"store":return new $;case"cookie":return new x;case"indexed":return new P}return new $}w=new WeakMap,d=new WeakMap,h=new WeakSet,S=function(e,t,...r){let n=g(this,d,"f");n||(n=[]),n.push({cmd:e,res:t,args:r});};let J=new $;var T={set:(e,t,r,n)=>J.set.call(J,e,t,r,n),get:e=>J.get.call(J,e),getString:e=>J.getString.call(J,e),remove:e=>J.remove.call(J,e),keys:()=>J.keys.call(J),has:e=>J.has.call(J,e),clear:()=>J.clear.call(J),getStore:j,set type(e){v.storeType=e,J=j(e);},get type(){return v.storeType}};

    let Store = T;
    const PERSISTENCE_TAG = "intercache::persistence";
    const DEFAULT_PREFFIX = "intercache_";
    let Caches = {};
    const Options = {
        persistence: false,
        keyPreffix: DEFAULT_PREFFIX,
        validator: (rs) => !isNil(rs),
    };
    //初始化
    if (eq(Store.get(PERSISTENCE_TAG), "1")) {
        unserialize();
    }
    async function unserialize() {
        const ks = await Store.keys();
        ks.forEach(async (k) => {
            try {
                const v = await Store.get(k);
                Caches[k] = JSON.parse(v);
            }
            catch (error) { }
        });
    }
    /**
     * 创建一个代理了缓存控制逻辑的异步函数
     * @param getter 数据getter
     * @param key 缓存key，支持函数或字符串。使用函数可实现同一接口不同参数进行不同缓存
     * @return 缓存化后的getter函数
     */
    function cacheable(getter, key, options) {
        let pfx = Options.keyPreffix;
        options = options || {};
        let validator = options.validator || Options.validator;
        return (function (key, validator) {
            return async function (...params) {
                let k = key;
                if (isFunction(key)) {
                    k = await key(params);
                }
                let wholeKey = pfx + k;
                if (isDefined(Caches[wholeKey])) {
                    return Caches[wholeKey];
                }
                else {
                    const rs = await getter.call(null, ...params);
                    if (validator(rs)) {
                        Caches[wholeKey] = rs;
                        if (Options.persistence) {
                            Store.set(wholeKey, rs);
                        }
                    }
                    return rs;
                }
            };
        })(key, validator);
    }
    /**
     * 删除指定key对应的缓存数据
     * @param {string | RegExp} key 缓存key。如果类型是字符串必须严格相等，如果类型是正则执行test
     */
    function del(key) {
        if (isString(key)) {
            key = Options.keyPreffix + key;
            Caches[key] = undefined;
            Store.remove(key);
        }
        else if (isRegExp(key)) {
            each(Caches, (v, k) => {
                if (key.test(k)) {
                    Caches[k] = undefined;
                    Store.remove(k);
                }
            });
        }
    }
    /**
     * 删除所有缓存数据
     */
    function delAll() {
        each(Caches, (v, k) => {
            if (startsWith(k, Options.keyPreffix, 0)) {
                Store.remove(k);
            }
        });
        Caches = {};
    }
    /**
     * 更新指定key缓存数据
     * @param {string} key 缓存key
     * @param {any} data 缓存数据
     */
    function put(key, data) {
        key = Options.keyPreffix + key;
        Caches[key] = data;
        if (Options.persistence) {
            Store.set(key, data);
        }
    }
    /**
     * 检测指定key是否存在缓存数据
     * @param {string} key 缓存key
     * @return true如果存在
     */
    function has(key) {
        key = Options.keyPreffix + key;
        return !!Caches[key];
    }
    /**
     * 获取指定key缓存数据
     * @param key
     * @returns
     */
    function get(key) {
        key = Options.keyPreffix + key;
        return Caches[key];
    }
    /**
     * 获取所有缓存map
     * @returns
     */
    function getAll() {
        return omitBy(Caches, (v, k) => k === PERSISTENCE_TAG);
    }
    var index = {
        add: cacheable,
        del,
        delAll,
        put,
        has,
        get,
        getAll,
        //getter & setter
        set persistence(v) {
            Options.persistence = v;
            if (v === 'cookie') {
                Store = T.getStore('cookie');
            }
            else if (v === 'indexed') {
                Store = T.getStore('indexed');
            }
            else if (v) {
                Store = T.getStore('store');
            }
            if (v) {
                Store.set(PERSISTENCE_TAG, "1");
                unserialize();
            }
        },
        get persistence() {
            return Options.persistence;
        },
        set keyPreffix(v) {
            Options.keyPreffix = isBlank(v) ? DEFAULT_PREFFIX : v;
        },
        get keyPreffix() {
            return Options.keyPreffix;
        },
        set validator(v) {
            Options.validator = v;
        },
        get validator() {
            return Options.validator;
        },
    };

    exports.cacheable = cacheable;
    exports.default = index;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
