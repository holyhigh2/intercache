/**
 * @jest-environment jsdom
 */
import { isNull, join, map } from 'myfx';
import Cache,{cacheable} from './index'

Cache.keyPreffix = 'intercache_'
Cache.persistence = true

///////////////////////////////////////////// 扩展缓存
function getUsers(...params:any[]){
    return new Promise((res,rej)=>{
        setTimeout(()=>res(join(
            map(params, (p: any) => p + ""),
            "-"
          )),1000)
    });
}
function getUsers2(){
    return new Promise((res,rej)=>{
        setTimeout(()=>res(null),1000)
    });
}
function getUsers3(){
    return new Promise((res,rej)=>{
        setTimeout(()=>res(''),1000)
    });
}
let getUsersCache = cacheable(getUsers,async function (rs){ await setTimeout(() => {
    console.log('timeout')
}, 1000); return rs.length+1+''})
let getUsersCache2 = cacheable(getUsers2,'yyy')
let getUsersCache3 = cacheable(getUsers3,'zzz',{validator:isNull})

test('首次调用缓存方法',async ()=>{
    await getUsersCache(1,2,3)
    console.log('timeout end')
    await getUsersCache(1,2)
    await getUsersCache(1)
})
test('再次调用缓存方法',async ()=>{
    await getUsersCache(1)
})
test('再再次调用缓存方法',async ()=>{
    await getUsersCache(1,2)
})

///////////////////////////////////////////// 更新缓存
test('更新缓存后调用方法',async ()=>{
    Cache.put('1','xxxxx')
    let data = await getUsersCache()
    console.log(data)
})

///////////////////////////////////////////// 删除缓存
test('删除缓存后调用方法',async ()=>{
    Cache.del('1')
    let data = await getUsersCache()
})
test('删除缓存后再次调用方法',async ()=>{
    let data = await getUsersCache()
})

///////////////////////////////////////////// 缓存校验
test('默认校验，有效',async ()=>{
    let data = await getUsersCache()
    console.log(data)
})
test('默认校验，有效，再次调用',async ()=>{
    let data = await getUsersCache()
    console.log(data)
})
test('默认校验，无效',async ()=>{
    let data = await getUsersCache2()
    console.log(data)
})
test('默认校验，无效，再次调用',async ()=>{
    let data = await getUsersCache2()
    console.log(data)
})

test('自定义校验，无效',async ()=>{
    let data = await getUsersCache3()
    console.log(data)
})
test('自定义校验，无效，再次调用',async ()=>{
    let data = await getUsersCache3()
    console.log(data)
})

///////////////////////////////////////////// 查询
test('查询',async ()=>{
    console.log(Cache.has('xxx'),Cache.getAll())
})