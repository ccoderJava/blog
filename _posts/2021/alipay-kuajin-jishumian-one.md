---
title: 支付宝-国际事业部-高级Java工程师
date: 2021-12-28 18:18:49
author: 聪聪
category: 面试
tags:
  - 蚂蚁金服
  - 面试总结
  - 技术总结
---

## 1.笔试题
### 1.1大文件查找前100个最大的数字
> 有一个文本文件(data.txt)里面每行为一个数字切文件预计有100W行左右,请以最快的速度在一台主机4核cpu/1G内存的主机上找出前100个最大的数字，并且输出其在文件所在行。
> 注意：请尽量提供该程序在生产运行所需全部信息。

### 1.2实现LRU算法(禁用LinkedHashMap)
> LRU(Least recently used 最近最少使用)算法根据数据的历史访问记录来进行淘汰数据，其核心思想是“如果数据最近被访问过，那么将来被访问的几率也更高”
> 设计一个实现以下接口的LRU缓存方法,不能使用LinkedHashMap.

```java
 public interface LruCache<K, V> {

    /**
     * Set the capacity of the total cache num
     * 
     * @param capacity
     *            capacity
     */
    void setCapacity(int capacity);

    /**
     * Update cache according to LRU definition. This time complexity of this method should be O(1).
     * 
     * @param cacheKey
     *            key
     * @param cacheValue
     *            value
     */
    void put(K cacheKey, V cacheValue);

    /**
     * 获取元素
     * 
     * @param cacheKey
     *            元素key
     * @return value
     */
    V get(K cacheKey);

}
```

## 2.面试题

### 跳表SkipList和ConcurrentSkipListMap源码分析

### JDK动态代理实现原理

### Spring AOP 实现原理
> + [Sring AOP 实现原理](https://www.cnblogs.com/liantdev/p/10132680.html)
> + [Spring AOP实现原理简介](https://blog.csdn.net/wyl6019/article/details/80136000)


### Spring Bean 的创建流程
> + [Spring单例Bean创建流程](https://blog.csdn.net/blacksnow_/article/details/112187019)
> + [Spring Bean的生命周期](https://www.jianshu.com/p/1dec08d290c1)

### CAP原则
> + [Eureka和Zookeper区别](https://www.cnblogs.com/chihirotan/p/11366394.html)

### 分布式系统接口幂等性设计
> + [接口幂等性设计实现](https://www.cnblogs.com/jack87224088/p/8688948.html)

### MySQL索引数据结构
> + [MySQL索引数据结构](https://blog.csdn.net/kongmin_123/article/details/82055901)
> + [MySQL索引类型](https://www.cnblogs.com/luyucheng/p/6289714.html)

### Redis缓存雪崩和穿透
> + [Reids缓存穿透、雪崩、击穿](https://baijiahao.baidu.com/s?id=1619572269435584821&wfr=spider&for=pc)
> + [缓存穿透、缓存击穿、缓存雪崩解决方案](https://blog.csdn.net/a898712940/article/details/116212825)
> + [缓存雪崩、击穿、穿透解决方案](https://segmentfault.com/a/1190000039300423)

### Redis分布式锁
> + [Redis分布式锁实现](https://segmentfault.com/a/1190000038988087)

### 线程池
> + [线程池工作原理](https://blog.csdn.net/lchq1995/article/details/85230399)

### 高并发解决方案
> + [Java高并发解决方案](https://www.cnblogs.com/alex96/p/12152388.html)

### CAS
> + [CAS无锁机制原理](https://www.cnblogs.com/toov5/p/9858129.html)

### Java锁的种类
> + [Java锁的种类](https://blog.csdn.net/nalanmingdian/article/details/77800355)
> + [JUC锁的分类](https://blog.csdn.net/oheg2010/article/details/89850181)
> + [分段锁理解](https://blog.csdn.net/weixin_40616523/article/details/86419754)
> + [ConcurrentHashMap锁了解](https://blog.csdn.net/qwe123147369/article/details/109601929)
> + [为什么ConcurrentHashMap是线程安全的](https://blog.csdn.net/weixin_48499022/article/details/107617132)

### hashCode和equals区别
> + [hashCode和equal区别](https://blog.csdn.net/QGhurt/article/details/106902777)

### HashMap 数据结构
> + [HashMap 底层实现](https://blog.csdn.net/qq_43370771/article/details/111353046)


### NIO、AIO、BIO区别
> + [BIO、NIO、AIO总结](https://blog.csdn.net/m0_38109046/article/details/89449305)
> + [IO和NIO区别](https://www.cnblogs.com/areyouready/p/7813135.html)

### 布隆过滤器
> + [布隆过滤器原理](https://www.cnblogs.com/qdhxhz/p/11237246.html)


### MySQL日志
> + [binlog日志三种模式选择和配置](https://www.cnblogs.com/rinack/p/9595370.html)


### 热点账户
> + [热点账户高并发记账方案](https://zhuanlan.zhihu.com/p/210879230)

### 分布式事务解决方案
> + [六种分布式事务解决方案](https://zhuanlan.zhihu.com/p/183753774)


### Redis底层数据结构
> + [Redis底层数据结构](https://www.cnblogs.com/ysocean/p/9080942.html#_label1)
> + [Redis数据结构基础](https://juejin.cn/post/6844903644798664712)
> + [Redis几种数据结构解析](https://segmentfault.com/a/1190000040102333)

### MySQL 事务隔离界别
> + [MySQL事务隔离界别](https://www.cnblogs.com/digdeep/archive/2015/11/16/4968453.html)
> + [MySQL事务、日志、锁、索引](https://xie.infoq.cn/article/8f8ec3f8baa47ae0ca42d3481)

### 彻底弄懂MySQL日志
> + [MySQL日志|事务隔离](https://www.cxyxiaowu.com/10740.html)

### 接口性能优化方案
> + [接口性能优化实践方案](https://cloud.tencent.com/developer/article/1637579)

### 网关限流
> + [限流算法对比、网关限流](https://segmentfault.com/a/1190000020745218)