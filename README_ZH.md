# Intercache
![npm](https://img.shields.io/npm/v/intercache)
![NPM](https://img.shields.io/npm/l/intercache)

一个轻量级缓存接口，可为所有getter赋予缓存能力，能够显著改善远程/长时计算数据的响应速度并大幅提升用户体验

## 和[cache-interface](https://w3c.github.io/ServiceWorker/#cache-interface)的区别
||intercache|cache-interface|
| ------ | :------: | :------: |
|data-getter|any getters|HTTP only|
|user-friendly|√|×|
|non-intrusive|√|×|

## 使用场景
1. 主数据缓存，如字典信息、组织机构、人员信息等
2. 全数据缓存用于离线应用
3. 对任何request数据或基于(request/大量)数据进行计算后的数据进行缓存，以解决网络波动、长时计算带来的UI卡顿

## 特性
- 可使用高阶函数方式实现 **非侵入** 的缓存扩展
- 支持不同的缓存方案
- 可通过指定key进行单个/全部缓存更新
- 可用于任何类型的getter

## 安装

```
npm i intercache
```

## 用法
```js
/********** 接口文件 **********/
import {cacheable} from 'intercache'
//1. 接口文件中定义的方法
function getAllUsers(){
    return new Promise((res,rej)=>{
        setTimeout(()=>res('ok'),1000)
    });
}
//2. 扩展缓存能力
let getUsersCache = cacheable(getAllUsers,{key:'all_users'})
//3. 导出接口
export {getUsersCache}
```

```js
/********** 业务文件 **********/
const users = await getUsersCache()
```

## API
```ts
import Cache,{cacheable} from 'intercache'
//包装getter并返回包装后的异步函数
//key支持函数或字符串，使用函数可实现同一接口不同参数进行不同缓存；相同key对应的缓存数据会被覆盖;校验器用于检测是否对rs进行缓存，默认 !isNil
const cacheGetter = cacheable(getter:Function, key: ((params: any[]) => string|Promise<string>) | string, options?:{validator?:(rs: any) => boolean}): (...params: any[]) => Promise<any>

//开启持久化，默认false
Cache.persistence = true | 'store' | 'cookie' | 'indexed';
//设置全局缓存key前缀，默认'cache.js_'
Cache.keyPreffix = 'intercache_'
//设置全局校验器，默认(rs) => !isNil(rs),
Cache.validator = isString

//更新指定key缓存数据
Cache.put(key: string, data: any)

//删除指定key缓存数据
Cache.del(key: string | RegExp)

//检测指定key缓存数据
Cache.has(key: string)

//获取指定key缓存数据
Cache.get(key: string)

//获取所有缓存数据map
Cache.getAll()

//删除所有缓存数据
Cache.delAll()

//cacheable别名
Cache.add
```

## demo
见test/index.spec.ts