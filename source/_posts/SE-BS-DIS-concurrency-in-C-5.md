---
title: 基于线程的并发编程——条件变量
date: 2020-04-13
categories: 软件工程师系列
tags:
- C语言
- 并发编程
- Pthreads
keywords: C语言,并发编程,Pthreads,条件变量
description: 介绍Pthreads条件变量及其属性的API
---

# 概念

试想这么一种场景，比如我设置了一个全局变量，由一个特定的线程对其进行修改，我希望当这个变量达到某个特定的值了，再让其他线程做某件事情。如果使用以上介绍的互斥量和读写锁，是可以实现的，但是线程需要不停地查询这个全局变量的值，直到发现它达到特定条件了，才能继续执行，这种方式会消耗更多的资源，比较低效。

这个时候，就需要**条件变量**出场了。条件变量和互斥量的不同在于，互斥量（包括读写锁）只能控制能否访问共享数据，而条件变量允许根据共享数据的特定的值来协调线程的同步。当你的程序需要一个特定的同步条件时，就应该创建一个条件变量，如果有多个同步条件，那就创建多个。同时，条件变量**一定**是要和互斥量一起使用的，因为它们都是对共享数据的控制，一个控制访问权，一个控制条件。

# 使用

条件变量使用`pthread_cond_t`数据类型表示，可以使用静态的`PTHREAD_COND_INITIALIZER`给其赋值，也可以使用动态分配的方式，也就是init和destroy：
```
int pthread_cond_init(pthread_cond_t *restrict cond,
                      const pthread_condattr_t *restrict attr);
int pthread_cond_destroy(pthread_cond_t *cond);
```

对于等待特定条件的线程来说，它们需要以下方法：
```
int pthread_cond_wait(pthread_cond_t *restrict cond,
                      pthread_mutex_t *restrict mutex);
int pthread_cond_timedwait(pthread_cond_t *restrict cond,
                      pthread_mutex_t *restrict mutex,
                      const struct timespec *restrict tsptr);
```
首先，线程需要使用`pthread_mutex_lock()`**锁住**互斥量，然后将其传递给`pthread_cond_wait()`，该互斥量的作用是对条件进行保护。`pthread_cond_wait()`函数会自动把调用它的线程放到等待条件的线程列表上，然后对互斥量**解锁**。此时线程就会处于阻塞状态，等待特定条件的发生。当条件满足时，`pthread_cond_wait()`就会返回，此时该线程重新获得互斥量的锁，并解除阻塞继续执行。类似的，`pthread_cond_timedwait()`函数允许指定线程等待多长时间，时间仍然是一个绝对时间。

需要注意的是，当线程从以上2种wait方法成功返回时，都需要重新计算条件，因为其他线程可能已经在运行并改变了这个条件。

那等待条件的线程什么时候才能被唤醒呢？这就需要以下2个函数了，它们用于给线程发信号，告诉它们：“条件已经满足了”：
```
int pthread_cond_signal(pthread_cond_t *cond);
int pthread_cond_broadcast(pthread_cond_t *cond);
```
其中，`pthread_cond_signal()`可以唤醒至少一个等待条件的线程列表上的一个线程，而`pthread_cond_broadcast()`能唤醒所有等待该条件的线程。

同样需要注意的时，在给线程发信号前，一定确保要在改变条件状态之后再发。

# 条件变量属性

Single UNIX Specification定义了条件变量的2个属性，分别是**进程共享属性**和**时钟属性**。和其他属性对象一样，有一对函数用来初始化和反初始化条件变量属性：
```
int pthread_condattr_init(pthread_condattr_t *attr);
int pthread_condattr_destroy(pthread_condattr_t *attr);
```

**进程共享属性**控制着条件变量可以被单进程使用，还是多进程的线程使用。
```
int pthread_condattr_getshared(const pthread_condattr_t *restrict attr, int *restrict pshared);
int pthread_condattr_setshared(pthread_condattr_t *attr, int pshared);
```

**时钟属性**控制计算`pthread_cond_timewait()`函数的超时参数（`tsptr`）时采用的是哪个时钟。可选值包括`CLOCK_REALTIME`（实时系统时间）、`CLOCK_MONOTONIC`（不带负跳数的实时系统时间）、`CLOCK_PROCESS_CPUTIME_ID`（调用进程的CPU时间）、`CLOCK_THREAD_CPUTIME_ID`（调用线程的CPU时间）。
```
int pthread_condattr_getclock(const pthread_condattr_t *restrict attr, clockid_t *restrict clock_id);
int pthread_condattr_setclock(pthread_condattr_t *attr, clockid_t clock_id);
```

