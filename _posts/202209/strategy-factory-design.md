---
title: 策略模式与工厂模式实践
date: 2022-09-24 16:49:15
author: 聪聪
category:
tags:
- strategy
- factory
- 设计模式
---

hello，大家好，我是聪聪。

---

[toc]

## 1.介绍

**策略模式**是一种行为设计模式， 它能让你定义一系列算法， 并将每种算法分别放入独立的类中， 以使算法的对象能够相互替换。

日常开发中，对于需要考虑各类场景、各类分支通用逻辑时，就需要考虑是否可以将`if-else` 、`switch` 逻辑替换成不同策略算法进行单独处理，提高代码的可读性、可维护性，避免代码混乱熵增。

这里简单介绍一下lambda替换策略模式的方式：

+ 对于`Collections#sort()` 的排序方法，使用何种排序策略来自于` java.util.Comparator#compare()` 中定义。
+ `javax.servlet.http.HttpServlet#ser­vice­()`方法， 还有所有接受 `Http­Servlet­Request`和 `Http­Servlet­Response`对象作为参数的 do­XXX()方法。根据`HttpServletRequest.getMethod` 获取请求方式(GET、POST、PUT ...)，用以路由处理各类请求策略。

如何识别是否是策略模式：

+ 通常策略模式可以通过允许嵌套对象完成实际工作的方法
+ 允许将该对象替换为不同对象的设置器来识别。

## 2.策略模式结构

### 2.1 分支逻辑解释

现在我们举个日常开发示例：

让我们设计一个算费系统，当中有根据不同计费策略计算得到应收手续费。

以下伪代码是最常的`if-else` `switch` 分支逻辑：

```java
    private static BigDecimal calculate(BigDecimal amount, String pricingModel) {
        //单笔固定收费1元
        if ("fixed".equals(pricingModel)) {
            return new BigDecimal("1.00");
        }
        //百分比收费 2%
        if ("percent".equals(pricingModel)) {
            return amount.multiply(new BigDecimal("0.02"));
        }
        //固定值+百分比， 1+2%
        if ("fixedAndPercentage".equals(pricingModel)) {
            return new BigDecimal("1.00").add(amount.multiply(new BigDecimal("0.02")));
        }
        throw new IllegalArgumentException("暂不支持计费模式:" + pricingModel);
    }

    public static void main(String[] args) {
        BigDecimal amount = new BigDecimal("100");
        //计算单笔固定收费
        System.out.println(calculate(amount,"fixed"));
        //计算百分比收费
        System.out.println(calculate(amount,"percent"));
        //计算固定值+百分比收费
        System.out.println(calculate(amount,"fixedAndPercentage"));
    }
```

上述逻辑已经根据计费模式`pricingModel` 来判断所属计算分支。看是仍然有以下弊端：

+ 新增其他计费模式时，就需要修改`calculate` 方法，新增对应分支逻辑，导致整体方法持续增长、每次修改就绪全量回归。
+ 无法灵活适应变化的场景；各计费模式对应策略修改时，无法及时变更；
  + 单笔固定收费从1元变更为5元需要及时修改逻辑，进行`hard coding `
  + 出现营销活动时百分比计费需要灵活变更时，从2%修改为1%时同样需要修改逻辑，无法适应快速迭代的营销活动。

下面将上述场景进行重构。

### 2.2 策略模式设计

首先看看策略模式应该是一个怎样的架构方式。

![image-20220924135826671](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-09-24-055827.png)

在这里我们需要做以下事情：

+ 根据上述伪代码中`if-else` 逻辑进行拆分，抽象出一个同样的计费策略接口：`PricingStrategy`
+ 一个执行上下文，用来创建特定计费策略对象，并且执行时将其引用替换为相关联的计费策略。`Context`
+ 根据现有不同计费模式，实现计费策略接口进行不同计费模式的计算实现。

那直接上代码看看。



### 2.3 策略模式代码

#### 2.3.1 通用策略接口及其各策略实现。

```java
//通用的计费策略接口
interface PricingStrategy {
    BigDecimal calculate(BigDecimal amount);
}

//固定计费模式
class FixedPricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return new BigDecimal("1.00");
    }
}

//固定百分比计费
class PercentPricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(new BigDecimal("0.02"));
    }
}

//固定值+百分比计费
class FixedAndPercentagePricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return new BigDecimal("1.00").add(amount.multiply(new BigDecimal("0.02")));
}
```

代码解释：

+ 一个通用策略接口 PricingStrategy
+ 各种策略算法实现方式：
  + 固定值计费：FixedPricingStrategy
  + 百分比计费：PercentPricingStrategy
  + 固定值+百分比计费：FixedAndPercentagePricingStrategy

#### 2.3.2 执行上下文信息

```java
//执行上下文：
class Context {
    public Context() {

    }

    //上下文会维护指向某个策略对象的引用
    private PricingStrategy pricingStrategy;

    // 上下文通常通过构造方法来设置策略
    public Context(PricingStrategy pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

    //也可以通过设置方法来切换策略
    public void setPricingStrategy(PricingStrategy pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

    // 上下文会将一些工作委派给策略对象，而不是自行实现不同版本的算法。
    public BigDecimal executeStrategy(BigDecimal amount) {
        return pricingStrategy.calculate(amount);
    }
}
```

代码解释：

+ 空构造器用以初始化上下文
+ 策略参数构造器用以初始化策略接口对象
+ 维护一个策略接口对象，用以后续指向具体策略算法实现
+ 策略对象委派执行到真实实现方法。



#### 2.3.3 客户端调用

```java
public class ClientMain {

    @Test
    void testConstructorCreation() {
        //构造器方式指定策略
        Context context = new Context(new FixedPricingStrategy());
        BigDecimal fixedResult = context.executeStrategy(new BigDecimal("100"));
        Assertions.assertEquals(fixedResult, new BigDecimal("1"));

        //切换策略
        context.setPricingStrategy(new PercentPricingStrategy());
        BigDecimal percentResult = context.executeStrategy(new BigDecimal("100"));
        Assertions.assertEquals(percentResult, new BigDecimal("2"));
    }

    @Test
    void testSetMethodCreation() {
        //set设置方法设置策略和切换
        Context context = new Context();

        //设置固定计费策略
        context.setPricingStrategy(new FixedPricingStrategy());
        BigDecimal fixedResult = context.executeStrategy(new BigDecimal("100"));
        Assertions.assertEquals(fixedResult, new BigDecimal("1.00"));

        //设置百分比计费策略
        context.setPricingStrategy(new PercentPricingStrategy());
        BigDecimal percentResult = context.executeStrategy(new BigDecimal("100"));
        Assertions.assertEquals(percentResult, new BigDecimal("2.00"));

        //设置固定值+百分比计费策略
        context.setPricingStrategy(new FixedAndPercentagePricingStrategy());
        BigDecimal fixedAndPercentResult = context.executeStrategy(new BigDecimal("100"));
        Assertions.assertEquals(fixedAndPercentResult, new BigDecimal("3.00"));
    }

    @ParameterizedTest
    @MethodSource(value = "allStrategy")
    void testRouteStrategy(String strategy) {
        Context context = new Context();
        if ("fixed".equals(strategy)) {
            context.setPricingStrategy(new FixedPricingStrategy());
        }
        if ("percent".equals(strategy)) {
            context.setPricingStrategy(new PercentPricingStrategy());
        }
        if ("fixedAndPercentage".equals(strategy)) {
            context.setPricingStrategy(new FixedAndPercentagePricingStrategy());
        }

        BigDecimal result = context.executeStrategy(new BigDecimal("100"));
        //打印结果
    }

    static Object[] allStrategy() {
        return new Object[]{"fixed", "percent", "fixedAndPercentage"};
    }
}
```

上述测试方法很清晰：

+ `testConstructorCreation` 通过构造器方式生成上下文，设定具体策略实现，同样后续可以通过set方法进行切换策略算法。
+ `testSetMethodCreation` 初始化空构造器方式生成上下文，通过set方法进行切换设置策略算法。
+ `routeStrategy` 初始化空构造器方式生成上下文，通过外部所传策略方法，进行路由具体策略算法实现。

#### 2.3.4 总结

上述策略模式重构相比于`if-else` `switch` 等分支逻辑已经结构化，相互解耦，减少维护成本。总结有以下优点：

+ 策略算法可以自由切换，相互之间解耦。
+ 上下文可在运行时进行切换对象内的策略算法。
+ 扩展性好，新增其他策略算法时，实现通用算法策略接口即可。
+ 开闭原则，无需对上下文进行修改就能引入新的策略。

有有点，当然也有缺点：

+ 策略算法较少时，没必要引入新的类、接口，增加程序复杂度。

+ 客户端必须知道所有的策略实现类，才能够通过上下文进行设置选择合适的策略。

那么，我们可以通过工厂模式+策略模式进行结构化、抽象此类策略算法的结构。在扩展中进行演示。

## 3.常用示例

上述策略模式的重构仍然可以有优化的余地：

+ 各类策略可以定义枚举进行设定。
+ 通过工厂模式，客户端无需知道所有策略实现。

那我们直接上代码：

### 3.1 定义一个策略枚举

```java
public enum StrategyEnum {
    FIXED,
    PERCENT,
    FIXED_AND_PERCENTAGE;

    StrategyEnum() {
    }
}
```

在该枚举中定义了所有策略类型，后续新增策略算法是进行扩展该枚举即可。

### 3.2 策略接口增加serviceCode

```java
public interface PricingStrategy {
    BigDecimal calculate(BigDecimal amount);

    //每次一个策略接口实现均会实现该接口 用以标记策略实现的具体类型
    String getServiceCode();
}
```

修改策略接口，增加`getServiceCode()` 方法。

### 3.3 策略接口实现

```java
//固定计费模式
public class FixedPricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return new BigDecimal("1.00");
    }

    @Override
    public String getServiceCode() {
        return StrategyEnum.FIXED.name();
    }
}


//固定百分比计费
class PercentPricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(new BigDecimal("0.02"));
    }

    @Override
    public String getServiceCode() {
        return StrategyEnum.PERCENT.name();
    }
}

```

策略实现类中均实现了`getServiceCode()` 接口，用以返回该策略实现类所属类型或服务编码，后续可以通过工厂模式进行生产获取该类型策略。

### 3.4 策略工厂

```java
@Slf4j
public class PricingStrategyFactory {

    public PricingStrategyFactory(List<PricingStrategy> list) {
        init(list);
    }

    private final Map<String, PricingStrategy> pricingStrategyMap = new HashMap<>();

    private void init(List<PricingStrategy> strategyList) {
        if (strategyList == null) {
            return;
        }
        for (PricingStrategy strategy : strategyList) {
            String serviceCode = strategy.getServiceCode();
            if (serviceCode == null) {
                throw new IllegalArgumentException(String.format("Registration service code cannot be empty:%s",
                        strategy.getClass()));
            }
            if (!pricingStrategyMap.containsKey(serviceCode)) {
                pricingStrategyMap.put(serviceCode, strategy);
                log.info("Registration service: {} , {}", serviceCode, strategy.getClass());
            } else {
                throw new IllegalArgumentException(String.format("Duplicate registration service: %s , %s , %s",
                        serviceCode, pricingStrategyMap.get(serviceCode).getClass(), strategy.getClass()));
            }
        }
    }

    public PricingStrategy getService(String serviceCode) {
        return pricingStrategyMap.get(serviceCode);
    }
}
```

这里我们将所有计费策略实现全部存储在一个Map中进行初始化。

通过策略接口中getServiceCode() 作为key进行存储，后续通过`getService(String serviceCode)` 即可获得对应的策略接口实现。

### 3.5 使用方式

```java
public class TestStrategyFactory {

    private PricingStrategyFactory pricingStrategyFactory;

    @BeforeEach
    void init() {
        List<PricingStrategy> strategyList = initPricingStrategy();
        pricingStrategyFactory = new PricingStrategyFactory(strategyList);
    }

    @Test
    void testFixedCalculate() {
        PricingStrategy strategy = pricingStrategyFactory.getService(StrategyEnum.FIXED.name());
        BigDecimal fixedResult = strategy.calculate(new BigDecimal("100"));
        Assertions.assertEquals(fixedResult, new BigDecimal("1.00"));
    }

    @Test
    void testPercentCalculate() {
        PricingStrategy strategy = pricingStrategyFactory.getService(StrategyEnum.PERCENT.name());
        BigDecimal percentResult = strategy.calculate(new BigDecimal("100"));
        Assertions.assertEquals(percentResult, new BigDecimal("2.00"));
    }

    // 这里初始化所有PricingStrategy 接口的所有实现。
    // 如果你是通过spring管理，直接通过@Autowrited即可注入得到List<PricingStrategy>
    static List<PricingStrategy> initPricingStrategy() {
        return Arrays.asList(new FixedPricingStrategy(), new PercentPricingStrategy());
    }
}
```

上面使用方式就不过多解释了。注意初始化`PricingStrategyFactory` 的方式，此处只有一个构造器，需要注入策略接口的所有实现。

如果你是用的是spring进行管理，那么直接可以通过`@Autowired` 的方式即可将所有接口实现进入注入，得到一个`List<PricingStrategy>` 。

下面看看执行启动日志，可以很清晰的看到目前应用已注册多种策略：

```bash
Registration service: FIXED , class cc.ccoder.designpatterns.strategy.refactor.FixedPricingStrategy
Registration service: PERCENT , class cc.ccoder.designpatterns.strategy.refactor.PercentPricingStrategy
```

当然如果你有多个平行的策略时，都需要这样创建一个工厂，岂不是重复的逻辑又增加了。

是否有一种优雅的方式进行工厂方法复用呢？

上述将策略接口实现类放入Map中、从Map中通过serviceCode获取对应策略接口实现的逻辑应该是一致的，我们便可将其进行抽象出来。



## 4. 策略模式和工厂模式组合

+ 定义一个高度抽象的接口，提供serviceCode方法即可。
+ 定义一个策略接口的工厂接口，提供对应的策略方法。
+ 定义一个抽象的工厂方法，用以将策略接口方法放入Map，通过serviceCode获取对应策略接口。

以上便是我们的需求，那么接下来就开始编码看看。

### 4.1 一个提供serviceCode方法的接口

```java
public interface CodeService {

    /**
     * 服务编码必须唯一
     *
     * @return 服务编码
     */
    String getServiceCode();
}
```

这是一个顶层接口，后续所有策略工厂模式接口均需要实现该接口，根据策略枚举内容进行返回。



### 4.2 策略接口的工厂

```java
public interface CodeServiceFactory<Provider extends CodeService> {

    /**
     * 获取服务
     *
     * @param serviceCode 服务编码
     * @return 返回服务，不存在时返回null
     */
    Provider getService(String serviceCode);
}
```

这里限定了后续所有的策略提供者`Provider` 均需要继承于`CodeService` 接口。

### 4.3 抽象的工厂方法

```java
public abstract class AbstractCodeServiceFactory<Provider extends CodeService>
  implements CodeServiceFactory<Provider> {

    private static final Logger log = LoggerFactory.getLogger(AbstractCodeServiceFactory.class);

    private final Map<String, Provider> serviceProviderMap = new HashMap<>();

    protected AbstractCodeServiceFactory(List<Provider> providers) {
        initializeProviderMap(providers);
    }

    /**
     * Initialize Factory Service
     *
     * @param providers 服务接口
     */
    private void initializeProviderMap(List<Provider> providers) {
        log.info("Initialize Factory Service:{}", getFactoryName());
        if (providers == null) {
            return;
        }
        for (Provider provider : providers) {
            String serviceCode = provider.getServiceCode();
            if (serviceCode == null) {
                throw new IllegalArgumentException(
                        String.format("Registration service code cannot be empty :%s", provider.getClass()));
            }
            if (!serviceProviderMap.containsKey(serviceCode)) {
                serviceProviderMap.put(serviceCode, provider);
                log.info("Registered service: {}, {}", serviceCode, provider.getClass());
            } else {
                throw new IllegalArgumentException(String.format("Duplicate registration service: %s, %s, %s",
                        serviceCode, serviceProviderMap.get(serviceCode).getClass(), provider.getClass()));
            }
        }
    }

    /**
     * 获取服务 服务接口不存在时返回null
     *
     * @param serviceCode 服务编码
     * @return 服务接口c
     */
    @Override
    public Provider getService(String serviceCode) {
        return serviceProviderMap.get(serviceCode);
    }

    /**
     * 服务工厂名称
     *
     * @return 工厂名称用于日志
     */
    protected abstract String getFactoryName();

}
```

将上述逻辑抽象到一个抽象工厂中，后续策略工厂便可通用。

+ `getService()`方法，获取`serviceCode` 对应的策略接口提供者。
+ `getFactoryName()` 方法，底层工厂方法需实现，用以区分各个策略工厂。

那么问题来了？

如何使用这样一个抽象工厂+策略模式的组合呢？

那么现在我们有既定的计费策略需要实现，同时还增加了根据支付方式不同路由到不同的渠道进行支付的场景。

就需要有以下两个策略场景

+ 计费策略进行算费
+ 支付方式策略进行路由渠道。

### 4.4 使用方式

#### 4.4.1 计费策略工厂

```java
public class PricingStrategyFactory extends AbstractCodeServiceFactory<PricingStrategy> {

    public PricingStrategyFactory(List<PricingStrategy> pricingStrategies) {
        super(pricingStrategies);
    }

    @Override
    protected String getFactoryName() {
        return "计费策略工厂";
    }
}
```

实现顶层抽象工厂模板即可。

构造方式初始化所有该策略算法的实现。

如果你是spring管理，直接将该工厂进行`@Component` 管理即可使用。

#### 4.4.2 资金支付工厂

```java
public class FundServiceFactory extends AbstractCodeServiceFactory<FundService> {

    public FundServiceFactory(List<FundService> fundServiceList) {
        super(fundServiceList);
    }

    @Override
    protected String getFactoryName() {
        return "资金支付工厂";
    }
}
```

#### 4.4.3 客户端使用

```java
public class TestAbstractStrategyFactory {

    private FundServiceFactory fundServiceFactory;
    private PricingStrategyFactory pricingStrategyFactory;

    @BeforeEach
    void init() {
        fundServiceFactory = new FundServiceFactory(initFundService());
        pricingStrategyFactory = new PricingStrategyFactory(initPricingStrategy());
    }

    @Test
    void testFixedCalculate() {
        PricingStrategy strategy = pricingStrategyFactory.getService(StrategyEnum.FIXED.name());
        BigDecimal fixedResult = strategy.calculate(new BigDecimal("100"));
        Assertions.assertEquals(fixedResult, new BigDecimal("1.00"));
    }

    @Test
    void testPercentCalculate() {
        PricingStrategy strategy = pricingStrategyFactory.getService(StrategyEnum.PERCENT.name());
        BigDecimal percentResult = strategy.calculate(new BigDecimal("100"));
        Assertions.assertEquals(percentResult, new BigDecimal("2.00"));
    }

    @Test
    void testFundServiceAlipay() {
        FundService service = fundServiceFactory.getService(ThirdPayChannel.ALIPAY.name());
        String result = service.pay("pay parameters");
        Assertions.assertTrue(result.startsWith(ThirdPayChannel.ALIPAY.name()));
    }

    @Test
    void testFundServiceWeChat() {
        FundService service = fundServiceFactory.getService(ThirdPayChannel.WECHAT.name());
        String result = service.pay("pay parameters");
        Assertions.assertTrue(result.startsWith(ThirdPayChannel.WECHAT.name()));
    }

    // 这里初始化所有PricingStrategy 接口的所有实现。
    // 如果你是通过spring管理，直接通过@Autowrited即可注入得到List<PricingStrategy>
    static List<PricingStrategy> initPricingStrategy() {
        return Arrays.asList(new FixedPricingStrategy(), new PercentPricingStrategy());
    }

    //如上所示
    static List<FundService> initFundService() {
        return Arrays.asList(new WeChatFundService(), new AliPayFundService());
    }
}
```

通过设计模式中各类模式的组装、演变可以让我们在系统设计、代码架构方面能力得到提升。

切记：

**不可有了锤子，遍地都是钉子。**

## 5. 参考资料

+ [策略模式：https://refactoringguru.cn/design-patterns/strategy](https://refactoringguru.cn/design-patterns/strategy)

+ [设计模式二三事情：https://tech.meituan.com/2022/03/10/interesting-talk-about-design-patterns.html](https://tech.meituan.com/2022/03/10/interesting-talk-about-design-patterns.html)
+ [2] 弗里曼. Head First 设计模式 [M]. 中国电力出版社, 2007.



最后的最后。

以上所有涉及源码均会在GitHub进行同步更新。欢迎follow and star。

[https://github.com/ccoderJava/designpatterns](https://github.com/ccoderJava/designpatterns)





全文完。

---

了解更多内容，可以关注我的微信公众号，更多首发文章。
![wechat](https://ccoder-markdown-oss.oss-cn-shanghai.aliyuncs.com/md/2022-07-28-064228.bmp)

