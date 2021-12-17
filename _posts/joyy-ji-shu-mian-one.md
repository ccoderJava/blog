---
title: 欢聚集团(Joyy)—Java海外支付岗位—技术面(一面)总结
date: 2021-12-11 18:41:16
author: 聪聪
category: 面试
tags:
  - 面试总结
  - 技术总结
---

## 笔试题(牛客网)
给定一个房间连接,准时参加牛客网面试题笔试。
+ leetcode [144-二叉树的前序遍历](https://leetcode-cn.com/problems/binary-tree-preorder-traversal/)
+ 牛客网 [求二叉树的前序遍历](https://www.nowcoder.com/questionTerminal/501fb3ca49bb4474bf5fa87274e884b4)

## 首先是简单的自我介绍

面试官会根据简历和自我介绍内容进行提问，找到一个切入口。
首先是提问Java的一些内容。

## JVM内存模型知道吗？说一下你对JVM内存模型的理解。

主要有一个图很经典。脑海里面要有这个图。
![JVM内存模型](./files/interview/jvm_memory.jpg)
class文件->类加载器(classloader)->加载这个图,哪些内存区间是私有独立的，哪些是线程共享的。

## Java类加载器

主要从类加载流程(加载、验证、解析、初始化)几个过程说一下。
继续说一下经典的双亲委派模型
+ Bootstrap ClassLoader
+ Extension ClassLoader
+ Application ClassLoader
+ Custom ClassLoader

这几个加载器有一个图很经典脑海里面得有印象。
还有双亲委派模型的优势是哪些？
线程上下文加载器是如何对双亲委派模型进行破坏的。

## 说一下HashMap初始化的时候16和0.75是指什么
  + capacity 即容量，默认16。
  + loadFactor 加载因子，默认是0.75
  + threshold 阈值。阈值=容量*加载因子。默认12。当元素数量超过阈值时便会触发扩容。

这个要说一下HashMap的扩容机制。
  + 什么时候触发的扩容
  + JDK7中的扩容机制、元素迁移
  + JDK8中的扩容机制、元素迁移
然后还可以扩展说一下HashMap的底层原理、数据结构。

## 线程的几个状态

这个脑海里面也有个线程生命周期的图。New、Runnable、Running、Terminated、Timed_Waiting、Blocked、Waiting等。
![线程状态](./files/interview/java_thread_status.jpg)
在线程转移图中的各个状态是如何跃迁转移的。涉及到哪些方法，在什么时候触发。

## 说说你对线程池的了解

几个固定的创建方法、七大核心参数、四个拒绝策略这些都是需要提出来的。
+ ExecutorService中四大线程池创建方法，各自应用场景。
+ 线程池七大参数:`corePoolSize` `maximunPoolSize` `keepAliveTime` `unit` `workQueue` `threadFactory` `handler`
+ 四大拒绝策略: `AbortPolicy` `DiscardPolicy` `DiscardOldestPolicy`  `CallerRunsPolicy`

## 说说数据库索引
> + [MySQL索引](https://mp.weixin.qq.com/s/_bk2JVOm2SkXfdcvki6-0w)
> + [MySQL高频问题](https://zhuanlan.zhihu.com/p/350863953)
### 索引的优缺点
### 索引如何优化、为什么会失效
### 聚簇索引、覆盖索引
### 联合索引、最左前缀匹配
### 索引下推、查询优化


## 分布式事务
> + 参考[凤凰架构-事务处理](http://icyfenix.cn/architect-perspective/general-architecture/transaction/)
> + [分布式事务经典七中解决方案](https://segmentfault.com/a/1190000040321750)
### 2PC/TCC/3PC
### SAGA 事务
### 本地消息表+补偿事件
### 异常处理(防空回滚，幂等，防悬挂)
### 子事务屏障/原理

## RabbitMQ 如何保证消息可靠传递

## Synchronized和Lock锁
> + [Java锁Lock的种类](https://segmentfault.com/a/1190000022456039)

### Synchronized和Lock区别和认识
### 锁的类型
|锁/类型|公平/非公平锁|可重入/不可重入锁|共享/独享锁|乐观/悲观锁|
|---|---|---|---|---|
|synchronized|非公平锁|可重入锁|独享锁|悲观锁|
|ReentrantLock|都支持|可重入锁|独享锁|悲观锁|
|ReentrantReadWriteLock|都支持|可重入锁|读锁-共享，写锁-独享|悲观锁|

### ReadWriteLock/ReentrantLock
### 偏向锁/轻量级锁/重量级锁 /自旋锁



## 业务技术面
## 技术总监面
## HR面试

