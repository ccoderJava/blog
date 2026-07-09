---
title: Go语言基础-数组
date: 2022-09-21 14:10:02
author: 聪聪
category: Go
tags:
- Golang
---

hello，大家好，我是聪聪。

---

## 1.数组定义

数组是同一类型元素的集合。在go中数组从声明时便已确认，使用时可以修改其成员，但是数组大小不可变化。
> [n]T 用来定义数据
> + n 数组元素个数
> + T 数组元素的数据类型
>
> var a [10]int
> 定义一个长度为10，元素类型为int的数组 a

## 2.数组初始化

### 2.1 使用初始化列表来完成数组初始化

> var 数组变量名 [元素数量,数据长度] 数据类型
> var a [3]int

+ 类型默认值初始化

```go
var a [4]int //[0 0 0 0]
```

+ 指定值初始化

```go
var b = [4]int{1, 2, 3} //[1 2 3 0]
```

+ 指定初始值初始化

```go
var c = [4]int{1, 2, 3, 4} //[1 2 3 4]
```

### 2.2 根据数据元素自行推导数组长度

上述定义数组方式需要每次指定数组长度与初始值长度一致，但是实际中我们可能并不知道数组具体长度。
我们希望能够通过设置初始值自动推导出数组长度。

+ 可以使用 ... 代替数组的长度，编译器会根据元素个数自行推断数组的长度

```go
var d = [...]int{1, 2, 3, 4, 5, 6}
fmt.Println(len(d)) //6
```

### 2.3 指定数组索引值来初始化数组

定义一个数组,我们希望索引位1、索引位3处需要设置初始化值。
编译器会自动推算出最长索引位为3.数组长度为4。

```go
var e = [...]int{1: 4, 3: 5}
fmt.Println(e) //[0 4 0 5]
fmt.Printf("type of e :%T \n", e) // type of e :[4]int
```

## 3.数组的遍历

+ for循环遍历

```go
func main() {
var a = [...]int{1, 2, 3, 4, 5, 6}
fmt.Printf("type of a :%T \n", a)
for i := 0; i < len(a); i++ {
fmt.Println(a[i])
}
}
//输出结果
type of a:[6]int
1
2
3
4
5
6

```

+ for range 遍历
  上述方法是常用的for i 循环方式。i为数组下标。
  Go提供了一个更好更简洁的方式迭代数组，那就是使用range。range会把下标和元素都返回。

```go
func main() {
var a = [...]int{1, 2, 3, 4, 5, 6}
for i, v := range a {
fmt.Printf("i=%d v=%d \n", i, v)
}
}
//输出结果
i = 0 v = 1
i =1 v = 2
i = 2 v =3
i = 3 v = 4
i= 4 v = 5
i = 5 v = 6

```

## 4.多维数组(嵌套数组)

### 4.1 二维数组定义

go支持多维数组,下面就介绍最简单的二维数组。

```go
var variable_name [SIZE1][SIZE2]...[SIZEN] variable_type
var a [2][3]int //二维数组
var b [1][2][3]int //三维数组
```

```go
func main() {
  var a = [2][3]string{
    {"上海市", "浦东新区", "峨山路"},
    {"北京市", "海淀区", "中关村"},
  }

  fmt.Println(a)
  fmt.Println(a[1][2])
}
//打印如下
[[上海市 浦东新区 峨山路] [北京市 海淀区 中关村]]
中关村

```

### 4.2 二维数组访问

同样可以使用fori 和 range来遍历。

```go
func main() {
var a = [2][3]string{
  {"上海市", "浦东新区", "峨山路"},
  {"北京市", "海淀区", "中关村"},
}

for _, v1 := range a {
    for _, v2 := range v1 {
        fmt.Printf("%s\t", v2)
    }
    fmt.Println()
    }
}
//打印如下
上海市  浦东新区   峨山路
北京市  海淀区  中关村

```

+ **注意**:多维数组只有第一层支持`...`让编译器推导数组长度。

```go
//正确写法
var a = [...][3]string{
{"上海市", "浦东新区", "峨山路"},
{"北京市", "海淀区", "中关村"},
}
//错误写法
var a = [2][...]string{
{"上海市", "浦东新区", "峨山路"},
{"北京市", "海淀区", "中关村"},
}
//错误写法出现以下异常信息:
invalid use of [...] array (outside a composite literal)
```

## 5.函数传递数组

数组是值类型，赋值和传参会复制整个数组。因此改变副本的值，不会改变本身的值。
如果你想向函数传递数组参数，你需要在函数定义时，声明形参为数组，我们可以通过以下两种方式来声明：

```go
func getSum(array []int) int {
    var sum int
    for _, v := range array {
        sum = sum + v
    }
    return sum
}

func main() {
    a := []int{1, 2, 3, 4, 5}
    sum := getSum(a)
    fmt.Println(sum)
}
```

+ **注意**
  + 数组支持 “==“、”!=” 操作符，因为内存总是被初始化过的。
  + [n]*T表示指针数组，*[n]T表示数组指针 。

## 6.练习题

+ 找出数组中和为指定值的两个元素的下标，比如从数组[1, 3, 5, 7, 8]中找出和为8的两个元素的下标分别为(0,3)和(1,2)。
```go
package main

import "fmt"

func getSumIndex(array []int, sum int) {

	for i := 0; i < len(array); i++ {
		for j := i + 1; j < len(array); j++ {
			if array[i]+array[j] == sum {
				fmt.Printf("(%d,%d)\n", array[i], array[j])
			}
		}
	}

}

func main() {
	a := []int{1, 3, 5, 7, 8}
	getSumIndex(a, 8)
}

```


全文完。

---

了解更多内容，可以关注我的微信公众号，更多首发文章。
![wechat](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064228.bmp)

