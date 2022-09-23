---
title: viper读取配置文件
date: 2022-09-23 16:29:21
author: 聪聪
category: Go
tags:
- Golang
- viper
---

hello，大家好，我是聪聪。

---


## 1. 介绍

[Viper](https://github.com/spf13/viper)是适用于Go应用程序的完整配置解决方案。它被设计用于在应用程序中工作，并且可以处理所有类型的配置需求和格式。它支持以下特性：

+ 设置默认值
+ 从`JSON`、`TOML`、`YAML`、`HCL`、`envfile`和`Java properties`格式的配置文件读取配置信息
+ 实时监控和重新读取配置文件（可选）
+ 从环境变量中读取
+ 从远程配置系统（etcd或Consul）读取并监控配置变化
+ 从命令行参数读取配置
+ 从buffer读取配置
+ 显式配置值

Viper能够帮助我们执行以下操作：

+ 查找、加载和反序列化`JSON`、`TOML`、`YAML`、`HCL`、`INI`、`envfile`和`Java properties`格式的配置文件。

+ 提供一种机制为你的不同配置选项设置默认值，进行灵活配置和发布配置。
+ 提供一种机制来通过命令行参数覆盖指定选项的值。
+ 提供别名系统，以便在不破坏现有代码的情况下轻松重命名参数。
+ 当用户提供了与默认值相同的命令行或配置文件时，可以很容易地分辨出它们之间的区别。

Viper能够按照下列优先级进行获取配置：

+ 显示调用`Set`设置值
+ 命令行参数（flag）
+ 环境变量
+ 配置文件
+ key/value存储
+ 默认值



## 2. 安装

> ```bash
> go get github.com/spf13/viper
> ```



## 3. Viher使用介绍

### 3.1 设置默认值

Viper支持设置默认值，当我们无法从配置文件、环境变量、远程配置、命令行获取配置时，默认配置到是很有用的。

```go
func main() {
  //设置各类key对应默认值
  //key 为string类型
  //value可接受interface{} 类型参数
	viper.SetDefault("rootPath", "rootPath default value")
	viper.SetDefault("defaultPort", 8000)
	viper.SetDefault("defaultConfig", map[string]string{
		"HttpMethod": "HttpMethod default value",
		"HttpUrl":    "HttpUrl default value",
	})
  //从viper中读取配置

	fmt.Println("rootPath value:", viper.Get("rootPath"))
	fmt.Println("defaultPort value:", viper.Get("defaultPort"))
	fmt.Println("defaultConfig:", viper.Get("defaultConfig"))
	fmt.Println("defaultConfig:", viper.GetStringMapString("defaultConfig"))
}
```

从Viper中读取配置key对应配置信息。打印信息如下：

```bash
rootPath value: rootPath default value
defaultPort value: 8000
defaultConfig: map[httpMethod:GET httpUrl:ccoder.cc]
defaultConfig: map[httpMethod:GET httpUrl:ccoder.cc]
```

### 3.2 读取配置文件

Viper读取配置文件时，需要指定告诉配置文件路径（或者读取配置方式）。同时Viper支持从`JSON`、`TOML`、`YAML`、`HCL`、`envfile`和`Java properties`格式的配置文件读取配置信息。同时支持搜索多个路径。

下面是一个从配置文件`config.json` 读取配置的案例。只用指定配置文件config预期出现的路径，无需指定特定的路径。

```go
//在当前工作目录 . 中读取一个config的配置文件 未指定文件后缀.
func printFile() {
  //配置文件名称(无后缀扩展名)，viper会自行解析文件后缀名.
  //若配置文件无后缀时则需要通过SetConfigType配置后水名
  viper.SetConfigName("config")
  //可以重复添加的搜索路径
	viper.AddConfigPath(".")

  //加载配置文件 捕获一下error:文件不存在情况。
	err := viper.ReadInConfig()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("config not exists")
		} else {
			log.Println("read config error")
		}
		log.Fatal(err)
	}

  //读取配置文件内容
	fmt.Println("读取port: ", viper.GetInt("port"))
	fmt.Println("读取mysql.url: ", viper.GetString(`mysql.url`))
	fmt.Println("读取mysql.username: ", viper.GetString(`mysql.username`))
	fmt.Println("读取mysql.password: ", viper.GetString(`mysql.password`))
	fmt.Println("读取redis: ", viper.GetStringSlice("redis"))
	fmt.Println("读取mongo: ", viper.GetStringMap("mongo"))
	fmt.Println("读取elasticsearch: ", viper.GetStringMap("elasticsearch"))
}
```

代码解析：

+ `viper.SetConfigName ("config") ` 设置配置文件名为 config, 不需要配置文件扩展名，配置文件的类型 viper 会自动根据扩展名自动匹配。若配置文件无后缀扩展名时，可通过SetConfigType配置解析文件类型。
+ `viper.AddConfigPath (".") ` 设置配置文件搜索的目录，`.` 表示和当前编译好的二进制文件在同一个目录。
  + 可以添加多个配置文件目录，如在第一个目录中找到就不不继续到其他目录中查找.
+ `viper.ReadInConfig () ` 加载配置文件内容。
+ `viper.Getxxxx` 用来读取配置内容。

### 3.3 写入配置文件

运行时可以从配置中读取系列配置为应用所用，当然运行时我们会做一系列初始化操作将配置写入到配置文件中；那么此时这种场景，下列API便是非常适用的：

+ `viper.WriteConfig()` : 将viper当前配置写入到文件中，会读取当前viper中的配置文件名称
+ `SafeWriteConfig` : 将当前的`viper`配置写入预定义的路径。如果没有预定义的路径，则报错。如果存在，将不会覆盖当前的配置文件。
  + 必须存在configPath .否则：`missing configuration for 'configPath'`
+ `WriteConfigAs` : 将当前的`viper`配置写入给定的文件路径。若文件已存在，将覆盖给定的文件。
+ `SafeWriteConfigAs` :将当前的`viper`配置写入给定的文件路径。若文件已存在，不会覆盖给定的文件。

```go
viper.WriteConfig()
viper.SafeWriteConfig()
viper.WriteConfigAs("new_config.yaml")
viper.SafeWriteConfigAs("new_config.yaml")
```

### 3.4 监控配置文件变更

Viper支持监听和重新读取配置文件。

```go
import "github.com/fsnotify/fsnotify"
```

使用方式：

```go
viper.WatchConfig()
viper.OnConfigChange(func(e fsnotify.Event) {
// 通过fsnotify.Event 事件监听配置文件更新回调
fmt.Println("Config file changed:", e.Name)
})
```

### 3.5 环境变量读取

从环境变量中读取配置主要用到以下函数：

+ `vper.AutomaticEnv()`  AutomaticEnv使Viper检查环境变量是否与任何现有键匹配。在下列函数中匹配前缀`prefix` 的变量
+ `vper.SetEnvPrefix()` SetEnvPrefix定义了一个环境变量将使用的前缀。

```go
func printConfigEnvs() {
	prefix := "prefix"
	envs := map[string]string{
		"Level":          "INFO",
		"Mode":           "DEV",
		"MYSQL_USERNAME": "root",
		"MYSQL_PASSWORD": "xxx",
	}
	for k, v := range envs {
		err := os.Setenv(fmt.Sprintf("%s_%s", prefix, k), v)
		if err != nil {
			return
		}
	}
	v := viper.New()
	v.SetEnvPrefix(prefix)
	v.AutomaticEnv()

	for k := range envs {
		fmt.Printf("%s = %s \n", k, v.GetString(k))
	}
}
```

### 3.6 从远程读取配置

在Viper中启用远程支持，需要在代码中匿名导入`viper/remote`这个包。

```go
import _ "github.com/spf13/viper/remote"
```

Viper将读取从Key/Value存储（例如etcd或Consul）中的路径检索到的配置字符串（如`JSON`、`TOML`、`YAML`、`HCL`、`envfile`和`Java properties`格式）。

这些值的优先级高于默认值，但是会被从磁盘、flag或环境变量检索到的配置值覆盖。

也就是说Viper加载配置值的优先级为：磁盘上的配置文件>命令行标志位>环境变量>远程Key/Value存储>默认值。

+ 先本地启动consul 添加一个配置文件

    ```bash
    consul agent -dev
    ```

+ 在consul中添加一个名为config的yaml配置文件。

![image-20220923150821084](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-09-23-070821.png)

+ 读取配置文件

```go
func printConfigRemote() {
	v := viper.New()
	err := v.AddRemoteProvider("consul", "localhost:8500", "config")
	if err != nil {
		return
	}
	v.SetConfigType("YAML")
	if err = v.ReadRemoteConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("config not exists")
		} else {
			log.Println("read config error")
		}
		log.Fatal(err)
	}

	fmt.Println("port: ", v.GetInt("port"))
	fmt.Println("mysql.url: ", v.GetString(`mysql.url`))
	fmt.Println("mysql.username: ", v.GetString(`mysql.username`))
	fmt.Println("mysql.password: ", v.GetString(`mysql.password`))
}
```

+ 打印读取配置信息

```bash
port:  3306
mysql.url:  url
mysql.username:  username
mysql.password:  password

```

### 3.7 从io.Reader读取配置

Viper预先定义了许多配置源，如文件、环境变量、标志和远程K/V存储，但你不受其约束。你还可以实现自己所需的配置源并将其提供给viper。

下面定义了一段JSON配置，将其从Reader中读取进行viper设置。

```go
func printConfigIoReader() {
	v := viper.New()
	v.SetConfigType("json")

	var jsonConfig = []byte(`{
		"port" : 3306,
		"username" : "root",
		"password" : "123456"
	}`)
	//创建 io.Reader
	//ReadConfig读取配置文件 若配置文件中key不存在则设置nil值
	err := v.ReadConfig(bytes.NewReader(jsonConfig))
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("port: ", v.GetInt("port"))  //3306
	fmt.Println("username: ", v.GetString("username"))  //root
	fmt.Println("password: ", v.GetString("password"))  //123456

}
```

### 3.8 读取配置到结构体

除了上面的用法外，我们还可以在项目中定义与配置文件对应的结构体，`viper`加载完配置信息后使用结构体变量保存配置信息。

+ 定义一个结构体和全局变量

```go
type Config struct {
	Port    string
	Version string
}

var Conf = new(Config)

```

+ 加载配置到全局变量中

```go
func printConfigStruct() {
	v := viper.New()
	v.SetConfigFile("./config/config.yaml")
	if err := v.ReadInConfig(); err != nil {
		fmt.Printf("fail to load the config,%s\n", err)
		return
	}
	if err := v.Unmarshal(Conf); err != nil {
		fmt.Printf("Serialization configuration failed.%s\n", err)
		return
	}

	fmt.Println("port:", Conf.Port)  // 3306
	fmt.Println("version:", Conf.Version) //1.1.1
}
```

## 4. 使用示例

### 4.1 是用gin获取配置rest接口

```go
package main

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"log"
	"net/http"
)

type Config struct {
	Port    int
	Version string
	Context map[string]interface{}
}

var Conf = new(Config)

func main() {
	v := viper.New()
	v.SetConfigFile("./gin/config.yaml")
	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			fmt.Println("config not exists")
		} else {
			fmt.Println("config read failed")
		}
		log.Fatal(err)
	}

	if err := v.Unmarshal(Conf); err != nil {
		fmt.Printf("Serialization configuration failed.%s\n", err)
		return
	}

	//监听文件变化
	v.WatchConfig()
	v.OnConfigChange(func(in fsnotify.Event) {
		fmt.Println("The config file has been modified.")
		if err := v.Unmarshal(Conf); err != nil {
			panic(fmt.Errorf("Failed to reload the configuration file.%s\n", err))
		}
	})

	//添加gin
	g := gin.Default()
	g.GET("/config", func(c *gin.Context) {
		c.JSON(http.StatusOK, Conf)
	})

	if err := g.Run(
		fmt.Sprintf(":%d", Conf.Port)); err != nil {
		panic(err)
	}
}
```

+ 接口响应信息

```bash
 //请求接口
 curl http://localhost:8080/config

 //响应信息
 {
    "Port": 8080,
    "Version": "1.18.3",
    "Context": {
        "language": "zh-CN",
        "url": "ccoder.cc"
    }
}
```

## 5. 参考连接

+ [https://github.com/spf13/viper/blob/master/README.md](https://github.com/spf13/viper/blob/master/README.md)


全文完。

---

了解更多内容，可以关注我的微信公众号，更多首发文章。
![wechat](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064228.bmp)

