---
title: Dubbo-ExtensionLoader
date: 2021-12-02 14:58:56
author: 聪聪
category: Dubbo
tags:
  - Dubbo
  - SPI
---

[[toc]]

## 扩展点加载机制

> Dubbo的扩展点加载来自于JDK的标准SPI(Service Provider Interface)扩展点发现机制，并对其进行加强。

来自Dubbo官网的描述，Dubbo改进了JDK标准SPI，并且解决了一下问题:

+ JDK标准的SPI会一次性实例化扩展点所有实现，如果扩展实现初始化很耗时，但如果没有用上也加载就会很浪费资源。
+ 如果扩展点加载失败，连扩展点的名称都拿不到了。
+ 增加了对扩展点的IoC和AOP的支持，一个扩展点可以直接setter注入其他扩展点。

Dubbo约定在扩展类的jar包内，放置扩展点配置文件`META-INF/dubbo/接口全限定名`，内容为：`配置名=扩展实现类全限定名`，存在多个实现类时用换行符分割。



## 简单介绍Java SPI机制

> SPI ，全称为Service Provider Interface, 是一种服务发现机制。它通过在`ClassPath`路径下的`META-INF/service`查找并自动加载实现类。
>
> 简单来说就是一种动态替换发现机制，接口运行时才发现具体的实现类，只需要在运行前添加一个实现即可，并且将实现**描述**给JDK即可，这里的描述便是上面提到的`META-INF/service`下的配置。也可以随时对该描述进行修改，完成具体实现的替换。

Java提供了很多SPI，允许第三方为这些接口提供实现；常见的SPI有JDBC、JNDI等。

这些SPI接口是由Java来提供的，而SPI的实现则是作为依赖的第三方jar加载进`CLASSPATH`zhong .

例如：Java提供的`java.sql.Driver`和MySql实现的`com.mysql.cj.jdbc.Driver`，并且在`META-INF/service`下存在该配置:`com.mysql.cj.jdbc.Driver`



### 写个Demo实现看看

下面简单写个Demo实现看看：

1. 我们先提供一个接口

    ```java
    package cc.ccoder.loader;
    
    public interface DownloadStrategy {
    
        void download();
    }
    ```

2. 分别提供两个实现类，这两个实现类可以理解成第三方jar中对标准接口的实现。

    ```java
    package cc.ccoder.loader;
    
    public class HttpDownloadStrategy implements DownloadStrategy{
        @Override
        public void download() {
            System.out.println("采用Http下载方式");
        }
    }
    ```

    ```java
    package cc.ccoder.loader;
    
    public class SftpDownloadStrategy implements DownloadStrategy {
        @Override
        public void download() {
            System.out.println("采用SFTP方式下载");
        }
    }
    ```

3. 在`META-INF/services`目录下创建一个扩展点配置文件，路径为`META-INF/services/接口全限定名称`。那么我们这个例子的文件名称是`cc.ccoder.loader.DownloadStrategy` 并且文件名内容为具体实现类全限定名称。

    ```java
    cc.ccoder.loader.HttpDownloadStrategy
    cc.ccoder.loader.SftpDownloadStrategy
    ```

4. 写一个测试类通过`ServiceLoader`加载具体的实现

    ```java
    package cc.ccoder.loader;
    
    import java.util.ServiceLoader;
    
    public class JavaSpiLoaderTest {
        public static void main(String[] args) {
            ServiceLoader<DownloadStrategy> serviceLoader = ServiceLoader.load(DownloadStrategy.class);
            //这里会一次实例化所有接口实现
            for (DownloadStrategy downloadStrategy : serviceLoader) {
                downloadStrategy.download();
            }
        }
    }
    ```

5. 看看输出结果

    和我们预期一样，会一次实例化所所有接口实现。

    ```java
    Connected to the target VM, address: '127.0.0.1:64219', transport: 'socket'
    采用Http下载方式
    采用SFTP方式下载
    Disconnected from the target VM, address: '127.0.0.1:64219', transport: 'socket'
    
    Process finished with exit code 0
    ```

    

## 普通扩展点加载

上面提到了Java的SPI机制，那么Dubbo的`ExtensionLoader`则是对SPI的加强。这里我们改造一下上面那个例子并且写一个测试看看。

```java
package cc.ccoder.loader;

import org.apache.dubbo.common.extension.SPI;

@SPI("http")
public interface DownloadStrategy {

    void download();
}
```

在`DownloadStrategy`接口上添加`@SPI`注解。

修改`META-INF/services`的配置文件

```java
http=cc.ccoder.loader.HttpDownloadStrategy
sftp=cc.ccoder.loader.SftpDownloadStrategy
```

运行一下测试方法

```java
package cc.ccoder.loader;

import org.apache.dubbo.common.extension.ExtensionLoader;

public class DubboSpiLoaderTest {

    public static void main(String[] args) {
        ExtensionLoader<DownloadStrategy> extensionLoader = ExtensionLoader.getExtensionLoader(DownloadStrategy.class);
        //这里getExtension方法进行加载具体扩展点
        DownloadStrategy downloadStrategy = extensionLoader.getExtension("http");
        downloadStrategy.download();
    }
}
```

```java
采用Http下载方式
Process finished with exit code 0
```

从获取扩展点的方式我们可以发现，dubbo扩展点是获取具体的实例，并不需要实例化所有的实现类。

### getExtensionLoader

从示例中我们了解到从`ExtensionLoader.getExtensionLoader`方法中可以看到类似于工厂方法，获取扩展点的Extension，再通过调用`getExtension`方法传入指定的名字即可获取到指定的扩展点实现类。

```java
    public static <T> ExtensionLoader<T> getExtensionLoader(Class<T> type) {
        if (type == null) {
            throw new IllegalArgumentException("Extension type == null");
        }
        if (!type.isInterface()) {
            throw new IllegalArgumentException("Extension type (" + type + ") is not an interface!");
        }
        if (!withExtensionAnnotation(type)) {
            throw new IllegalArgumentException("Extension type (" + type +
                    ") is not an extension, because it is NOT annotated with @" + SPI.class.getSimpleName() + "!");
        }
        // 查看本地是否存在扩展点类型的Loader
        // 创建一个ExtensionLoader 并且将ExtensionFactory 的实现类均放入这个EXTENSION_LOADERS的本地map缓存中
        // ExtensionFactory 的实现有SpiExtensionFactory 和 SpringExtensionFactory
        ExtensionLoader<T> loader = (ExtensionLoader<T>) EXTENSION_LOADERS.get(type);
        if (loader == null) {
            EXTENSION_LOADERS.putIfAbsent(type, new ExtensionLoader<T>(type));
            loader = (ExtensionLoader<T>) EXTENSION_LOADERS.get(type);
        }
        return loader;
    }
```

![image-20210720183149860](https://tva1.sinaimg.cn/large/008i3skNgy1gsnlg4wo9tj30te07x0u6.jpg)

### getExtension

```java
getExtension(name)
    -> createExtension(name) #缓存获取 无缓存则创建
        -> getExtensionClasses().get(name) #从缓存中获取name的扩展点类型
        -> 实例化扩展类
        -> injectExtension(instance) # 扩展点IOC注入
        -> instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance)) 
  #循环遍历所有wrapper实现，实例化wrapper并进行扩展点IOC注入 
```



获取Dubbo的扩展点就从这个方法`ExtensionLoader.getExtension(String name)`出发吧。

```java
    public T getExtension(String name, boolean wrap) {
        if (StringUtils.isEmpty(name)) {
            throw new IllegalArgumentException("Extension name == null");
        }
        //如果传入的name为字符串true 则返回默认的扩展点
        if ("true".equals(name)) {
            return getDefaultExtension();
        }
        //从缓存中获取Holder 不存在则创建该缓存对象 并且从缓存中拿，可以防止放入缓存中失败的情况、
        //dubbo 实际将扩展类封装在Holder类中
        final Holder<Object> holder = getOrCreateHolder(name);
        Object instance = holder.get();
        if (instance == null) {
            //double-check 保证线程安全
            synchronized (holder) {
                instance = holder.get();
                if (instance == null) {
                    //缓存中没有就创建该扩展点
                    instance = createExtension(name, wrap);
                    //放入缓存 下次直接从缓存中拿取
                    holder.set(instance);
                }
            }
        }
        return (T) instance;
    }
```

在上述`getDefaultExtension()`方法主要是去拿默认扩展点名称，在load所有扩展点的方法里，会判断`@SPI`中的value值，即为默认的扩展点名称，将会赋值给`cachedDefaultName`，所以这里可以拿到一个默认扩展类。

### createExtension

接下来看看`createExtension(String name,boolean wrap)`方法如何创建扩展点。

```java
 private T createExtension(String name, boolean wrap) {
        //name:spi 获取到SpiExtensionFactory
        Class<?> clazz = getExtensionClasses().get(name);
        if (clazz == null || unacceptableExceptions.contains(name)) {
            throw findException(name);
        }
        try {
            //加载本地缓存Map(SpringExtensionFactory. SpiExtensionFactory)中的SpiExtensionFactory
            T instance = (T) EXTENSION_INSTANCES.get(clazz);
            if (instance == null) {
                //name:spi clazz:SpiExtensionFactory 这里反射将其加载到缓存中
                EXTENSION_INSTANCES.putIfAbsent(clazz, clazz.getDeclaredConstructor().newInstance());
                instance = (T) EXTENSION_INSTANCES.get(clazz);
            }
            //IOC注入
            injectExtension(instance);


            if (wrap) {
            //包装类装饰
                List<Class<?>> wrapperClassesList = new ArrayList<>();
                if (cachedWrapperClasses != null) {
                    wrapperClassesList.addAll(cachedWrapperClasses);
                    wrapperClassesList.sort(WrapperComparator.COMPARATOR);
                    Collections.reverse(wrapperClassesList);
                }

                if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
                    for (Class<?> wrapperClass : wrapperClassesList) {
                        Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
                        if (wrapper == null
                                || (ArrayUtils.contains(wrapper.matches(), name) && !ArrayUtils.contains(wrapper.mismatches(), name))) {
                            instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
                        }
                    }
                }
            }

            initExtension(instance);
            return instance;
        } catch (Throwable t) {
            throw new IllegalStateException("Extension instance (name: " + name + ", class: " +
                    type + ") couldn't be instantiated: " + t.getMessage(), t);
        }
    }
```

+ IoC注入：在上面注释中提到有一个`ExtensionFactory`，`injectExtension`方法可以将扩展点中需要注入的依赖去`ExtensionFactory`中找到，并且赋值。
+ 包装类装饰：这里有一个`cachedWrapperClasses`变量，不为空则会遍历，并且拿到具体Class对象的构造器，将刚刚反射创建的扩展点包装进来，并且进行Ioc依赖。

### getExtensionClasses

继续看上面的关键方法`getExtensionClasses()` 寻找扩展点

```java
    private Map<String, Class<?>> getExtensionClasses() {
        //缓存加载
        Map<String, Class<?>> classes = cachedClasses.get();
        if (classes == null) {
            //double-check
            synchronized (cachedClasses) {
                classes = cachedClasses.get();
                if (classes == null) {
                    //关键方法:获取所有扩展点 
                    classes = loadExtensionClasses();
                    cachedClasses.set(classes);
                }
            }
        }
        return classes;
    }
```

根据我们上面的示例，这里在`loadExtensionClasses()`方法加载完后，classes变量应该有两个值,key-name,value-class的形式存在，分别为：

```java
"http" -> {Class@1390} "class cc.ccoder.loader.HttpDownloadStrategy"
"sftp" -> {Class@1391} "class cc.ccoder.loader.SftpDownloadStrategy"
```

### loadExtensionClasses

然后继续查看关键方法`loadExtensionClasses()`

```java
    private Map<String, Class<?>> loadExtensionClasses() {
        //获取扩展点上的@SPI注解 并且缓存默认扩展点名称
        cacheDefaultExtensionName();

        //所有扩展点放入缓存
        Map<String, Class<?>> extensionClasses = new HashMap<>();

        //加载策略  这里是一个工厂方法;对指定文件夹进行加载
        //DubboInternalLoadingStrategy => META-INF/dubbo/internal/
        //DubboLoadingStrategy => META-INF/dubbo/
        //ServicesLoadingStrategy => META-INF/services/
        for (LoadingStrategy strategy : strategies) {
            loadDirectory(extensionClasses, strategy.directory(), type.getName(), strategy.preferExtensionClassLoader(),
                    strategy.overridden(), strategy.excludedPackages());
            loadDirectory(extensionClasses, strategy.directory(), type.getName().replace("org.apache", "com.alibaba"),
                    strategy.preferExtensionClassLoader(), strategy.overridden(), strategy.excludedPackages());
        }

        return extensionClasses;
    }
```

之前版本的的加载时直接对这几个文件夹进行`loadingDirectory`，重新调整后通过工厂方法类，UML如下：

```java
loadDirectory(extensionClasses, DUBBO_INTERNAL_DIRECTORY, type.getName());
loadDirectory(extensionClasses, DUBBO_INTERNAL_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
loadDirectory(extensionClasses, DUBBO_DIRECTORY, type.getName());
loadDirectory(extensionClasses, DUBBO_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
loadDirectory(extensionClasses, SERVICES_DIRECTORY, type.getName());
loadDirectory(extensionClasses, SERVICES_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
```

![image-20210720191055545](https://tva1.sinaimg.cn/large/008i3skNgy1gsnmkm6ngnj31fo0iuwha.jpg)



### cachedDefaultExtensionName

继续主线往下看，接下来就需要看看`cachedDefaultExtensionName()`方法做了哪些事情

```java
   /**
     * extract and cache default extension name if exists
     */
    private void cacheDefaultExtensionName() {
        //拿到@SPI注解
        final SPI defaultAnnotation = type.getAnnotation(SPI.class);
        if (defaultAnnotation == null) {
            return;
        }
        //拿到@SPI注解的value
        String value = defaultAnnotation.value();
        if ((value = value.trim()).length() > 0) {
            String[] names = NAME_SEPARATOR.split(value);
            //从这里可以看到默认扩展点只能够这只一个
            if (names.length > 1) {
                throw new IllegalStateException("More than 1 default extension name on extension " + type.getName()
                        + ": " + Arrays.toString(names));
            }
            if (names.length == 1) {
                //将这个值复制给cachedDefaultName
                cachedDefaultName = names[0];
            }
        }
    }
```

这里加载默认扩展点就和之前的相对应上，默认扩展点的加载时会获取@SPI注解的value,将其赋值给`cachedDefaultName`变量，在获取默认扩展点时，检查此变量并且从缓存中获取到默认扩展点。



### loadDirectory

然后继续回到上面`loadDirectory`方法会这三个路径下的文件进行加载，我们的配置文件以扩展接口全限定名称作为文件名放入以上三个相对路径其中之一即可，即可被`loadingDirectory`方法加载读取到。

```java
private void loadDirectory(Map<String, Class<?>> extensionClasses, String dir, String type,
                               boolean extensionLoaderClassLoaderFirst, boolean overridden, String... excludedPackages) {
        //将相对路径和全限定类名作为文件路径
        //例如: META-INF/services/cc.ccoder.loader.HttpDownloadStrategy
        String fileName = dir + type;
        try {
            Enumeration<java.net.URL> urls = null;
            ClassLoader classLoader = findClassLoader();

            // try to load from ExtensionLoader's ClassLoader first
            //首先尝试从ExtensionLoader的类加载器加载 该属性在LoaderStrategy接口中是一个默认方法并且为false
            if (extensionLoaderClassLoaderFirst) {
                ClassLoader extensionLoaderClassLoader = ExtensionLoader.class.getClassLoader();
                if (ClassLoader.getSystemClassLoader() != extensionLoaderClassLoader) {
                    urls = extensionLoaderClassLoader.getResources(fileName);
                }
            }

            if (urls == null || !urls.hasMoreElements()) {
                if (classLoader != null) {
                    //根据文件路径获取文件
                    urls = classLoader.getResources(fileName);
                } else {
                    urls = ClassLoader.getSystemResources(fileName);
                }
            }

            if (urls != null) {
                while (urls.hasMoreElements()) {
                    //对文件中内容 进行逐条加载资源
                    java.net.URL resourceURL = urls.nextElement();
                    loadResource(extensionClasses, classLoader, resourceURL, overridden, excludedPackages);
                }
            }
        } catch (Throwable t) {
            logger.error("Exception occurred when loading extension class (interface: " +
                    type + ", description file: " + fileName + ").", t);
        }
    }
```

### loadResource

上面`loadDirectory`方法会依次读取配置文件中扩展点配置，并且执行方法`loadResource`方法进行加载资源。

```java
private void loadResource(Map<String, Class<?>> extensionClasses, ClassLoader classLoader,
                              java.net.URL resourceURL, boolean overridden, String... excludedPackages) {
        try {
            //创建流 准备读取文件中内容
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceURL.openStream(), StandardCharsets.UTF_8))) {
                String line;
                String clazz = null;
                while ((line = reader.readLine()) != null) {
                    //定位符# 过滤掉文件中的注释内容
                    final int ci = line.indexOf('#');
                    if (ci >= 0) {
                        line = line.substring(0, ci);
                    }
                    line = line.trim();
                    if (line.length() > 0) {
                        try {
                            String name = null;
                            //定位符 = ,这是正式的记录 并且以=进行分割
                            int i = line.indexOf('=');
                            if (i > 0) {
                                // = 左边的为name
                                // = 右边的为class,扩展点的全限定类名
                                name = line.substring(0, i).trim();
                                clazz = line.substring(i + 1).trim();
                            } else {
                                // 当然也可以为空 直接整行记录为扩展点的全限定类名
                                clazz = line;
                            }
                            if (StringUtils.isNotEmpty(clazz) && !isExcluded(clazz, excludedPackages)) {
                                //加载类，利用反射预加载上面读取到的全限定类名
                                loadClass(extensionClasses, resourceURL, Class.forName(clazz, true, classLoader), name, overridden);
                            }
                        } catch (Throwable t) {
                            IllegalStateException e = new IllegalStateException(
                                    "Failed to load extension class (interface: " + type + ", class line: " + line + ") in " + resourceURL +
                                            ", cause: " + t.getMessage(), t);
                            exceptions.put(line, e);
                        }
                    }
                }
            }
        } catch (Throwable t) {
            logger.error("Exception occurred when loading extension class (interface: " +
                    type + ", class file: " + resourceURL + ") in " + resourceURL, t);
        }
    }
```

这里就是利用文件流进行读取配置文件，并且过滤注释(#), 逐行读取并且解析分割name和class内容，然后进行`loadClass`方法加载获取的全限定类名和名称，将其缓存到`extensionClasses`中。

### loadClass

接下来重点是`loadClass`这个方法

```java
   private void loadClass(Map<String, Class<?>> extensionClasses, java.net.URL resourceURL, Class<?> clazz, String name,
                           boolean overridden) throws NoSuchMethodException {
        //扩展类对象必须是扩展点接口的子类
        if (!type.isAssignableFrom(clazz)) {
            throw new IllegalStateException("Error occurred when loading extension class (interface: " +
                    type + ", class line: " + clazz.getName() + "), class "
                    + clazz.getName() + " is not subtype of interface.");
        }
        //自适应扩展点
        if (clazz.isAnnotationPresent(Adaptive.class)) {
            //将cachedWrapperClasses变量设置为clazz
            cacheAdaptiveClass(clazz, overridden);
        } else if (isWrapperClass(clazz)) {
            //判断扩展点构造函数中是否有参数是当前扩展接口类型
            //如果有，则为包装装饰类，将cachedWrapperClasses变量添加到当前clazz
            cacheWrapperClass(clazz);
        } else {
            //此处为普通的扩展点
            //获取默认的构造函数，没有默认构造函数则抛出异常
            clazz.getConstructor();
            if (StringUtils.isEmpty(name)) {
                //如果name为空 则判断类上是否存在@Extension注解，并且该注解的value为name =>extension.value
                //没有此注解则以小写类名为name =>clazz.getSimpleName()
                name = findAnnotationName(clazz);
                if (name.length() == 0) {
                    throw new IllegalStateException(
                            "No such extension name for the class " + clazz.getName() + " in the config " + resourceURL);
                }
            }

            String[] names = NAME_SEPARATOR.split(name);
            if (ArrayUtils.isNotEmpty(names)) {
                //如果类中有@Activate注解，则将name与注解对象缓存在cacheActivateClass变量中 cachedActivates.put(name, activate)
                cacheActivateClass(clazz, names[0]);
                for (String n : names) {
                    //缓存name key:clazz, value:name cachedNames.put(clazz, name);
                    cacheName(clazz, n);
                    //最后将拿到的扩展类放入map中 extensionClasses.put(name, clazz);
                    saveInExtensionClass(extensionClasses, clazz, n, overridden);
                }
            }
        }
    }
```

在`saveInExtensionClass`方法中如果扩展点作为普通扩展点，则将其放入`extensionClasses`中，以便后面取用。

```java
    /**
     * put clazz in extensionClasses
     */
    private void saveInExtensionClass(Map<String, Class<?>> extensionClasses, Class<?> clazz, String name, boolean overridden) {
        Class<?> c = extensionClasses.get(name);
        if (c == null || overridden) {
            //放入extensionClasses
            extensionClasses.put(name, clazz);
        } else if (c != clazz) {
            // duplicate implementation is unacceptable
            unacceptableExceptions.add(name);
            String duplicateMsg =
                    "Duplicate extension " + type.getName() + " name " + name + " on " + c.getName() + " and " + clazz.getName();
            logger.error(duplicateMsg);
            throw new IllegalStateException(duplicateMsg);
        }
    }
```

现在我们就可以回忆一下，`@SPI`扩展点的获取基本完成，并且从`loadClass`中发现只有普通扩展点才会被放入`extensionClasses`中。

+ 如果类中有`@Adaptive`注解，则将clazz放入`cachedAdaptiveClass`变量中，表示此类为自适应扩展类
+ 如果类的函数参数是扩展点接口类型的，将其将入`cachedWrapperClasses`变量，表示此类为包装装饰类
+ 如果上述两点都不满足，代表此类为普通扩展类，将其放入`extensionClasses`中，后续从该Map中获取。

一般来说扩展点都是普通扩展点，我们可以从`extensionClasses`中取用，那么就可以会到`createExtension`方法中从这个map中使用name拿取clazz对象，利用反射实例化进行使用。`Class<?> clazz = getExtensionClasses().get(name);`



### IOC依赖注入机制

上面`createExtension`方法中提到了`injectExtension(instance)进行注入。在获得扩展类时并不是简单的返回扩展类对象，而是会调用该方法后再进行返回，`并且在包装类中也会调用此方法注入依赖再进行返回。那么就来看看`injectExtension(instance)`方法都做了哪些事情。

```java
   private T injectExtension(T instance) {
        //objectFactory 是ExtensionFactory 的变量，在类构造器根据自适应扩展点进行初始化
        //类似于IOC容器工厂 实现的有SpiExtensionFactory SpringExtensionFactory
        if (objectFactory == null) {
            return instance;
        }

        try {
            //反射遍历实例中所有的方法
            for (Method method : instance.getClass().getMethods()) {
                //判断是否为setter方法:
                //方法名以set开头 startWith('set')
                // 方法参数只有一个 getParameterTypes.length()==1
                // 方法为public类型 Modifier.isPublic
                if (!isSetter(method)) {
                    continue;
                }
                /**
                 * Check {@link DisableInject} to see if we need auto injection for this property
                 */
                //判断校验该属性是否需要自动注入
                //打上了@DisableInject注解则不需要注入操作
                if (method.getAnnotation(DisableInject.class) != null) {
                    continue;
                }
                //获取该方法参数的clazz
                Class<?> pt = method.getParameterTypes()[0];
                if (ReflectUtils.isPrimitives(pt)) {
                    continue;
                }

                try {
                    //获取方法名中需要注入的属性property
                    //例如:方法setVersion 获取属性为version 并且将第四个小写 便是version
                    String property = getSetterProperty(method);
                    //使用参数的clazz与参数名称去ExtensionFactory 的 IOC容器中拿取扩展点类
                    Object object = objectFactory.getExtension(pt, property);
                    if (object != null) {
                        //调用set方法，完成注入
                        method.invoke(instance, object);
                    }
                } catch (Exception e) {
                    logger.error("Failed to inject via method " + method.getName()
                            + " of interface " + type.getName() + ": " + e.getMessage(), e);
                }

            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return instance;
    }
```

上述方法阅读完后可以总结如下：

+ 方法需要是set开头，参数为需要注入的依赖类型
+ 此方法若被`@DisableInject`标记，则不需要进行注入
+ 上面`ExtensionFactory`的IOC容器`objectFactory`是如何获取到扩展点的，便是下面的自适应扩展机制。



### 包装类装饰

从上面`loadClass`中发现，当我们获取扩展类时，如果有的类是包装类，那么此类并不会放`extensionClasses`类中被获取，而是放入`cachedWrapperClasses`中，在返回扩展示例的时候包装其他扩展示例。

```java

            if (wrap) {
            //包装类装饰
                List<Class<?>> wrapperClassesList = new ArrayList<>();
                if (cachedWrapperClasses != null) {
                    wrapperClassesList.addAll(cachedWrapperClasses);
                    wrapperClassesList.sort(WrapperComparator.COMPARATOR);
                    Collections.reverse(wrapperClassesList);
                }
                //前面提到在loadClass中如果扩展类时包装装饰类,便会将其放入cachedWrapperClasses 那么此处wrapperClassList也不会为空
                if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
                    for (Class<?> wrapperClass : wrapperClassesList) {
                        Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
                        if (wrapper == null
                                || (ArrayUtils.contains(wrapper.matches(), name) && !ArrayUtils.contains(wrapper.mismatches(), name))) {
                            //在此处进行注入包装
                            //同样利用反射创建此包装扩展点的实例，并将普通扩展点作为构造器参数传入包装扩展点进行实例化，此时返回的是包装器扩展点
                            //将其理解为装饰器模式 在原有的普通扩展点上进行增强 在RPC服务发布与调用时可以提现
                            instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
                        }
                    }
                }
            }
```





## 自适应扩展机制

在上面普通扩展机制中其实已经提到了自适应扩展机制，在`ExtensionLoader`初始化构造函数时便会有`objectFactory`对象，此对象就是在IOC依赖注入时会使用到，它便是通过自适应扩展机制获取到的。

```java
    private ExtensionLoader(Class<?> type) {
        this.type = type;
        objectFactory =
                (type == ExtensionFactory.class ? null : ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension());
    }
```

这里获取到`ExtensionFactory`接口的所有扩展点实例，但是使用了`getAdaptiveExtension`方法，也就是说调用该方法便得到的是一个自适应扩展，并不是一个具体的扩展类。

虽然我们可以获取到具体的扩展点类，但是并不想一开始就获取，而是在运行时动态获取。如果一开始就调用`ExtensionLoader.getExtension()`获取了扩展点，那么之后便无法去改变它。

通过上述了解明白Dubbo通过一个URL去动态加载扩展点，同时url也是通过配置文件获取。这样我们就可以在配置文件中使用zookeeper作为注册中心，修改配置文件后又可以将redis作为配置中心。dubbo根据配置文件的URL进行驱动，自适应加载不同的注册中心，在源码中出现过很多次，与上面SPI获取指定扩展点相配合坐到灵活扩展、动态配置。

+ `@Adaptive`作用在类上，dubbo会将类作为自适应扩展类。
+ `@Adaptive`作用在方法上，dubbo会动态的生成代码逻辑。例如`ProxyFactory`是一个自适应扩展类，注解作用在方法上时，将动态产生一个类叫做`ProxyFactory$Adaptive`，其中方法逻辑全部由dubbo生成。
+ 一般自适应扩展指的是dubbo从URL获取到参数，用dubbo的@SPI方式使用参数拿到扩展点，从而达到自适应的效果。上面例子`ProxyFactory`自适应扩展类上也被@SPI注解作用。



#### getAdaptiveExtension

```java
public T getAdaptiveExtension()
    -> createAdaptiveExtension() #从缓存中获取 否则创建
        -> getAdaptiveExtensionClass().newInstance() #获取AdaptiveExtensionClass
            -> getExtensionClasses() # 加载当前扩展所有实现，看是否有实现被标注为@Adaptive
            -> createAdaptiveExtensionClass() #如果没有实现被标注为@Adaptive，则动态创建一个Adaptive实现类
                -> createAdaptiveExtensionClassCode() #动态生成实现类java代码
                -> compiler.compile(code, classLoader) #动态编译java代码，加载类并实例化
        -> injectExtension(instance)
```



接下来就从`ExtensionLoader`的构造方法中找到`getAdaptiveExtension`方法，以该方法为入口看看自适应扩展点。

```java
    public T getAdaptiveExtension() {
        //缓存获取
        Object instance = cachedAdaptiveInstance.get();
        if (instance == null) {
            if (createAdaptiveInstanceError != null) {
                throw new IllegalStateException("Failed to create adaptive instance: " +
                        createAdaptiveInstanceError.toString(),
                        createAdaptiveInstanceError);
            }

            //double-check
            synchronized (cachedAdaptiveInstance) {
                instance = cachedAdaptiveInstance.get();
                if (instance == null) {
                    try {
                        //创建自适应扩展实例
                        //这里需要关注createAdaptiveExtension方法
                        instance = createAdaptiveExtension();
                        cachedAdaptiveInstance.set(instance);
                    } catch (Throwable t) {
                        createAdaptiveInstanceError = t;
                        throw new IllegalStateException("Failed to create adaptive instance: " + t.toString(), t);
                    }
                }
            }
        }

        return (T) instance;
    }
```

这个方法中和之前的逻辑差不多，缓存获取、double-check、创建扩展点实例。

在此我们需要着重关注`createAdaptiveExtension`方法



#### createAdaptiveExtension

```java
    private T createAdaptiveExtension() {
        try {
            //getAdaptiveExtensionClass获取到自适应类后进行IOC注入，IOC注入和之前的逻辑一样
            return injectExtension((T) getAdaptiveExtensionClass().newInstance());
        } catch (Exception e) {
            throw new IllegalStateException("Can't create adaptive extension " + type + ", cause: " + e.getMessage(), e);
        }
    }
```

这里逻辑比较简单，通过`getAdaptiveExtensionClass`方法获取到自适应类，然后再IOC注入，注入逻辑前面已经提到了。

那么接下里再看看`getAdaptiveExtensionClass`方法如何获取自适应类。



#### getAdaptiveExtensionClass

```java
    private Class<?> getAdaptiveExtensionClass() {
        //加载所有扩展点
        getExtensionClasses();
        //如果扩展点上存在@Adaptive注解 则cachedAdaptiveClass缓存变量不为空
        if (cachedAdaptiveClass != null) {
            //存在@Adaptive注解作用在类上 表示该自适应扩展类为人工编码 直接返回
            return cachedAdaptiveClass;
        }
        //表示没有@Adaptive注解标志 那么dubbo将生成自适应扩展类
        return cachedAdaptiveClass = createAdaptiveExtensionClass();
    }
```

在`getAdaptiveExtensionClass`中开始会使用`getExtensionClass`加载所有自适应扩展类，然后判断是否存在`@Adaptive`注解

+  如果类上存在`@Adaptive`注解，便会将其赋值给`cacheAdaptiveClass`对象，表示此自适应扩展类为人工编码，直接返回。
+ 如果构造函数参数为扩展点接口类型，表示此时为装饰类。
+ 普通类，为普通扩展类。

下面看看这个类图。

![image-20210721110640532](https://tva1.sinaimg.cn/large/008i3skNly1gsoe73lyzxj31nk0n8jun.jpg)

这里面我们着重看一下`AdaptiveExtensionFactory`如何自适应创建扩展类。

```java
@Adaptive
public class AdaptiveExtensionFactory implements ExtensionFactory {

    private final List<ExtensionFactory> factories;

    public AdaptiveExtensionFactory() {
        //自定义调整扩展点类的加载
        ExtensionLoader<ExtensionFactory> loader = ExtensionLoader.getExtensionLoader(ExtensionFactory.class);
        List<ExtensionFactory> list = new ArrayList<ExtensionFactory>();
        for (String name : loader.getSupportedExtensions()) {
            //扩展点类加载得到后 直接放入factories中
            list.add(loader.getExtension(name));
        }
        factories = Collections.unmodifiableList(list);
    }

    @Override
    public <T> T getExtension(Class<T> type, String name) {
        //由于factories已经获取到了ExtensionFactory的所有扩展点类 这里依次读取即可
        for (ExtensionFactory factory : factories) {
            T extension = factory.getExtension(type, name);
            //获取到type name 这样的扩展点 直接返回
            if (extension != null) {
                return extension;
            }
        }
        return null;
    }

}
```

这里可以看到`AdaptiveExtensionFactory`使用自定义的方式加载了`ExtensionFactory`的所有扩展点类，这样只需要在配置文件里面添加一个`ExtensionFactory`扩展点类，便可以动态的加载IOC容器，多增加一个IOC依赖来源。

同时在上面`AdaptiveExtensionFactory`类上面存在`@Adaptive`注解，那么便会直接将其返回，如果并不存在该注解dubbo便会自动创建自适应扩展类。这里继续回到上面`createAdaptiveExtension`方法的最后一行` createAdaptiveExtensionClass();`

#### createAdaptiveExtensionClass

```java
    private Class<?> createAdaptiveExtensionClass() {
        //创建一个生成类 类型=DownloadStrategy 扩展点类型 ，扩展点接口的class对象 和 默认扩展点名称
        //这里需要看看generate方法是如何生成的
        String code = new AdaptiveClassCodeGenerator(type, cachedDefaultName).generate();
        //拿到ExtensionLoader的ClassLoader
        ClassLoader classLoader = findClassLoader();
        //自适应方式拿到编译类 然后将代码进行编译 classLoader进行加载 最终编程一个Class对象
        org.apache.dubbo.common.compiler.Compiler compiler =
                ExtensionLoader.getExtensionLoader(org.apache.dubbo.common.compiler.Compiler.class).getAdaptiveExtension();
        return compiler.compile(code, classLoader);
    }
```

+ 加载创建一个生成类，类型为扩展点接口类型，还有默认扩展点名称
+ 拿到`ExtensionLoader`的`ClassLoader`
+ 自适应方式拿到编译类，然后将其编译并且通过`ClassLoader`加载，最终得到一个Class对象。



#### generate 生成自适应扩展点类

上面提到了重点是这个`generate`方法用来生成自适应扩展点类。

```java
 public String generate() {
        // no need to generate adaptive class since there's no adaptive method found.g
        //方法上无法找到@Adaptive注解 不需要生成自适应类 因为找不到自适应方法
        if (!hasAdaptiveMethod()) {
            throw new IllegalStateException("No adaptive method exist on extension " + type.getName() + ", refuse to create the adaptive class!");
        }

        StringBuilder code = new StringBuilder();
        //生成包名 package cc.ccoder.loader;
        code.append(generatePackageInfo());
        //导入依赖 import org.apache.dubbo.common.extension.ExtensionLoader;
        code.append(generateImports());
        //这里生成类名 之前说到的添加一个$Adaptive后缀 例如ProxyFactory生成的自适应代码ProxyFactory$Adaptive
        //public class %s$Adaptive implements %s {
        code.append(generateClassDeclaration());

        Method[] methods = type.getMethods();
        for (Method method : methods) {
            //依次生成方法
            code.append(generateMethod(method));
        }
        code.append("}");

        if (logger.isDebugEnabled()) {
            logger.debug(code.toString());
        }
        //返回代码 此时代码结构已经有了返回即可
        return code.toString();
    }
```

主要是这几个步骤：

+ 判断是否存在`@Adaptive`注解，是否需要生成自适应类
+ 生成包名 `package xxxxxx`
+ 导入依赖`inport org.apache.dubbo.common.extension.ExtensionLoader`
+ 生成类名，并且这里的类名会有一个后缀`$Adaptive`。`public class %s$Adaptive implements %s {`
+ 然后逐个生成自适应扩展点的接口方法
    - 这里就需要着重看一下`generateMethod`方法中是如何生成方法
+ 返回自适应扩展点类代码



#### generateMethod

```java
    private String generateMethod(Method method) {
        //获取方法的返回值类型
        String methodReturnType = method.getReturnType().getCanonicalName();
        //获取方法的名称
        String methodName = method.getName();
        //获取方法内容
        String methodContent = generateMethodContent(method);
        //获取方法的参数
        String methodArgs = generateMethodArguments(method);
        //获取方法抛出异常
        String methodThrows = generateMethodThrows(method);
        //通过这个模板生成方法
        //"public %s %s(%s) %s {\n%s}\n";
        return String.format(CODE_METHOD_DECLARATION, methodReturnType, methodName, methodArgs, methodThrows, methodContent);
    }
```

从这个`generateMethod`我们已经有些眉目了。获取待生成方法的返回值类型，获取方法名称，获取方法内容，获取方法参数以及抛出的异常信息，并且通过`public %s %s(%s) %s {\n%s}\n`这个模板进行生成。那么这里我们只需要着重看一下如何获取方法内容。通过`generateMethodContext`方法生成方法内容。

##### generateMethodContext

```java
 private String generateMethodContent(Method method) {
        //首选获取到方法上的@Adaptive注解
        Adaptive adaptiveAnnotation = method.getAnnotation(Adaptive.class);
        StringBuilder code = new StringBuilder(512);
        if (adaptiveAnnotation == null) {
            //如果此方法上面没有@Adaptive注解 便不为此方法生成动态方法 并且抛出一个异常UnsupportedOperationException
            return generateUnsupported(method);
        } else {
            //获取URL参数索引
            int urlTypeIndex = getUrlTypeIndex(method);

            // found parameter in URL type
            //在URL类型中找到参数,如果不为-1表示找到
            if (urlTypeIndex != -1) {
                // Null Point check
                //添加一个arg == null的校验
                code.append(generateUrlNullCheck(urlTypeIndex));
            } else {
                // did not find parameter in URL type
                //没有找到 在其他方法中判断是否可以获取到URL getUrl这个方法
                code.append(generateUrlAssignmentIndirectly(method));
            }
            //获取注解上的value值 代表获取扩展点时get的name值 ，如果不存在则使用类名的值作为键
            String[] value = getMethodAdaptiveValue(adaptiveAnnotation);

            //判断参数中是否有Invocation类型的参数，org.apache.dubbo.rpc.Invocation
            boolean hasInvocation = hasInvocationArgument(method);
            
            //生成Invocation参数值的代码 并且进行null校验
            code.append(generateInvocationArgumentNullCheck(method));
            
            //生成从url获取参数的代码 getMethodParameter getParameter getProtocol
            code.append(generateExtNameAssignment(value, hasInvocation));
            // check extName == null?
            //校验extName==null 的代码
            code.append(generateExtNameNullCheck(value));
            
            //生成getExtensionLoader(xxx.class).getExtension(extName)的代码
            code.append(generateExtensionAssignment());

            // return statement
            // 生成return语句 扩展点类执行方法
            code.append(generateReturnAndInvocation(method));
        }

        return code.toString();
    }
```

上述代码表示生成扩展点类方法内容的方法

+ 首先判断方法上是否存在`@Adaptive`注解，若没有不为此方法生成动态方法，并且抛出以下异常信息，表示该方法不支持动态。

    ```java
    throw new UnsupportedOperationException("The method %s of interface %s is not adaptive method!");
    ```

+ 生成`getUrl`方法,动态获取到配置的参数 此时已经校验了参数中是否存在URL

    ```java
    if (arg%d == null) throw new IllegalArgumentException("url == null");
    %s url = arg%d;
    ```

    如果没有便会在其他方法中是否可以获得到url.通过`generateUrlAssignmentIndirectly`方法判断。

    ```java
       private String generateUrlAssignmentIndirectly(Method method) {
            //获取参数类型
            Class<?>[] pts = method.getParameterTypes();
    
            //遍历所有方法中的参数
            Map<String, Integer> getterReturnUrl = new HashMap<>();
            // find URL getter method
            for (int i = 0; i < pts.length; ++i) {
                for (Method m : pts[i].getMethods()) {
                    String name = m.getName();
                    //是否已get开头或者参数方法名长度大于3
                    //方法名是public的 isPublic
                    //方法不是static的 isStatic
                    //方法没有参数 getParameterTypes.length == 0
                    //方法返回值为URL类型 org.apache.dubbo.common.URL
                    if ((name.startsWith("get") || name.length() > 3)
                            && Modifier.isPublic(m.getModifiers())
                            && !Modifier.isStatic(m.getModifiers())
                            && m.getParameterTypes().length == 0
                            && m.getReturnType() == URL.class) {
                        getterReturnUrl.put(name, i);
                    }
                }
            }
    
            if (getterReturnUrl.size() <= 0) {
                // getter method not found, throw
                throw new IllegalStateException("Failed to create adaptive class for interface " + type.getName()
                        + ": not found url parameter or url attribute in parameters of method " + method.getName());
            }
    
            Integer index = getterReturnUrl.get("getUrl");
            if (index != null) {
                //生成获取URL的代码
                return generateGetUrlNullCheck(index, pts[index], "getUrl");
            } else {
                Map.Entry<String, Integer> entry = getterReturnUrl.entrySet().iterator().next();
                return generateGetUrlNullCheck(entry.getValue(), pts[entry.getValue()], entry.getKey());
            }
        }
    ```

    那么接下来重点便是这个`generateGetUrlNullCheck`方法

##### generateGetUrlNullCheck

```java
    /**
     * 1, test if argi is null
     * 2, test if argi.getXX() returns null
     * 3, assign url with argi.getXX()
     */
    private String generateGetUrlNullCheck(int index, Class<?> type, String method) {
        // Null point check
        StringBuilder code = new StringBuilder();
        code.append(String.format("if (arg%d == null) throw new IllegalArgumentException(\"%s argument == null\");\n",
                index, type.getName()));
        code.append(String.format("if (arg%d.%s() == null) throw new IllegalArgumentException(\"%s argument %s() == null\");\n",
                index, method, type.getName(), method));

        code.append(String.format("%s url = arg%d.%s();\n", URL.class.getName(), index, method));
        return code.toString();
    }
```

从上面注释可以看出

+ 判断参数费否为空，并且抛出异常
+ 判断参数getXx是否为空 并且抛出异常
+ 将参数值赋值给`org.apache.dubbo.common.URL`这个类型。



也就是说我们最终是从URL获取参数

+ 查看是否存在`involocation`类型，如有则从url中获取`involocation.getMethonName`参数

+ 没有则从`@Apaptive`注解获取value值，当存在多个value时,则从value1、value2依次往后取。

    ```java
    //@Adaptive注解value
    String[] value() default {};
    ```

+ 如果多个value均没有取到后则从`@SPI`注解中取。

    ```java
    dubbo://10.20.54.65:20886/cc.ccoder.exchange.service.facade.api.ExchangeFacade?
    ```



#### ProxyFactory$Adaptive

前面提到了`ProxyFactory`会自适应生成扩展点类，下面便是生成的扩展点类。

```java
package org.apache.dubbo.rpc;

import org.apache.dubbo.common.extension.ExtensionLoader;

public class ProxyFactory$Adaptive implements org.apache.dubbo.rpc.ProxyFactory {
    public java.lang.Object getProxy(org.apache.dubbo.rpc.Invoker arg0) throws org.apache.dubbo.rpc.RpcException {
        if (arg0 == null) throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument == null");
        if (arg0.getUrl() == null)
            throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument getUrl() == null");
        org.apache.dubbo.common.URL url = arg0.getUrl();
        String extName = url.getParameter("proxy", "javassist");
        if (extName == null)
            throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.ProxyFactory) name from url (" + url.toString() + ") use keys([proxy])");
        org.apache.dubbo.rpc.ProxyFactory extension = ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.ProxyFactory.class).getExtension(extName);
        return extension.getProxy(arg0);
    }

    public java.lang.Object getProxy(org.apache.dubbo.rpc.Invoker arg0, boolean arg1) throws org.apache.dubbo.rpc.RpcException {
        if (arg0 == null) throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument == null");
        if (arg0.getUrl() == null)
            throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument getUrl() == null");
        org.apache.dubbo.common.URL url = arg0.getUrl();
        String extName = url.getParameter("proxy", "javassist");
        if (extName == null)
            throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.ProxyFactory) name from url (" + url.toString() + ") use keys([proxy])");
        org.apache.dubbo.rpc.ProxyFactory extension = (org.apache.dubbo.rpc.ProxyFactory) ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.ProxyFactory.class).getExtension(extName);
        return extension.getProxy(arg0, arg1);
    }

    public org.apache.dubbo.rpc.Invoker getInvoker(java.lang.Object arg0, java.lang.Class arg1, org.apache.dubbo.common.URL arg2) throws org.apache.dubbo.rpc.RpcException {
        if (arg2 == null) throw new IllegalArgumentException("url == null");
        org.apache.dubbo.common.URL url = arg2;
        String extName = url.getParameter("proxy", "javassist");
        if (extName == null)
            throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.ProxyFactory) name from url (" + url.toString() + ") use keys([proxy])");
        org.apache.dubbo.rpc.ProxyFactory extension = (org.apache.dubbo.rpc.ProxyFactory) ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.ProxyFactory.class).getExtension(extName);
        return extension.getInvoker(arg0, arg1, arg2);
    }
}
```

## 总结一下

+ `ExtensionLoader`加载一个具体的扩展点实现类。
+ 每个扩展点只会对应一个`ExtensionLoader`实例
+ 每个扩展点实现只会有一个实例，但是一个扩展点实现可以有多个名称。
+ 如果需要等到运行时才决定使用哪一个扩展点实现类，使用自适应扩展点实现便可.`AdaptiveExtensionFactory`
+ 判断`@Adaptive`注解是作用在`@SPI`注解的类上
+ 如果扩展点存在多个Wrapper,那么最终执行顺序是不固定的，内部使用`ConcurrentHashSet`存储