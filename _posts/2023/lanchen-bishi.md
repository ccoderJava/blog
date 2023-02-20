---
title: 笔试总结
date: 2023-02-20 18:50:36
author: 聪聪
category: 面试
tags:
- 面试
- Java
- TCP/IP
- MySQL
---


### 如果要对用户发表的动态进行点赞统计，在考虑性能的情况下详细说出你的设计方案（包括如何去重、并发）

### 假如以下sql有慢查，如何分析，如果要优化，该如何做，讲讲原因

 ```sql
    select
    *
    from
    t_task
    where
    status=1
    and operate_id=20839
    and start_time>1371169729
    and start_time<1371174603
    and type=2;
```

### 请列举一个空间换时间的Java集合类，谈谈底层是如何实现的

### 描述：用户发起的实时请求，服务追求响应时间。比如说用户要查看一个商品的信息，那么我们需要将商品维度的一系列信息如商品的价格、优惠、库存、图片等等聚合起来，展示给用户，那这个接口用什么实现比较好，讲讲原理

### 如果需要实现“1小时最热门” 榜单，在考虑访问性能的情况下如何实现呢？请具体描述

### 线上运营反馈系统现在很卡，你觉得可以从哪些方面去定位问题

### 请根据以下场景写出实现代码或者伪代码：请在不使用Java api的情况下实现
给定一个整数数组，调整数组中元素的顺序，使得所有偶数位于数组的前半部分，所有奇数位于数组的后半部分，要求时间复杂度为O(n)

### 给你两个文件，各存放60亿条URL，每条URL占用64字节，内存限制是4G，让你找出两个文件共同的URL。讲讲思路