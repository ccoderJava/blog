---
title: portainer下配置Redis Sentinel
date: 2022-07-28 14:20:03
author: 聪聪
category: docker
tags:
- docker
- 技术总结
---

hello，大家好，我是聪聪。

今天在本地启动一些项目时，无法连接公司Redis服务。
那就在本地`portainer`上拉起整个Redis集群

对了 ，portainer是一个可视化的docker操作页面，提供应用模板快速部署、镜像网络数据卷基本操作、事件日志显示、容器console操作、swarm集群和服务集群管理。同时还提供用户权限、租户管理。
当然可以链接到云服务上进行镜像管理和gitlab私服仓库管理。
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135430.png)
管理正在运行的容器列表：
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135439.png)

### 1.Redis 集群
一主二从三哨兵 (1:master  2:slave 3:sentinel)
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135445.png)

### 2.docker-compliance文件
#### 2.1 创建一主二从
先创建一个一主二从的Redis集群。
```c
version: '3'
services:
  master:
    image: redis
    container_name: redis-master
    command: redis-server --requirepass redis_pwd  --masterauth redis_pwd
    ports:
      - 6380:6379
  slave1:
    image: redis
    container_name: redis-slave-1
    ports:
      - 6381:6379
    command:  redis-server --slaveof redis-master 6379 --requirepass redis_pwd --masterauth redis_pwd
  slave2:
    image: redis
    container_name: redis-slave-2
    ports:
      - 6382:6379
    command: redis-server --slaveof redis-master 6379 --requirepass redis_pwd --masterauth redis_pwd
```
注意

- 这里面设置了`master`节点密码为`redis_pwd`，那么同样也需要将slave进行同步密码masterauth
- 当master进行故障转移时，slave从节点也会变成master，master变成slave，因此在当前master中也需要携带masterauth参数。

![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135319.png)
#### 2.2 创建一个网桥

- 可以通过`docker network create`名称创建一个`docker-sentinel`网络
- 通过portainer 中`network`页面创建`docker-sentinel`网络，后续哨兵也需要添加到该网桥中来。

![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135333.png)

- `Name` network名称
- `Driver`docker网络驱动类型，这里我们选择bridge ，容器之间需要进行通信。
   - `host`: 使用docker宿主机网络
   - `bridge`: 该网络支持在**同一个宿主机**上的各个容器实例之间的通信。bridge网络是一个独立的网络空间，在网络空间内部的各个容器实例能够直接通信。
   - `none`: 是一个完全隔离的自治网络，甚至与Docker宿主机的网络都不通，必须手工配置网卡后才能够使用。加入到该网络的容器实例，往往要在后续设置中加入到其他的第三方网络。
   - `overlay`：该类型的网络适用于**Docker宿主机集群**中的各个独立的容器实例之间通信。
   - `macvlan`：该类型的网络适用于容器实例需要与宿主机的MAC地址直接通信，无需端口映射，也无需NAT，容器实例的eth0直接与宿主机的物理网卡通信。容器实例可以被赋予公共IP，并从宿主机外部直接访问。
- `Driver options`: 上面network配置的相关参数
- `IPv4 Network configuration`：定义IPv4范围、子网、网关和需要过滤的IP。如果此处未输入任何信息，Docker将自动分配IPv4范围。
- `IPv6 Network configuration`：同理定义IPv6范围、子网、网关等信息。为空则自动分配。
- `Labels`给网络添加标签
- `Isolated network`：该选项可将在此网络中创建的任何容器仅隔离到此网络，而不具有入站或出站连接。
- `Enable manual container attachment`：允许用户通过网络访问到正在运行的容器

其余配置都可以选择默认的：子网、网关都可以采用默认的，遵从portainer自动分配。
注意：
> `Enable manual container attachment `配置需要开启为true。可以在外部访问到正在运行的容器。

参考[Add a new network](https://docs.portainer.io/user/docker/networks/add)

#### 2.3 将redis集群和网络进行关联
可以在上面`docker-compliance`中进行设定该集群所属网络，也可以使用自动创建的网络，也可以手动创建网络并将集群进行绑定。
上面已经创建了网络，这里进行绑定。
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135342.png)

#### 2.4 创建哨兵
```c
version: '3'
services:
  sentinel1:
    image: redis
    container_name: redis-sentinel-1
    ports:
      - 26379:26379
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    volumes:
      - /opt/docker_data/redis/sentinel/sentinel1.conf:/usr/local/etc/redis/sentinel.conf
  sentinel2:
    image: redis
    container_name: redis-sentinel-2
    ports:
    - 26380:26379
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    volumes:
      - /opt/docker_data/redis/sentinel/sentinel2.conf:/usr/local/etc/redis/sentinel.conf
  sentinel3:
    image: redis
    container_name: redis-sentinel-3
    ports:
      - 26381:26379
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    volumes:
      - /opt/docker_data/redis/sentinel/sentinel3.conf:/usr/local/etc/redis/sentinel.conf
networks:
  default:
    external:
      name: redis-sentinel
```

- `volumes`重写了宿主机和容器之间的映射关系，这里可以将所有的Redis配置集中管理。
- 选择加入一个网络`redis-sentinel`，将哨兵加入到上述Redis集群中。

在上述`/opt/docker_data/redis/sentinel`目录中创建一个哨兵文件，并且添加以下配置：
```c
port 26379
dir /tmp
sentinel monitor mymaster 192.168.80.1 6379 2
sentinel auth-pass mymaster redis_pwd
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
sentinel deny-scripts-reconfig yes
```
注意：

- `192.168.80.1`是上面创建Redis集群时master节点对应的网关IP。可以直接填写网桥的网关IP。
- `auth-pass mymaster redis_pwd`这里也需要设置Master和Slave 访问密码
- 主节点名称为`mymaster`

在该目录下，将哨兵配置文件赋值三份
```bash
sudo cp sentinel.conf sentinel1.conf
sudo cp sentinel.conf sentinel2.conf
sudo cp sentinel.conf sentinel3.conf
```
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135347.png)

重启上面创建的三个sentinel集群。

#### 2.5 验证

- 进入Master节点。 确认其余两个slave节点是否已经连接上。

![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135350.png)

- 进入其中一个sentinel容器，确保master、2salve、2sentinel 均在线。
### 3.npm配置域名
npm(Nginx proxy manage)进行配置二级域名反向代理。
<img src="https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135357.png" alt="image.png" style="zoom:50%;" />

<img src="https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135849.png" alt="image.png" style="zoom:50%;" />
这里可以配置多个Redis的节点耳机域名。

- 使用Medis 进行连接，可以查看服务器中`redis mode`为 sentinel哨兵模式。

<img src="https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-11-135520.png" alt="Redis 服务器连接信息" style="zoom:50%;" />

现在就可以`HA(High Avaliable)模式`高可用愉快的玩耍啦。

----

了解更多内容，可以关注我的微信公众号，更多首发文章。
![wechat](../files/wechat/wechat.png)
