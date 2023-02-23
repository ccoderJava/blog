---
title: 季度汽车-一面
date: 2023-02-23 16:27:36
author: 聪聪
category: 面试
tags:
- 面试
- Java
- TCP/IP
- MySQL
---

### Java基础

+ 1.7 1.8 HashMap区别
  + 结构、扩容
  + 为何会有头插法和尾插法区别
  + hash冲突如何解决的
  + 为何选择红黑树，而不是选择二叉树
+ ConcurrentHashMap线程安全如何保证
  + 分版本说明，segament、TreeNode
  + 为何弃用segament
  + CAS、synchronized、put操作区别
+ Synchronized 锁升级
  + 为什么存在锁升级过程
  + synchronized锁机制
+ ReentrantLock可重入锁
  + 公平、非公平
  + AQS

### MySQL

+ MySQL 事务隔离级别
  + RR为何和可以解决幻读
  + RR和RC区别
+ MVCC 可以实现RR的原因
  + 间隙锁、读快照

+ 日志流程 readlog binlog undolog

### ElasticSearch

+ 模糊搜索实现方式
+ 分片倾斜
+ 缺点：脑裂现象

### 算法题

+ 二叉树层序遍历
  + 使用队列原因
  + 广度优先BFS
  + 时间复杂度
  + 空间复杂度

