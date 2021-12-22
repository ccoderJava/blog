---
title: 面试知识点-Java
date: 2021-12-22 15:34:45
author: 聪聪
category: 面试
tags:
  - 面试知识点
---


## Java

### HashMap扩容机制

### HashMap无法保证线程安全的原因

### AVL树和红黑树比较

### ConcurrentHashMap 如何保证线程安全
+ CAS Synchronized
+ Segment ReentrantLock

### 优先队列PriorityQueue的原理

### LinkedTransferQueue和SynchronousQueue区别

### ConcurrentSkipListMap跳表

### 阻塞队列的有界和无界

### BIO、NIO、AIO

### final关键字

### volatile关键字

### Tomcat为什么要重写类加载器
+ **无法实现隔离性**
+ **无法实现热替换**
+ **如何打破双亲委派模型**




## JVM

### 堆空间为什么要分代

### GC安全点和安全区域

### 垃圾回收触发时机
+ Minor GC
+ Major GC
+ Full GC

### 类加载过程

### 垃圾回收
##### 对象生命周期
##### 垃圾回收算法(标记清除、标记复制、标记清除整理)
##### 垃圾回收器(Parallel、CMS、G1等)
##### 垃圾回收过程

### 方法区演进(分JDK版本)

### 虚拟机栈的理解

### 栈帧原理

### 栈帧组成结构

### 对象怎么定位(句柄访问、(HotSpot)直接指针)

### Unsafe类介绍

### 逃逸分析的作用

### cglib和JDK动态代理

### 动态代理实现原理

### Java的TLAB(Thread Local Allocation Buffer)

### OOM异常排查方式



## JUC

### Java创建线程方式

### 线程池核心参数、创建方式、拒绝策略

### 线程各状态生命周期

### 线程池复用原理

### Synchronized和Lock锁区别

### CountDownLatch和CyclicBarrier

### ReentrantLock源码



## Redis 

### Redis单线程为什么这么快

### Redis的AOF和RDB策略

### Redis为何使用Pipeline

### Redis主从同步过程


## MySQL

### MySQL 行锁、页锁、表锁

### 死锁原理
+ MVCC
+ 2PL
+ 为何发生死锁

### MySQL原子性(undo log)和持久性(redo log)如何保证的

### InnoDB行级锁

### InnoDB和MyISAM区别

### MySQL的聚簇索引和非聚簇索引


### MySQL如何解决超大分页
+ ID连续优化
+ 索引覆盖优化

### MySQL回表操作

### 索引覆盖和索引下推


### 消息队列MQ

### 如何保证RabbitMQ高可用

### 如何保证RabbitMQ消息可靠性

### 如何解决RabbitMQ消息堆积

### 如何保证RabbitMQ消息幂等性


## MyBatis

### MyBatis如何支持延迟加载

### Mybatis缓存




## Spring

### Spring三级缓存

### Spring Bean生命周期

### Spring Bean的作用域

### Spring AOP和IOC

### @SpringBootApplication注解作用
+ @SpringBootConfiguration
+ @EnableAutoConfiguration
+ @ComponentScan


## 分布式架构

### 单体架构、垂直架构、面向服务架构SOA、微服务架构

### 分布式事务

### 分布式锁

### SkyWalking核心组件(分布式链路追踪)
+ Agent探针 采集服务信息trace grpc上报
+ OAP 收集信息、响应UI请求
+ UI

### 配置中心(nacos、apollo、SpringCloud Config)差异


## Zookeeper

### Zookeeper如何解决脑裂问题
+ 假死
+ 脑裂
+ 心跳


## Dubbo

### Dubbo RPC调用过程

### Dubbo SPI机制

### Dubbo动态代理javassist和jdk区别

### Dubbo服务本地缓存

### Dubbo服务治理、服务发现、服务优化

### Dubbo中负载策略、熔断策略、集群方式


## 特殊场景解决方案

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