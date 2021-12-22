---
title: 面试知识点-场景解决方案
date: 2021-12-22 15:34:45
author: 聪聪
category: 面试
tags:
  - 面试知识点
---


## 场景解决方案

### 解决流量激增问题
+ 数据预处理
+ Dubbo异步编程
+ 并发处理(redis单线程+自增数值) 提前将id分发到各个broker
+ redis集合set,存储商品ID和用户ID
+ 单用户IP的qps
+ DNS


### 接口耗时性能调优
+ 减少非必要循环
+ DB中SQL调优
+ 连接池调优
+ 串行换并行异步
+ 缓存(本地缓存Map/ConcurrentHashMap、Guava Cache、Redis)
+ NoSQL 
+ 异步(MQ、异步编程、阻塞队列)
+ JVM调优(gc、full gc、old cms gc)