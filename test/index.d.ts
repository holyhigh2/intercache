/**
 * 创建一个代理了缓存控制逻辑的异步函数
 * @param getter 数据getter
 * @param key 缓存key，支持函数或字符串。使用函数可实现同一接口不同参数进行不同缓存
 * @return 缓存化后的getter函数
 */
export declare function cacheable(getter: Function, key: ((params: any[]) => string | Promise<string>) | string, options?: {
    validator?: (rs: any) => boolean;
}): (...params: any[]) => Promise<any>;
/**
 * 删除指定key对应的缓存数据
 * @param {string | RegExp} key 缓存key。如果类型是字符串必须严格相等，如果类型是正则执行test
 */
declare function del(key: string | RegExp): void;
/**
 * 删除所有缓存数据
 */
declare function delAll(): void;
/**
 * 更新指定key缓存数据
 * @param {string} key 缓存key
 * @param {any} data 缓存数据
 */
declare function put(key: string, data: any): void;
/**
 * 检测指定key是否存在缓存数据
 * @param {string} key 缓存key
 * @return true如果存在
 */
declare function has(key: string): boolean;
/**
 * 获取指定key缓存数据
 * @param key
 * @returns
 */
declare function get(key?: string): any;
/**
 * 获取所有缓存map
 * @returns
 */
declare function getAll(): any;
declare const _default: {
    add: typeof cacheable;
    del: typeof del;
    delAll: typeof delAll;
    put: typeof put;
    has: typeof has;
    get: typeof get;
    getAll: typeof getAll;
    persistence: boolean | "store" | "cookie" | "indexed";
    keyPreffix: string;
    validator: (rs: any) => boolean;
};
export default _default;
