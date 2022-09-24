---
title: 代理模式-Proxy
date: 2022-08-20 18:45:14
author: 聪聪
category: 设计模式
tags:
- 代理模式
- Proxy
- cglib
---


hello，大家好，我是聪聪。

---


## 1.介绍

最近在做加解密中间件，使用mybatis中拦截器做数据加解密处理时，看到很多动态代理的逻辑。因此再次系统的回顾一下设计模式中代理模式是怎样的，我们又该在哪些场景使用。
> **代理模式** 是一种结构型设计模式。主要解决了避免直接访问真实对象带来的问题，提供一个代理用来控制着对原始对象的访问，并且能够在请求的前、后做一些增强处理。
> 同时，代理类负责对委托类进行预处理消息-`beforeAdvice` 、过滤消息，以及对消息被委托类处理执行完毕后的后续处理-`afterAdvice` 。

![](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-08-25-122329.jpg)
从上图可以先总结一波：

- **Client**

客户端可以通过统一接口和委托类、代理类之间进行通信交互。那么我们就可以在客户端业务中使用到委托类对象的进行替换成代理对象，因为它们都实现了相同的统一接口Subject。

- **Subject**

声明了统一接口。代理类和委托类均会实现该统一接口。并且代理类必须实现该接口才能伪装成委托类。

- **RealSubject**

统一接口的真实委托类实现，该类中提供一些具体的业务执行逻辑。

- **Proxy**

代理类，其中包含了一个真实委托类的成员变量，并且代理其完成一系列的操作：延迟初始化、访问权限控制、日志记录、缓存控制等。通常情况下代理类会对委托类进行增强处理，并且对其生命周期进行管理。
从上图可以看出，为了保证代理类、委托类行为上的一致性，通常均会实现统一接口，因此在客户端访问请求来看并无差异。
通过代理类这一层，能够有效的控制客户端对委托类的直接访问，可以有效的进行解耦处理，同时也为我们对委托类实时增强处理提供了更多的可操控性，从而在设计上变得更加灵活。引入第三方代理类，只是将客户端、委托类之间的关系进行了解耦，但是代理类真正处理业务逻辑的还是委托类完成的，这便是上图中的Proxy类中需要定义一个RealSubject的成员变量的原因。
## 2.使用场景
### 2.1 方法增强
能够对真实接口进行增强处理。访问权限控制等。
```java
@Slf4j
public class UserServiceProxy implements UserService {

    /**
     * 被代理对象：委托类
     */
    private UserServiceImpl userService;

    public UserServiceProxy(UserServiceImpl userService) {
        this.userService = userService;
    }

    @Override
    public void createUser() {
        //执行委托类方法前:可以进行权限控制、日志记录、缓存处理
        userService.createUser();
        //执行委托类方法后:日志打印、方法用时统计、日志处理、缓存处理等
    }
}
```
如上所示，我们可以在代理类请求真实委托类方法前后进行各类方法方法增强处理：

- 权限控制：具有权限才能够访问真实委托类方法
- 日志记录：记录请求委托类方法前、后日志。
- 缓存控制：请求委托类设置缓存、执行完毕清空缓存等操作；执行前后进行缓存加锁与释放等操作。
- 耗时统计：记录请求委托类真实耗时，用以优化真实业务接口性能。
- 方法增强：请求委托类时，进行记录统计当前客户端一些环境信息，可以自动统计设置，避免了手动收集环境信息的繁琐。
### 2.2 AOP切面
定义切面接口，用来增强委托类方法。具体可以分为：

- 委托类方法执行前：`beforeAdvice`
- 委托类方法执行后：`afterAdvice`
- 委托类方法执行异常时: `afterException`
```java
public interface Aspect {

	/**
	 * 目标方法执行前的操作
	 *
	 * @param target 目标对象
	 * @param method 目标方法
	 * @param args   参数
	 * @return 是否继续执行接下来的操作
	 */
	boolean beforeAdvice(Object target, Method method, Object[] args);

	/**
	 * 目标方法执行后的操作
	 * 如果 target.method 抛出异常且
	 *
	 * @param target    目标对象
	 * @param method    目标方法
	 * @param args      参数
	 * @param returnVal 目标方法执行返回值
	 * @return 是否允许返回值（接下来的操作）
	 */
	boolean afterAdvice(Object target, Method method, Object[] args, Object returnVal);

	/**
	 * 目标方法抛出异常时的操作
	 * <li>返回true,则不会执行afterAdvice操作</li>
	 * <li>返回false,则无论target.method是否抛出异常，均会执行afterAdvice操作</li>
	 *
	 * @param target 目标对象
	 * @param method 目标方法
	 * @param args   参数
	 * @param e      异常
	 * @return 是否允许抛出异常
	 */
	boolean afterException(Object target, Method method, Object[] args, Throwable e);
}
```
## 3.静态代理
按照**代理创建时期**可以将其分为动态代理、静态代理两种：

- 静态代理：有开发人员自行编码，或者用特定工具生成源码在对其进行编译。在程序运行之前代理类`.class`文件就已经存在了。编译时期生成。
- 动态代理：代理类在程序运行时通过反射机制进行字节码变更创建生成。运行时动态生成。
### 3.1 原理
将上面的`UserService`的例子进行结构化，关系如下：
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-08-25-122340.png)

- `UserService`充当`Subject`的角色，是一个统一标准接口。
- `UserServiceImpl`充当`RealSubject`角色。是代理类的委托类，里面是真实业务逻辑。
- `UserServiceProxy`充当`Proxy`角色。为委托类提供代理服务。
- `TestClient`充当`Client`角色。通过代理类调用真实委托类的业务处理。
```java
//UserServiceImpl具体实现
public class UserServiceImpl implements UserService {
    @Override
    public void createUser() {
        System.out.println("创建用户信息");
    }
}

//Client调用
public static void main(String[] args) {
    // 模拟一个UserService 对象
    //        UserServiceImpl userService = new UserServiceImpl();
    // 创建代理对象
    UserService userServiceProxy = new UserServiceProxy(new UserServiceImpl());
    userServiceProxy.createUser();
}

//控制台输出
创建用户信息
```
### 3.2 优缺点

- **优点**

客户端无需了解委托类具体实现，直接和委托类进行解耦合。
虽然上述我们`new UserServiceImpl()`出现了委托类的，但是实际业务中我们可以在此处使用工厂方法屏蔽掉具体委托类。后面我们说到策略模式、工厂模式时再看看是如何使用抽象工厂方法、代理模式进行设计高可用、高扩展性的业务骨架逻辑。

- **缺点**
  - 代理类和委托类实现相同的统一接口。那么这样就会导致接口的修改时，会牵一发动全身，出现了大量的重复代码(统一接口的实现)，同时也增加了代码维护的复杂度。
  - 代理对象实现了统一接口，那么就只能够为这一种接口类型进行服务。如果需要服务于多个接口，那么势必需要每个接口进行实现代码逻辑。在实际业务开发中这种方式显然是不适用的，无法大规模使用。

例如：上面说到的可以进行权限控制、日志记录等增强功能，只需增加代理对进行统一管理即可。那如果是每个业务方法接口都需要进行日志记录处理、权限控制等功能，就需要为每个业务方法接口增加代理类，以及代理类中每个方法实现均需要进行权限控制、日志记录。只能够满足为特定服务接口提供代理服务，如果需要服务多个接口就需要提供多个代理类。
针对这个痛点，我们就需要通过一个代理类便可以完全全部代理功能，这边是下面说到的动态代理。一个代理类服务于多个委托类。
## 4.动态代理
从上面静态代理的结构图、委托类和代理类之间的关系，不难的看出：静态代理中每个代理类只能够为一个委托类接口进行服务，这样的设计势必会产生很多代理类，无法为我们程序高扩展、低耦合的进行使用。
此时，我们的需求便是：如何通过一个代理类完成所有的代理功能。这边是动态代理，一个代理类服务于多个委托对象。
**静态代理**：一个代理类只能够代理一个委托类，并且在编译时期就已经确定了被代理的对象。
**动态代理**：一个地阿里类可以代理多个委托类， 通过反射机制实现，可以代理多个、多种类型委托类。
### 4.1 JDK动态代理
在Java中自带的实现动态代理实现方式为`InvocationHander`和`Proxy`。

- **Subject**

继续如上例子，统一接口`UserService`不变。

- **RealSubject**

委托类实现不变。

- **Proxy**

创建一个动态代理的类，实现`InvocationHandler`接口,相当于上述`Proxy`角色。
```java
//动态代理类
public class UserServiceHandler implements InvocationHandler {

    /**
     * 代理的目标对象
     */
    private Object targetObject;

    /**
     * 代理类和代理对象进行绑定关系。
     * <li>关联借口，与委托类进行关联绑定</li>
     * <li>接口被调用时执行invoke方法,最终执行到委托类</li>
     *
     * @param targetObject
     *            代理对象
     * @return
     */
    public Object newProxyInstance(Object targetObject) {
        this.targetObject = targetObject;
        // 这里需要指定三个参数：用于生成动态代理类实例
        /*
        * 1、指定生成代理对象的类加载器，需要指定为代理的目标对象统一类加载器
        * 2、实现和目标对象一样的接口，所以这里需要传入目标对象的接口信息
        * 3、指定执行的invoke方法。被拦截的代理方法执行时，指定需要执行的InvocationHandler#invoke方法。
        * */
        // 返回值；根据传入的目标对象返回一个代理对象。
        return Proxy.newProxyInstance(targetObject.getClass().getClassLoader(), targetObject.getClass().getInterfaces(),
            this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        /*
         * 代理对象被执行时需要执行的方法，这里面包含了真实委托类目标对象的方法。
         */
        // 执行前
        System.out.println("invoke 方法执行前");
       Object result = null;
        try {
            result = method.invoke(targetObject, args);
        } catch (Exception e){
            //执行异常时
        }
        // 执行后
        System.out.println("invoke 方法执行后");
        return result;
    }
}

//client执行调用
public static void main(String[] args) {
    UserServiceHandler userServiceHandler = new UserServiceHandler();
    UserService userService = (UserService)userServiceHandler.newProxyInstance(new UserServiceImpl());
    userService.createUser();
}

//控制台执行结果
invoke 方法执行前
创建用户信息
invoke 方法执行后
```

- 实现`InvocationHandler`接口，
- 定义一个目标代理对象`targetObject`,通过实例化`UserServiceHandler`时传入进来。
- 获得一个目标对象的代理对象需要做以下几步：
  - 指定生成代理对象的类加载器，需要指定为代理的目标对象统一类加载器
  - 实现和目标对象一样的接口，所以这里需要传入目标对象的接口信息
  - 指定执行的invoke方法。被拦截的代理方法执行时，指定需要执行的InvocationHandler#invoke方法。
- `invoke`方法中：真实请求目标对象的方法。在此处就可以进行增强处理：
  - 执行前。
  - 执行后。
  - 执行异常时。

从上面可以看出，我们可以通过`UserServiceHandler`进行代理处理不同的对象，如果我们将对外的接口都通过动态代理来实现，那么所有的委托类方法执行时均会通过`invoke`方法的转发，那么在此，我们就可以实现自己的增强需求：日志记录、权限控制、事务处理、拦截器、耗时统计等功能，这便是AOP(面向切面编程)的原理，通识也达到了**解耦**的需求。

- **动态代理优点**

与静态代理相比较，最大好处便是接口中所有方法的使用均被移动到代理类中统一处理。`InvocationHandler.invoke()`方法中进行转发。
此时我们就无需像静态代理那样对每个接口进行实现代理转发，从而使我们的程序职责更加单一、复用性更强、高扩展。
### 4.2 动态代理类解释

- **生成方式**
```java
public static void main(String[] args) {
    byte[] bytes = ProxyGenerator.generateProxyClass("$Proxy0", UserServiceImpl.class.getInterfaces());
    //将生成代理类 写入到$Proxy0.class 文件中
    FileUtil.writeBytes(bytes,"/Users/chencong/joyy/github/StudyArticle/$Proxy0.class");

    UserServiceHandler userServiceHandler = new UserServiceHandler();
    UserService userService = (UserService)userServiceHandler.newProxyInstance(new UserServiceImpl());
    userService.createUser();
}
```

- **动态代理特点**
```java
public final class $Proxy0 extends Proxy implements UserService {
    private static Method m1;
    private static Method m2;
    private static Method m3;
    private static Method m0;

    public $Proxy0(InvocationHandler var1) throws  {
        super(var1);
    }

    public final boolean equals(Object var1) throws  {
        try {
            return (Boolean)super.h.invoke(this, m1, new Object[]{var1});
        } catch (RuntimeException | Error var3) {
            throw var3;
        } catch (Throwable var4) {
            throw new UndeclaredThrowableException(var4);
        }
    }

    public final String toString() throws  {
        try {
            return (String)super.h.invoke(this, m2, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    public final void createUser() throws  {
        try {
            super.h.invoke(this, m3, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    public final int hashCode() throws  {
        try {
            return (Integer)super.h.invoke(this, m0, (Object[])null);
        } catch (RuntimeException | Error var2) {
            throw var2;
        } catch (Throwable var3) {
            throw new UndeclaredThrowableException(var3);
        }
    }

    static {
        try {
            m1 = Class.forName("java.lang.Object").getMethod("equals", Class.forName("java.lang.Object"));
            m2 = Class.forName("java.lang.Object").getMethod("toString");
            m3 = Class.forName("cc.ccoder.proxy.jdk.UserService").getMethod("createUser");
            m0 = Class.forName("java.lang.Object").getMethod("hashCode");
        } catch (NoSuchMethodException var2) {
            throw new NoSuchMethodError(var2.getMessage());
        } catch (ClassNotFoundException var3) {
            throw new NoClassDefFoundError(var3.getMessage());
        }
    }
}
```
从上面生成的动态代理类，可以得到一下结论：

- 动态代理类继承`Proxy`,实现代理接口。由于这里继承了`Proxy`无法再继承其余类，因此**JDK动态代理不支持对类的代理，**只能支持接口代理。
- 使用`InvocationHandler`作为参数的构造函数。
- 通过静态代码块来生成代理接口中的`createUser`method方法，以及Object类中的`equals`、`toString`、`hashCode`方法。
- 重写了Object类中的`equals`、`toString`、`hashCode`方法。这里只是直接调用`InvocationHandler#invoke`进行执行调用。从这里我们还可以得出：动态代理还可以对对象的`equals`、`toString`、`hashCode`方法做代理增强处理。
- 代理类实现了代理接口中的`createUser`方法，只是简单的进行了`invoke`调用处理。但是我们可以在`UserServiceHandler#invoke`方法中对其进行增强处理，或者直接调用访问。
### 4.2 Cglib动态代理
除去上面JDK动态dialing，还可以使用`cglib`这个包，实现动态代理。
cglib的动态代理还可以解决上述痛点：只支持接口的动态代理。

- cglib动态代理：支持对类进行动态代理。
- jdk动态代理：支持对接口进行动态代理。
> CGLIB(Code Generation Library)是一个功能强大，高性能的代码生成包。它为没有实现接口的类提供代理，为JDK的动态代理提供了很好的补充。通常可以使用Java的动态代理创建代理，但当要代理的类没有实现接口或者为了更好的性能，CGLIB是一个好的选择。
> CGLIB作为一个开源项目，其代码托管在github，地址为：[https://github.com/cglib/cglib](https://github.com/cglib/cglib)

#### 4.2.1 代码逻辑

- **定一个委托类**
```java
public class RemoteClient {

    public String send() {
        System.out.println("远程请求调用");
        return "success";
    }
}
```

- **实现拦截方法MethodInteceptor**
```java
public class RemoteMethodInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        // 执行前：可以对委托类目标方法进行预处理,包括日志、权限等控制。
        System.out.println("执行方法之前:" + method.getName());
        Object result = proxy.invokeSuper(obj, args);
        // 执行后: 结果校验等处理
        System.out.println("执行方法后: 执行结果" + result);
        return result;
    }
}
```

- **客户端测试及打印**
```java
public static void main(String[] args) {
    // 打印生成动态代理类
    // 如果开启打印 则执行拦截过程不会处理toString hashCode方法。
    System.setProperty(DebuggingClassWriter.DEBUG_LOCATION_PROPERTY,
                       "/Users/chencong/joyy/github/StudyArticle/cglib/");

    Enhancer enhancer = new Enhancer();
    enhancer.setSuperclass(RemoteClient.class);
    enhancer.setCallback(new RemoteMethodInterceptor());

    RemoteClient remoteClient = (RemoteClient)enhancer.create();
    String result = remoteClient.send();
    System.out.println("remoteClient.send()方法结果:" + result);
}
//执行结果如下:

执行方法之前:toString
执行方法之前:hashCode
执行方法后: 执行结果1543237999
执行方法后: 执行结果cc.ccoder.proxy.cglib.RemoteClient$$EnhancerByCGLIB$$122ae0f8@5bfbf16f
执行方法之前:send
远程请求调用
执行方法后: 执行结果success
remoteClient.send()方法结果:success
```
这里的执行结果就不多说了，对目标方法进行拦截增强处理。
注意：执行之前会先执行目标类的toString、hashCode方法。
#### 4.2.3 结果说明
![image.png](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-08-25-122355.png)
这里总共生成了三个字节码文件：

- 代理类的FastClass文件：`RemoteClient$$EnhancerByCGLIB$$122ae0f8$$FastClassByCGLIB$$e549917`
- 一个是代理类：`RemoteClient$$EnhancerByCGLIB$$122ae0f8`
- 一个是目标类的FastClass文件：`RemoteClient$$FastClassByCGLIB$$fc9e91bc`

我们主要关注的是代理类的文件中的逻辑。
先说说`FastClass机制`：Jdk动态代理的拦截对象是通过反射的机制来调用被拦截方法的，反射的效率比较低，所以cglib采用了FastClass的机制来实现对被拦截方法的调用。FastClass机制就是对一个类的方法建立索引，通过索引来直接调用相应的方法，效率得到提高。
上面看到了动态代理的使用方式，同时生成动态代理的class文件，class文件中的调用顺序后面我么再单独开一篇文章说一下，内容较多，这里就总结如下：

1. 实例化出了Enhance对象，设置所需参数通过`enhancer.create()`创建得到委托类实例。
1. 调用目标类的方法`send()`，进入到定义的方法拦截器`RemoteMethodInteceptor.intercept()`中，然后使用`proxy.invokeSuper(obj, args)`进行真实调用目标方法。
1. invokeSuper中，通过FastClass机制真实调用目标类的方法
1. 方法拦截器中只有一个`intercept`方法，这个方法有四个参数：
  1. obj表示代理对象
  1. method表示目标类中的方法
  1. args表示方法参数
  1. proxy表示代理方法的MethodProxy对象
## 5.自定义一个AOP切面
### 5.1 定义一个aspect接口
```java
public interface Aspect extends Serializable {

    /**
     * 目标方法执行前操作
     *
     * @param target 目标对象
     * @param method 目标方法
     * @param args   参数
     * @return 是否执行接下来操作。true:继续执行,false:暂停执行
     */
    boolean beforeAdvice(Object target, Method method, Object[] args);

    /**
     * 目标方法执行后的操作
     * <li>afterException返回true,不会执行该操作</li>
     * <li>afterException返回false,无论抛出何种异常,均会执行该操作</li>
     *
     * @param target      目标对象
     * @param method      目标方法
     * @param args        参数
     * @param returnValue 目标方法执行后返回值
     * @return 是否允许返回值。
     */
    boolean afterAdvice(Object target, Method method, Object[] args, Object returnValue);

    /**
     * 目标方法抛出异常时执行操作
     *
     * @param target 目标对象
     * @param method 目标方法
     * @param args   参数
     * @param e      异常
     * @return 是否允许抛出异常
     */
    boolean afterException(Object target, Method method, Object[] args, Throwable e);
}
```
这里定义了一个共用的切面接口。同时在下面定义一个公共的切面类，方便后续做代理使用。
```java
public class CommonAspect implements Aspect {

    private static final long serialVersionUID = 1L;

    @Override
    public boolean beforeAdvice(Object target, Method method, Object[] args) {
        //do Something
        return true;
    }

    @Override
    public boolean afterAdvice(Object target, Method method, Object[] args, Object returnValue) {
        //do Something
        return true;
    }

    public boolean afterAdvice(Object target, Method method, Object[] args) {
        return afterAdvice(target, method, args, null);
    }

    @Override
    public boolean afterException(Object target, Method method, Object[] args, Throwable e) {
        return true;
    }
}

```
### 5.2 JDK动态代理切面
```java
public class JdkInterceptor implements InvocationHandler, Serializable {

    /**
     * 目标代理类
     */
    private final Object target;

    /**
     * 切面
     */
    private final Aspect aspect;

    public JdkInterceptor(Object target, Aspect aspect) {
        this.target = target;
        this.aspect = aspect;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        final Object target = this.target;
        final Aspect aspect = this.aspect;
        Object result = null;

        //代理回调之前
        if (!aspect.beforeAdvice(target, method, args)) {
            return null;
        }
        try {
            //执行真实业务逻辑
            result = method.invoke(target, args);
        } catch (InvocationTargetException e) {
            //判断是否抛出业务异常
            if (aspect.afterException(target, method, args, e.getTargetException())) {
                throw e;
            }
        }
        //代理执行完毕后回调
        if (aspect.afterAdvice(target, method, args, result)) {
            return result;
        }
        return null;
    }
}
```
## 6.总结
代理模式最大的特点就是：有效控制委托类对象的直接访问，可以很好的隐藏和保护委托类对象，同时也可以对委托类进行各种策略的增强处理，从而增加灵活性和解耦。
但是，从直接调用委托类对象变为代理类对象间接处理，增加了系统的复杂度。
代理模式分为：静态代理、动态代理。

- 动态代理实现方式有：JDK动态代理、cglib动态代理、aspectJ动态代理等。
- JDK动态代理只能够代理增强接口。（由于JDK只能单继承，JDK动态代理生成代理类已经继承了Proxy类，无法进行继承处理）

代理模式和适配器模式、装饰器模式有类似之处。

- 适配器模式更加注重于不同类、对象之间的适配处理。
- 装饰器模式更加注重与对象的增强扩展，在原始对象上不断增强处理。
- 代理模式更加注重于委托类对象的访问控制，从而解耦于客户端。

全文完。

---

了解更多内容，可以关注我的微信公众号，更多首发文章。
![wechat](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064228.bmp)

