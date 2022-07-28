---
title: MySQL中sql_mode参数导致的问题
date: 2022-07-29 10:49:10
author: 聪聪
category: MySQL
tags:
- MySQL
- 技术总结
---


[toc]

hello，大家好，我是聪聪。

---

### 1.故事背景

今天在auto_test环境中发现新加密数据均无法解密,全部返回密文。

那么就意味着此时加解密插件未生效或者解密数据时出现了异常，直接返回了`原文` 。

查看日志发现待解密数据`dataDec-1hYWHtIqpctKu7DY+TChRjg=` 在去掉前缀`dataDec-1` 后无法进行Base64转换`Input byte array has wrong 4-byte ending unit`  ,那么有理由相信是因为落库密文是错误的。

然后检查该字段长度

```
account_no	varchar(32)	YES
```

正好存储数据`dataDec-1hYWHtIqpctKu7DY+TChRjg=` 长度也是32。然后这个密文格式长度似乎也少了，会不会MySQL进行了截断。

如果截断了，那么此时数据应该都丢失了，所有密文都无法解密了。



### 2.问题原因

查询资料，发现数据库有`sql_mode`参数控制输入SQL数据是否进行校验。

```
select @@SESSION.sql_mode;

NO_ENGINE_SUBSTITUTION

########

SELECT @@GLOBAL.sql_mode;

NO_ENGINE_SUBSTITUTION
```

查看到这个配置时，那么问题就是因为设置了`sql_mode`属性，是非严格校验，落库数据长度超过该字段长度，自动进行截取。



### 3.解决方法

修改数据库中`sql_mode`参数为严格模式，需要设置为以下属性

```
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

设置方法：修改`session_variables` 和`global_variables` 全局和会话的该属性配置。

```
select * from session_variables t where  t.VARIABLE_NAME = 'sql_mode';
select * from global_variables t where  t.VARIABLE_NAME = 'sql_mode';
```

旧的数据已经丢了，新的数据需要扩展表字段长度，重新落库产生。

这个属性一定要修改为严格模式，可以帮助我们校验当字段落库值较长时出现`data to long` 异常，避免出现错误数据，造成不可换回损失。

### 4. sql_mode有什么用呢

sql_mode有常用的一些值，分别如下：

+ `ONLY_FULL_GROUP_BY` ：对于GROUP BY聚合操作，如果在SELECT中的列，没有在GROUP BY中出现，那么这个SQL是不合法的，因为列不在GROUP BY从句中。
  + 虽然说写SQL时，select列中一定要是group by的属性或者聚合函数。但是`写错了` SQL，但是本地可以执行通过了，到了生产又不行，那么就需要校验一些是否有该项配置。
+ `STRICT_TRANS_TABLES` ：在该模式下，如果一个值不能插入到一个事务表中，则中断当前的操作，对非事务表不做限制。
  + 可以理解为该项配置会使MySQL对插入的数据进行严格校验，错误数据不能够插入并且报错。
  + 开发当中可以理解为：数据到达DB层时都应该是`合法` 的，数据的校验应该在业务层而不是在DB层面，但是该项配置是我们数据落地的最后一道保障，也是需要开启的。
+ `ERROR_FOR_DIVISION_BY_ZERO` ：在INSERT或UPDATE过程中，如果数据被零除，则产生错误而非警告。如果未给出该模式，那么数据被零除时MySQL返回NULL
+ `NO_AUTO_CREATE_USER` ：禁止GRANT创建密码为空的用户
+ `NO_ENGINE_SUBSTITUTION` ：创建表时如果指定一个不支持或者不存在的引擎会报错
+ `NO_ZERO_DATE`：不允许年月日同时为零。例如：0000-00-00。
+ `TRADITIONAL` ：当向mysql数据库插入数据时，进行数据的严格校验，错误数据不能插入并报错。用于事物时，会进行事物的回滚。





还有一些其他的sql_mode配置在下面参考链接中，可以自习查看MySQL中对于该参数的一些使用场景及其配置。

### 5.参考资料

+ [Server SQL Modes https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)

---

了解更多内容，可以关注我的微信公众号，更多首发文章。
![wechat](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064228.bmp)
