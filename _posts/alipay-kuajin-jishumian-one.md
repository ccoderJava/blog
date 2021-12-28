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