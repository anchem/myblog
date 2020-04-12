---
title: 基于线程的并发编程——屏障
date: 2020-04-13
categories: 软件工程师系列
tags:
- C语言
- 并发编程
- Pthreads
keywords: C语言,并发编程,Pthreads,屏障
description: 介绍Pthreads屏障及其属性的API
---

# 概念

屏障是协调多线程并行工作的一种同步机制，屏障允许每个线程等待，直到所有线程都达到某个特定的点，然后再从该点继续执行。我们之前介绍的`pthread_join()`就是一种屏障，但我们现在介绍的屏障更强大一些，它允许任意数量的线程等待，直到所有线程都达到该屏障后继续工作，不需要退出。

# 使用

屏障使用`pthread_barrier_t`类型表示，可以使用以下方式初始化与销毁：
```
int pthread_barrier_init(pthread_barrier_t *restrict barrier
                         const pthread_barrierattr_t *restrict attr,
                         unsigned int count);
int pthread_barrier_destroy(pthread_barrier_t *barrier);
```

初始化屏障时，可以用`count`参数指定必须到达屏障的线程数量，也就是说，只有到达该屏障的线程数量达到这个值了之后，才允许它们继续执行。

对应的，可以使用以下方法设定屏障的点：
```
int pthread_barrier_wait(pthread_barrier_t *barrier);
```
当线程调用该函数时，会对屏障计数+1，如果此时未满足之前设定的`count`条件，那么线程会进入休眠状态；如果线程是最后一个调用该函数的线程，满足了屏障的计数，那么所有线程都会被唤醒。对于任意一个线程，该函数可能会返回`PTHREAD_BARRIER_SERIAL_THREAD`，同时其他线程看到的返回值就都是0，这种机制允许使一个线程作为主线程，它可以工作在其他所有线程已经完成的工作结果上。

当屏障计数值达到，并且所有线程解除阻塞后，屏障就可以继续被使用了。

# 屏障属性

和其他同步对象属性一样，屏障也有属性。初始化和去初始化的方法如下：
```
int pthread_barrierattr_init(pthread_barrierattr_t *attr);
int pthread_barrierattr_destroy(pthread_barrierattr_t *attr);
```

屏障只有**进程共享属性**，含义和互斥量是一样的，此处不再赘述。
```
int pthread_barrierattr_getpshared(const pthread_ barrierattr_t *restrict attr, int *restrict pshared);
int pthread_barrierattr_setpshared(pthread_barrierattr_t *attr, int pshared);
```
