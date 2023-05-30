# Intercache
![npm](https://img.shields.io/npm/v/intercache)
![NPM](https://img.shields.io/npm/l/intercache)

A lightweight cache interface can make your data-getters cacheable in a non-intrusive way

## What's the difference to [cache-interface](https://w3c.github.io/ServiceWorker/#cache-interface)

||intercache|cache-interface|
| ------ | :------: | :------: |
|data-getter|any getters|HTTP only|
|user-friendly|√|×|
|non-intrusive|√|×|

## Used for
1. MASTER DATA caching like Dict/Org/User/...
2. Full data caching in an offline App
3. HTTP response or long term computing result caching

## Features
- Cache by a higher-order function in a non-intrusive way
- Different kinds of cache stores
- Update one or all caches
- For all kinds of getters

## Installation
```
npm i intercache
```

## Usage
```js
/********** API.js **********/
import {cacheable} from 'intercache'
//1. API getter
function getAllUsers(){
    return new Promise((res,rej)=>{
        setTimeout(()=>res('ok'),1000)
    });
}
//2. Cacheable getter
let getUsersCache = cacheable(getAllUsers,{key:'all_users'})
//3. Export the new API
export {getUsersCache}
```

```js
/********** Business.js **********/
const users = await getUsersCache()
```

## API
```ts
import Cache,{cacheable} from 'intercache'
//make a getter cacheable then return a cached-getter
//You can have different kinds of caches by passing different params in the same getter While key is a function
//Validator is used to check if the return value of the getter can be cached, default !isNil
const cacheGetter = cacheable(getter:Function, key: ((params: any[]) => string|Promise<string>) | string, options?:{validator?:(rs: any) => boolean}): (...params: any[]) => Promise<any>

//Enable persistence，default false
Cache.persistence = true | 'store' | 'cookie' | 'indexed';
//Global key preffix, default 'cache.js_'
Cache.keyPreffix = 'intercache_'
//Global validator, default (rs) => !isNil(rs),
Cache.validator = isString

Cache.put(key: string, data: any)

Cache.del(key: string | RegExp)

Cache.has(key: string)

Cache.get(key: string)

Cache.getAll()

Cache.delAll()

//cacheable alias
Cache.add
```

## Demo
见test/index.spec.ts