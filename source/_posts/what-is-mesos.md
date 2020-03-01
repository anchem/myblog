---
title: Mesos
date: 2016-10-22
categories: 软件工程师系列
tags: 
- 主题探究
- 云计算
- Mesos
keywords: 云计算,Mesos,软件工程师
---

近期由于项目需要，我在研究Apache Mesos，它是一个分布式操作系统的内核。下面我将分几个部分来介绍Mesos：

 - **背景**
 - **什么是Mesos**
 - **Mesos是如何运作的**
 - **如何使用Mesos**
<!-- more -->
### 1 背景

#### 1.1 资源划分

现代大部分应用程序最根本的基础在于**存储和处理数据**，当数据量和计算量不断上升时，传统的方式是通过购买硬件来扩容，但是渐渐地，企业发现，这种方式也不能满足需求了。

一些大型企业开始向分布式应用转型，他们把大量计算机当成单个巨型机器使用，在这些计算机中划分资源给不同的分布式应用程序。

比如有这么一个场景，我现在有9台计算机，有三个分布式应用要运行，分别是Hadoop，Spark和Ruby on Rails。为了公平起见，我给每个应用分配3台机器，如下图所示：

![静态资源划分](/img/mesos/example1.png)

假设在某一个时间段内，它们运行时的负载是这样的：

![负载](/img/mesos/example2.png)

从这里面，我们能看到，每个分布式应用在同一时刻对资源的使用率是不同的，有的高，有的低。这就导致了计算机集群的资源使用效率非常低。

那么有没有一种更好的方式来提高资源利用率呢？试想这样一种场景，我们把这些计算机集群看成一个超级计算机，每个分布式应用都在它上面运行，这个超级计算机会动态地给它们分配资源。如下图所示：

![动态资源划分](/img/mesos/example3.png)

![动态资源划分2](/img/mesos/mesos-elastic-sharing.png)

这样，我们就可以在同一个集群上，运行多个分布式应用，它们共享集群资源。这种方式可以明显地提高资源利用率。

### 1.2 集群计算框架

那么，我们把这种解决方案就叫做，集群计算框架。这种集群计算框架的一个很重要的功能，就是资源管理功能，这项功能会交给集群管理器去完成，它应该能满足以下的目标：

1. **高效性**。高效共享资源，提高资源利用效率。
2. **隔离性**。当多个任务共享资源时，系统要确保资源的隔离性，也就是任务和任务之间不能互相影响，这其中包括计算、存储等资源。
3. **可伸缩性**。集群计算框架作为一种基础架构，它是会持续增长的，所以集群的管理程序应该可以线性伸缩。
4. **健壮性**。持续的业务运营要求健壮的集群管理，比如良好的测试代码，容错性等。
5. **可扩展性**。可维护性很重要，集群管理软件必须是可配置的，同时可以考虑到很多约束条件，还能支持多种不同的框架。

为了满足这个需求，Mesos出现了。

![Mesos1](/img/mesos/mesos1.png)

### 2 什么是Mesos？

### 2.1 Mesos的定义

Apache Mesos 官方给出的定义是：

 > A distributed systems kernel 分布式系统内核
 > Mesos is built using the same principles as the Linux kernel, only at a different level of abstraction. The Mesos
kernel runs on every machine and provides applications (e.g., Hadoop, Spark, Kafka, Elasticsearch) with API’s for
resource management and scheduling across entire datacenter and cloud environments.
 > Apache Mesos abstracts CPU, memory, storage, and other compute resources away from machines (physical or virtual), enabling fault-tolerant and elastic distributed systems to easily be built and run effectively.

Mesos将一个计算机集群抽象成了一个拥有巨量资源的单台超级计算机。它将物理机器抽象成资源，通过消费它的抽象资源来构建分布式系统。可以将Mesos看成是为构建和运行其他分布式系统提供服务的分布式系统。你可以在Mesos之上构建不同的分布式系统，Spark、Storm、Hadoop，甚至你自己编写的分布式系统，它们可以共享一个计算机集群，在一个统一的基础架构上（Mesos）运行。  

#### 2.2 Mesos vs. Linux

![Mesos vs Linux](/img/mesos/mesos_linux.png)

用Linux和Mesos做类比：

 - 它们都是操作系统内核，一个构建在单台机器上，一个构建在多台机器上；
 - 它们都提供了程序的隔离性，Linux是Process，Mesos是Linux Container；
 - 它们都提供了资源共享的功能，Linux是Process Scheduler，Mesos是Scheduler；
 - 它们都提供了公共的基础架构，Linux提供了read()、write()、bind()、connect()等，Mesos提供了LaunchTask()、KillTask()、statusUpdate()等；
 - 它们都提供了包管理功能，Linux是wget、yum等，Mesos提供了Docker。  

![Mesos Logo](/img/mesos/mesosphere-logo-370x290.png)

### 2.3 Mesos有哪些特性？

 - **线性扩展** - 在生产环境已经可以很轻易地扩展到10000多个节点。
 - **高可用** - 基于Zookeeper的容错机制使得Master和运行在Slave之上的agent高可用，并且支持无缝升级。
 - **容器支持** - 天生支持容器，包括内建的、Docker以及外部容器机。
 - **可插拔的资源隔离** - 支持CPU、内存、磁盘、端口、GPU的资源隔离，也支持定制化的资源隔离。
 - **两级调度** - 对于运行在同一个集群上的各种分布式应用，提供可插拔的调度策略。
 - **API丰富** - 提供HTTP APIs，可以开发新的分布式应用，操控集群以及对集群进行监控管理。
 - **WEB UI** - 内建的WEB UI提供了集群状态视图等功能。
 - **跨平台** - 可以运行在Linux、OSX、Windows，或各种云平台上。

### 2.4 Mesos的关键概念

 - **master** 负责在slave资源和framework之间进行调度。它以资源offer的形式将slave的资源提供给framework，并且根据已接受的offer在slave上启动任务。同时它还负责task和framework之间的通信。
 - **slave（agent）** 是Mesos集群里的工作节点。管理单个节点上的资源，比如cpu、内存、端口、GPU等，同时执行framework提交的task。
 - **framework** 运行在Mesos之上的分布式应用。每一种framework都包含调度程序和执行程序。调度程序决定是否接受资源offer。执行程序是资源消费者，运行在slave上，负责运行任务。

### 3 Mesos是如何运作的

#### 3.1 Mesos架构

![Mesos架构](/img/mesos/mesos_architecture.png)

Mesos的结构：一个master守护进程，它负责管理在集群节点上运行的agent守护进程（也就是slave），然后每个framework会在这些agent上运行task。

Mesos建立在硬件设施之上（包括物理主机、公有云、私有云等），面向framework提供服务。Mesos只提供资源共享和资源隔离能力，它将task的真正调度和执行交给framework来负责，因此framework可以按需实现自己的调度和容错机制。Mesos由5个核心部分组成：
 1. Mesos master
 2. Mesos slave
 3. framework
 4. 通信
 5. 附属服务

**Mesos slave（agent**  

利用已有资源执行framework下发的任务，同时对运行中的任务进行合适的隔离。  

slave上的资源由资源描述符来描述：【slave资源】描述任务运行中所要消耗的元素，【slave属性】描述slave的相关信息。例如：

 > --resources='cpus:30;mem:122880;disk:921600;ports:[21000-29000];bugs:{a,b,c}'
 > --attributes='rack:rack-2;datacenter:europe;os:ubuntuv14.4'

**Mesos master**

负责给各个不同的framework分配资源并管理任务的生命周期。它通过资源offer的形式完成细粒度的资源分配。每一个资源offer包含一个资源列表`<agent ID, resource1: amount1, resource2: amount2, ...>`。master根据组织策略（公平共享或优先级）决定给每个framework多少资源。为了可以添加多种不同的策略，Mesos提供了一种可插拔的模块架构来支持。

**Framework**

在Mesos之上运行的分布式应用。它通过Mesos提供的通用资源API来实现需求。通常framework会运行很多任务，任务是资源的最终消费者，且任务之间可以不同。  

framework由两部分组成：框架调度器，执行器。调度器协调任务的执行。执行器提供任务执行控制的功能。可以在一个执行器内运行一个任务，也可以在一个执行器中使用多进程来完成多个任务。除此之外，framework API提供了和调度器及执行器通信的功能。

![Mesos架构2](/img/mesos/mesos_arch.png)

**通信**

Mesos利用一个和HTTP类似的协议在各个组件之间进行通信。利用libprocess库。如：

 1. framework调度器和Mesos master。
 2. framework执行器和Mesos slave。
 3. Mesos master和slave。
 4. 运维API。

**附属服务**

本身不是Mesos的一部分，也不是运行Mesos所必需，但是可以帮助我们更好的管理生产环境的Mesos集群。

 - 共享文件系统。比如HDFS。
 - 一致性服务。Zookeeper，etcd。
 - 服务编排。让在Mesos上运行的服务和应用，能够实现无缝连接。
 - 运维服务。

#### 3.2 Mesos的资源分配

因为各个framework所需要的调度不一样，所以Mesos提供了两级调度，也就是资源分配和任务调度的隔离。Mesos master负责决定分配给每个framework多少资源，任务调度器负责决定如何使用这些资源，这取决于每个框架的调度器如何根据自身的需求去实现。Mesos在各个framework之间进行粗粒度的资源分配，每个framework根据自身任务的特点进行细粒度的任务调度。

![调度](/img/mesos/scheduling.jpg)

过程：

 1. framework调度器在Mesos master中进行注册。
 2. Mesos master从slave获取资源offer，调用分配模块的函数决定将这些资源分配给哪个framework。
 3. framework调度器从Mesos master接收资源offer。
 4. 调度器检查offer是否合适。如果合适，调度器接受offer，并向master返回一个需要在slave上利用这些资源运行的执行器列表。如果不合适，则拒绝offer，等待合适的offer。
 5. slave分配所请求的资源并运行任务执行器。任务执行器在slave节点上运行框架下的任务。此时会将执行器全部打包，在对应的slave机器上启动。当任务执行完毕后，资源会被释放，以便可以执行其他任务。  
 6. framework调度器接收任务运行成功或失败的通知。同时framework调度器继续接收资源offer和任务报告，并在合适的时机启动任务。  
 7. framework从Mesos master注销。一些需要长时间运行的服务和元框架（如Marathon）在正常操作流程中并不会注销。

这样的设计会使得调度器并不了解全局的资源利用率，因此资源的分配可能并不是最优的。在Mesos中，framework并不会将自己的特殊资源需求显式告知给Mesos master，而是拒绝master发送的所有不符合需求的资源offer。

Mesos使用DRF算法进行资源分配。而且可以通过加权来分配比例。同时还提供了资源预留功能，以避免某些应用无法获得资源offer，进而导致服务无法使用。

#### 3.3 Mesos的资源隔离

![资源隔离](/img/mesos/mesos_container.png)

Mesos在slave上提供多种隔离机制，以便为不同的任务提供沙箱环境。Mesos提供容器级别的资源隔离功能。  

在slave操作系统之上有一个容器层，这一层运行着一个个容器，容器里包含了执行器和任务。在容器层之上有一个容器机API，它支持不同的容器机实现。slave启动的时候，我们可以指定使用的容器机和隔离器的类型，来对资源进行隔离。

**Mesos容器机**  

内部容器机实现，提供两种隔离器：基于POSIX系统的进程级别的基础隔离，基于Linux内核特性的cgroups的cgroups隔离。

**Docker容器机**  

Docker是一个构建、分发和运行应用的开放平台。通过它可以轻松地将应用进行组合，并利用上层API以可移植的方式运行轻量级的Docker容器。它可以利用cgroups、LXC、OpenVZ和内核级别的namespaces进行隔离。Mesos原生支持Docker。

**外部容器机**  

容器中执行器的隔离需要外部容器机自己去实现和管理。

#### 3.4 容错

考虑三种错误情况：机器宕机、Mesos进程bug和升级。

若Mesos slave宕机，master会发现情况，并给framework发送该slave宕机事件，由framework将任务重新调度到别的slave上。slave恢复正常之后，会重新向master注册。若slave进程错误或升级，slave进程暂时不可用，但是在slave上的执行器不受影响，slave进程会在重启后恢复这些任务。  

若framework调度器出现错误，framework下的任务会继续执行，当恢复了之后，它会向master重新注册并获取所有任务的状态信息。

Mesos利用Zookeeper选主保证master高可用。

#### 3.5 持久化

Mesos如何确保当任务被调度的时候，分配的节点可以访问其所需的数据？Mesos提供多种选择来处理：

 1. 分布式文件系统。比如HDFS。缺点是会有网络延迟。
 2. 使用数据存储复制的本地文件系统。程序级别的复制，比如NoSQL，Cassandra或MongoDB。优点是不用考虑网络延迟，缺点是必须配置Mesos，使特定的任务只运行在持有复制数据的节点上。
 3. 不使用复制的本地文件系统。可以将持久化数据存储在指定节点的文件系统上，并且将该节点预留给指定的应用程序。在不允许延迟或者应用程序不能复制它的数据存储等特殊情况下才会这样选择。

#### 3.6 扩展Mesos

Mesos一直试图将其核心最小化，将不是所有用户都需要的功能从核心一出。它提供了集成接口，各种不同的外部系统实现都可以通过它与Mesos进行集成。几乎所有的Mesos组件都可以被不同的实现所替换。

### 4 如何使用Mesos

#### 4.1 安装和配置
 1. 遵循Apache Mesos官网上的步骤，一步一步构建Mesos。首先要确保系统拥有Mesos运行的依赖软件包。然后再下载Mesos，构建并运行。
 2. 可以先运行单机的Mesos集群，包含一个master和一个slave，均在一台机器上运行。同时可以运行测试框架查看集群配置是否正确。Mesos提供了一个Web UI来展示集群信息。
 3. 多节点集群。重复上述步骤，在每个slave上启动mesos-slave，也可以启动整个集群，但是这样很麻烦。可以使用SSH和Mesos的deploy目录来部署。

#### 4.2 运行示例 

![示例](/img/mesos/mesos-12.jpg)

#### 4.3 运行服务

以上所介绍的在Mesos之上运行的framework都是运行短暂任务的，而实际应用中有很多需要长期运行的应用，或者成为服务。基于Mesos，还有一些服务框架，可以提供更强大的能力。

 - Marathon/Aurora – 服务调度器框架，可以在Mesos上运行长期服务。它能够保证某台机器发生故障时自动在其他机器上启动服务实例，还能够弹性扩展。它可以确保在其上运行的服务一直运行着。
 - Chronos – 可容错的作业调度器。替代cron，可以自动化配置循环作业。
 - Mesos-DNS – 基于域名服务的服务发现。当同时运行应用程序的多个副本时，必须能发现它们在哪里运行，并且能够连接它们。这在出现故障时尤为重要。

#### 4.4 开发framework

Mesos framework API：

 - **Mesos 消息** – 使用Protocol buffer来定义可跨平台和编程语言的消息格式。
 - **Scheduler API** – 负责管理框架所获得的资源。
 - **Scheduler Driver API** – 定义了调度器生命周期及其与Mesos交互的方法。它负责调用Scheduler的回调函数。
 - **Executor API** – 负责启动任务并执行Scheduler所分配的任务。每次只能执行一次回调，所以不能被阻塞。
 - **Executor Driver API** – 连接Executor和Mesos的接口。包含了Executor在生命周期各阶段的方法，以及向Mesos发送消息的方法。

### 总结

本文从以下几个方面简要介绍了Apache Mesos：

 - 背景
 - 什么是Mesos
 - Mesos是如何运作的
 - 如何使用Mesos


附件：[Apache Mesos](/res/pdf/Apache Mesos.pdf)
