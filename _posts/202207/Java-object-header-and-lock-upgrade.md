---
title: Java对象头和锁的升级过程
date: 2022-07-28 14:38:57
author: 聪聪
category: Java
tags:
- 锁
- 技术总结
---
[toc]

hello，大家好，我是聪聪。

---


今天意外看到Java中有一个查看Java对象头的工具类`JOL`，正好可以通过Java对象头中所存储的信息来回顾一次锁的升级过程。

### 1.JOL(Java Object Layout)
> （Java对象布局）是分析JVM中对象布局方案的微型工具箱。这些工具大量使用不安全、JVMTI和可服务性代理（SA）来解码实际的对象布局、足迹和引用。这使得JOL比依赖堆转储、规范假设等的其他工具更精确。

可以查看GitHub仓库:[https://github.com/openjdk/jol](https://github.com/openjdk/jol)
相关依赖：

```xml
<dependency>
  <groupId>org.openjdk.jol</groupId>
  <artifactId>jol-core</artifactId>
  <version>put-the-version-here</version>
</dependency>
```
话不多说，我们就从一个简单的问题开始：
`Object o = new Object()`这一行代码中对象实例`o`占据多少字节呢？
### 2.Java对象头
想要知道上述对象实例占据多少字节，可以动手看。
```java
public static void main(String[] args) {
    Object o = new Object();

    //得到一个类的布局格式，human-readable layout info 我们可以读得懂的
    String objectHeader = ClassLayout.parseInstance(o).toPrintable();

    System.out.println(objectHeader);
}

//打印信息
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```
先说结论：一个简单的Object对象实例占据16个字节。分别由以下内容所组成：
对象在内存中存储的布局可以分为三块区域：`对象头（Header）`、`实例数据（Instance Data）`和`对齐填充（Padding）`。
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-16-110323.png)
注意：以hotspot虚拟机为例。

- `Mark Word`标记字段：该部分默认存储对象的`HashCode``分代年龄``锁标记位`等信息。这些信息都是与对象本身无关的信息，因此Mark Word被设计成一个非固定的数据结构以便在极小的空间内存存储尽量多的数据。可以对象的状态复用自己的存储空间，在运行期间Mark Word里存储的数据会随着锁标志位的变化而变化。
- `Klass Pointer`指向对象类元数据的指针，JVM通过该指针来确定对象是哪个类的实例。

上面`Description`一列表示数据类型。`Mark Word`在64位虚拟机中占据8个字节(64bit) .上下两行数据。这个信息如何阅读，等会下面会介绍到，在这个`Mak Word`中存储了很多信息：`HashCode` 、`synchronized`等信息。
```java
0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)

```
`Mark Word`固定8字节。
在第三行`Object header`为`Klass Pointer`为对象类型指针，4字节。
因此对象头固定12字节。
由于这个`o`对象没有任何实例数据，因此`Instance Data`中对象实际数据为0.
同时对象头的数据按照约定需要被`8`整除(64虚拟机寻址长度决定) 。

- `padding data`补齐长度4字节。对象长度总共为12 +4 = 16字节。

![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-16-111021.png)
注意：Java1.8默认是开启了指针压缩，认为 2的32次方 4GB内存是足够Java程序使用的。可以手动使用JVM参数`-XX:-UseCompressedOops`关闭指针压缩。

上面说到了对象头中涉及到的`HashCode`、`锁标记位`，下面就来介绍。
#### 2.1 MarkWord中HashCode
还是刚刚上面那个`Object o = new Object()`我们来打印其`hashCode`信息和Java对象头信息。
```java
public static void main(String[] args) {
    Object o = new Object();

    System.out.println(o);
    System.out.println(Integer.toHexString(o.hashCode()));
    System.out.println(ClassLayout.parseInstance(o).toPrintable());
}
//打印信息
java.lang.Object@39ed3c8d
39ed3c8d
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           01 8d 3c ed (00000001 10001101 00111100 11101101) (-314798847)
      4     4        (object header)                           39 00 00 00 (00111001 00000000 00000000 00000000) (57)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064437.png)
可以看到这里存储了对象的`hashCode`信息：39ed3c8d。一次计算hashCode，之后每次都是从该对象的对象头中拿取信息的。
从对象的头信息中也可以看到该对象的hashCode，但是这个值是倒过来的，这是因为大小端存储所导致的：

- Big-Endian：高位字节存放于内存的低地址端，低位字节存放于内存的高地址端
- Little-Endian：低位字节存放于内存的低地址端，高位字节存放于内存的高地址端

![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064043.png)
#### 2.2 MarkWord中的锁标志
从上面的锁标志中可以总结出以下表格：

| **偏向锁 1bit(是否偏向)** | **锁标志 2bit** | **锁状态** |
| --- | --- | --- |
| 0 | 01 | 无状态(new) |
| 1 | 01 | 偏向锁 |
| - | 00 | 轻量级锁(CAS、自旋锁、无锁、自适应自旋锁) |
| - | 10 | 重量级锁 |
| - | 11 | GC标记 |

![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064051.png)
上面一个锁标记的表格，和锁升级的流程图。结合两张图和下面代码看看如何升级的。

### 3.锁升级过程
#### 3.1 3无状态普通对象
```java
public static void main(String[] args) {
    Object o = new Object();

    System.out.println(ClassLayout.parseInstance(o).toPrintable());
}
//打印信息
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064102.png)
根据上面表格中可以确定：

- 001 ：偏向锁标记0，锁状态 01。 因此为`无状态` 这就是一个普通对象。

#### 3.2 匿名偏向(偏向锁)
先说说什么是偏向锁：只有一个线程进入同步块。不阻塞，执行效率高（只有第一次获取偏向锁时需要CAS操作，后面只是比对ThreadId）。
缺点是：局限性较高，如果有锁的竞争产生时，需要进行偏向锁的撤销便会产生消耗。
下面写一个偏向锁。
```java
public static void main(String[] args) throws Exception {
    //启动main方法前先暂停5秒，等到JVM全部启动完毕。
    Thread.sleep(5000L);
    Object o = new Object();

    System.out.println(ClassLayout.parseInstance(o).toPrintable());
}
//打印信息
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064114.png)
可以看到关键锁标记未知已经是101：偏向锁。

> 注意：为什么这里需要sleep：5s。根据偏向锁的原理：只有一个线程进入同步块。JVM启动时有很多其他线程在执行，那么就无法满足这一点。大概等待5s让JVM完全启动完毕后：当前只剩下一个主线程执行任务就可以得到一个偏向锁。

- 匿名偏向：就是当前并没有线程需要偏向该锁对象，但是该对象允许偏向锁的初始状态。第一个试图获取该锁的线程将会面临这个情况，使用原子CAS指令可将该锁对象绑定于当前线程。
#### 3.3 轻量级锁
介绍一下轻量级锁

- 虽然很多线程，但是没有冲突，多条线程进入同步块，但是线程进入时间错开因而并未争抢锁
- CAS替代了互斥同步操作
- 重点是多线程错开进入同步块，未造成锁的竞争

看下面的轻量级锁：
```java
public static void main(String[] args) throws Exception {
    //启动main方法前先暂停5秒，等到JVM全部启动完毕。
    sleep(5000L);
    Object o = new Object();

    //程序启动时 该对象的锁标志信息是:匿名偏向
    System.out.println(ClassLayout.parseInstance(o).toPrintable());

    for (int i = 0; i < 2; i++) {
        new Thread(() -> doSomething(o)).start();
    }
    //多线程执行完毕后观察当前对象锁标志信息
    System.out.println(ClassLayout.parseInstance(o).toPrintable());
}

private static void doSomething(Object o) {
    //每一个进来的进行争抢锁的线程进行停留不同时间
    sleep(new Random().nextInt(4) * 30L);
    synchronized (o) {
        //do something 加锁代码
        //打印当前锁对象的Object header信息 观察锁标志信息
        System.out.println(ClassLayout.parseInstance(o).toPrintable());
    }
}

private static void sleep(long millis) {
    try {
        Thread.sleep(millis);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}

//打印信息
// 第一次执行 匿名偏向 101
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

//第一次循环 当前只有一个线程，当前线程通过CAS尝试获得该锁对象绑定于该线程，CAS成功
//该对象为锁标志位 偏向锁 101
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

// 第二次循环 当前有两个线程进行执行
// 两个线程随机停留 n 毫秒，满足：多线程错开进入同步块，未造成锁的竞争，目前是轻量级锁 000
// 两个线程都能够CAS成功
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           b0 f8 a5 0b (10110000 11111000 10100101 00001011) (195426480)
      4     4        (object header)                           03 00 00 00 (00000011 00000000 00000000 00000000) (3)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

//循环结束
//偏向锁已被打破:多线程CAS竞争产生时，偏向锁已跃迁为轻量级锁 000
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           b0 28 b6 0b (10110000 00101000 10110110 00001011) (196487344)
      4     4        (object header)                           03 00 00 00 (00000011 00000000 00000000 00000000) (3)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```
上面注释中已经解释了，四次该对象的头部信息锁的跃迁过程：
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064121.png)

#### 3.4 重量级锁
先确定一下重量级锁的概念

- 发生了锁争抢的情况：多条线程进入同步块并争用锁
- 同步互斥
- 不会一直等待锁释放空消耗CPU
- 阻塞，上下文切换，用户态切换到内核态重量级操作，消耗操作系统资源
- 注意点：对线程同时进入同步块造成锁竞争，避免空消耗CPU，将线程级别由JVM用户态提交到操作系统内核态。

下面写一个多线程同事竞争锁就可以升级到重量级锁。
```java
public static void main(String[] args) throws Exception {
    //启动main方法前先暂停5秒，等到JVM全部启动完毕。
    sleep(5000L);
    Object o = new Object();

    //程序启动时 该对象的锁标志信息是:匿名偏向
    System.out.println(ClassLayout.parseInstance(o).toPrintable());

    for (int i = 0; i < 2; i++) {
        new Thread(() -> doSomething(o)).start();
    }
    //多线程执行完毕后观察当前对象锁标志信息
    System.out.println(ClassLayout.parseInstance(o).toPrintable());
}

private static void doSomething(Object o) {
    //每一个进来的进行争抢锁的线程进行停留不同时间
    //  sleep(new Random().nextInt(4) * 30L);
    synchronized (o) {
        //do something 加锁代码
        //打印当前锁对象的Object header信息 观察锁标志信息
        System.out.println(ClassLayout.parseInstance(o).toPrintable());
    }
}

private static void sleep(long millis) {
    try {
        Thread.sleep(millis);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}

//打印信息
// 第一次执行 匿名偏向 101
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

// 第一次循环 多线程进入同步代码块发生锁的竞争，互斥同步
// 由偏向锁升级为重量级锁 010
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           5a 93 01 3c (01011010 10010011 00000001 00111100) (1006736218)
      4     4        (object header)                           8d 7f 00 00 (10001101 01111111 00000000 00000000) (32653)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

// 第二次循环 同理 多线程在同步代码块争抢对象锁 互斥同步
// 重量级锁 010
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           5a 93 01 3c (01011010 10010011 00000001 00111100) (1006736218)
      4     4        (object header)                           8d 7f 00 00 (10001101 01111111 00000000 00000000) (32653)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

//重量级锁 010
java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           5a 93 01 3c (01011010 10010011 00000001 00111100) (1006736218)
      4     4        (object header)                           8d 7f 00 00 (10001101 01111111 00000000 00000000) (32653)
      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```
上面重量级锁代码和轻量级锁代码只修改了一行:  18行`sleep(new Random().nextInt(4) * 30L);`关闭随机停留时间：那么多个线程就会同时进入到同步代码块，会产生锁的竞争。
操作系统避免线程空转等锁消耗CPU,将线程级别有JVM用户态升级为操作系统内核态。线程的进行阻塞不再消耗CPU，等待锁释放时再将其唤醒。
### 4.锁升级原因

- 锁升级是为了减低了synchronized(初始设计就是重量级锁)带来的性能消耗。
  - 没有优化以前，synchronized是重量级锁-悲观锁
  - 使用 wait 和 notify、notifyAll 来切换线程状态非常消耗系统资源。
- 线程运行到synchronized代码块时
  - 程序的运行级别从用户态切换到内核态，
  - 把所有的线程挂起
  - cpu通过操作系统指令，去调度多线程之间，谁执行代码块，谁进入阻塞状态。
- 这样会频繁出现程序运行状态的切换，线程的挂起和唤醒，这样就会大量消耗资源，程序运行的效率低下。
- 为了提高效率
- 将锁分为 无锁、偏向锁、轻量级锁、重量级锁 状态
- 尽量避免多线程访问公共资源的时候，进行运行状态的切换（用户态切换到内核态）所造成的的性能损耗。


---

了解更多内容，可以关注我的微信公众号，更多首发文章。

![wechat](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064228.bmp)

