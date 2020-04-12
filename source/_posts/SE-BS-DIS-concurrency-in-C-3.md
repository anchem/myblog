---
title: 基于线程的并发编程——互斥量
date: 2020-04-13
categories: 软件工程师系列
tags:
- C语言
- 并发编程
- Pthreads
keywords: C语言,并发编程,Pthreads,互斥量
description: 介绍Pthreads互斥量及其属性的API
---

# 概念

既然多个线程访问数据的时候会带来问题，那么我们可以控制在同一时间段内只能有一个线程访问这个数据，这样就不会出现数据不一致的情况了。Pthreads为我们提供了**互斥量（Mutex）**的方式来实现上述控制，它从本质上来说就是一把锁，当一个线程需要访问共享资源时，它可以对互斥量进行加锁，访问完毕后再释放锁。在互斥量被锁住期间，其他线程试图对该互斥量进行加锁的话就会被阻塞，直到这个线程释放了锁。如果有多个线程试图加锁，那么它们都会被阻塞，而解锁时，只有一个线程可以获得这个锁，其他线程仍然会处于阻塞的状态。所以，在这种方式下，每次只能有一个线程可以执行。

# 初始化

互斥量用`pthread_mutex_t`数据类型表示，在使用前需要初始化，有2种初始化的方式：

**1. 静态初始化**：将其设置为常量`PTHREAD_MUTEX_INITIALIZER`，变量类型为静态：
```    
static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
```
**2. 动态初始化**：调用函数进行初始化，由于是动态分配的内存，使用完毕后记得释放：
```
int pthread_mutex_init(pthread_mutex_t *restrict mutex, const pthread_mutexattr_t *restrict attr);
int pthread_mutex_destroy(pthread_mutex_t *mutex);
```

# 加锁

使用的方法有3种，包括阻塞式和非阻塞式：

最常用的就是在需要加锁的时候lock一下，释放锁的时候unlock一下就可以了。如果在lock的时候发现锁已经被其他线程占用，那么本线程就会阻塞直到锁被释放。
```
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

如果你不希望线程在尝试加锁时被阻塞（也就是说这时候有其他线程已经加锁了），那么可以使用以下方法来尝试加锁，如果互斥量没有被锁住，那么就可以拿到锁；如果被锁住了，那么就会加锁失败，但不会阻塞该线程。
```
int pthread_mutex_trylock(pthread_mutex_t *mutex);
```

如果你不希望线程在尝试加锁时一直被阻塞，而是等待一段时间后还没有获得锁的话就解除阻塞，那么可以使用`pthread_mutex_timedlock()`方法来尝试加锁：
```
int pthread_mutex_timedlock(pthread_mutex_t *mutex,
                            const struct timespec *restrict tsptr);
```
其中，第二个参数指明了愿意**等待到**什么时候，这是一个绝对时间而不是相对时间。也就是说，线程如果没获得锁的话，最多只会阻塞到一个确定的时间点，比如2020年3月10日22:00:00，当时间超过了这个时间点，就会解除阻塞；而不是说，线程会等待个比如10秒，10秒之后就不等了。

以上就是Pthreads提供的互斥机制。当然，只有我们将所有线程都设计成遵守相同数据访问规则时，互斥机制才能正常工作。如果允许某个线程在没有得到锁的情况下也可以访问共享资源，那么即便其他线程都申请了锁，也还是会出现不一致的问题。

# 避免死锁

试想这么一种情况，线程在拿到了互斥锁A之后，试图再次对A进行加锁，由于A被锁住了，线程只能等待这个锁被释放，但是这个锁又是自己占有的，所以自己就会被自己阻塞在这里。（非递归互斥量）

再考虑这么一种情况，有2个线程，2个互斥量，线程1锁住了互斥量A，线程2锁住了互斥量B，此时线程1试图对B进行加锁，而由于线程2占有了该锁，它只能阻塞；而此时线程2又试图对A进行加锁，同样的，线程1占有A，线程2也只能阻塞。

这些情况被称之为**死锁**，它会导致程序无法响应也无法恢复，所以需要我们谨慎地使用互斥量以避免死锁的发生。

一种避免死锁的方法是控制对多个互斥量加锁的顺序，保证所有线程都使用相同的顺序进行加锁。比如有2个互斥量A和B，所有线程都总是先尝试对A进行加锁，然后再尝试对B加锁，而不会以相反的方向操作的话，那么使用这2个互斥量就不会出现死锁的情况。

在复杂的程序结构里，有时很难梳理清楚对互斥量加锁的排序，在这种情况下，可以使用`pthread_mutex_trylock()`或者`pthread_mutex_timedlock()`这种非阻塞式的方法来避免死锁的发生。

# 互斥量属性

在调用`pthread_mutex_init()`函数对互斥量初始化的时候，可以指定其属性，用`pthread_mutexattr_t`来表示。

互斥量属性的使用和线程属性的使用类似，都需要初始化和反初始化：
```
int pthread_mutexattr_init(pthread_mutexattr_t *attr);
int pthread_mutexattr_destroy(pthread_mutexattr_t *attr);
```

在其属性值里，值得注意的有3个属性，分别是**进程共享属性**、**健壮属性**和**类型属性**。

## 进程共享属性

**进程共享属性**是一个可选属性，并不是所有系统都支持这个属性，可以通过检查`_POSIX_THREAD_PROCESS_SHARED`符号来判断是否支持。如果互斥量是线程间共享的，也就是只能在一个进程里使用的，那么它就是`PTHREAD_PROCESS_PRIVATE`的；如果互斥量允许多个进程间共享，那么它就是`THREAD_PROCESS_SHARED`的。

```
int pthread_mutexattr_getshared(const pthread_mutexattr_t *restrict attr, int *restrict pshared);
int pthread_mutexattr_setshared(pthread_mutexattr_t *attr, int pshared);
```

## 健壮属性

互斥量的**健壮属性**与在多个进程间共享的互斥量有关。当持有互斥量的进程终止时，如果互斥量处于锁定的状态，那么其他阻塞在这个锁的进程就会一直阻塞下去，而健壮属性就是为了解决互斥量状态恢复的问题。

```
int pthread_mutexattr_getrobust(const pthread_mutexattr_t *restrict attr, int *restrict robust);
int pthread_mutexattr_setrobust(pthread_mutexattr_t *attr, int robust);
```

其中，`robust`的取值有2种：

- `PTHREAD_MUTEX_STALLED`是默认值，意味着持有互斥量的进程终止时不采取任何动作，使用互斥量之后的行为是未定义的，此时，如果有其他进程等待这个互斥量，就很有可能会被阻塞住；
- 另一个取值是`PTHREAD_MUTEX_ROBUST`，如果持有互斥量的进程异常终止没有释放锁，那么下一个进程在调用`pthread_mutex_lock()`获得该锁后会得到一个非0的返回值`EOWNERDEAD`，在这种情况下，往往需要对其进行恢复才可以继续使用，否则该互斥量将处于永久不可用状态，除非对其调用`pthread_mutex_destroy()`。

那么，当发现互斥量需要恢复时，往往需要调用`pthread_mutex_consistent()`函数来恢复互斥量的状态，并在这之后再使用`pthread_mutex_unlock()`函数释放该锁，否则这个锁将永远不可用，其他线程再使用`pthread_mutex_lock()`试图获取该锁时会得到`ENOTRECOVERABLE`返回码，意味着该互斥量已不可用也无法恢复了。

```
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include <errno.h>

static pthread_mutex_t mtx;
static void *original_owner_thread(void *ptr)
{
   printf("[original owner] Setting lock...\n");
   pthread_mutex_lock(&mtx);
   printf("[original owner] Locked. Now exiting without unlocking.\n");
   pthread_exit(NULL);  // 线程退出而没有释放互斥量
}
int main(int argc, char *argv[])
{
   pthread_t thr;
   pthread_mutexattr_t attr;
   int s;

   pthread_mutexattr_init(&attr);  // 初始化互斥量属性
   pthread_mutexattr_setrobust(&attr, PTHREAD_MUTEX_ROBUST);  // 设置健壮属性
   pthread_mutex_init(&mtx, &attr);   // 使用互斥量属性初始化互斥量
   pthread_create(&thr, NULL, original_owner_thread, NULL);
   sleep(2);  // 等待2秒是为了确保创建的线程已经退出
   printf("[main thread] Attempting to lock the robust mutex.\n");
   s = pthread_mutex_lock(&mtx);
   if (s == EOWNERDEAD) {  // 意味着上一个占有该互斥量的线程异常退出且未释放
        printf("[main thread] pthread_mutex_lock() returned EOWNERDEAD\n");
        printf("[main thread] Now make the mutex consistent\n");
        s = pthread_mutex_consistent(&mtx);  // 此时需要调用该方法进行恢复
        if (s != 0) {
            printf("pthread_mutex_consistent");
            exit(EXIT_FAILURE);
        }
        printf("[main thread] Mutex is now consistent; unlocking\n");
        s = pthread_mutex_unlock(&mtx);  // 恢复成功后再释放该锁，之后互斥量仍然可以继续使用
        if (s != 0) {
            exit(EXIT_SUCCESS);
        }
   } else if (s == 0) {
        printf("[main thread] pthread_mutex_lock() unexpectedly succeeded\n");
        pthread_mutex_unlock(&mtx);
        exit(EXIT_FAILURE);
   } else {
        printf("[main thread] pthread_mutex_lock() unexpectedly failed\n");
        exit(EXIT_FAILURE);
   }
}

```
【程序输出】
```
[original owner] Setting lock...
[original owner] Locked. Now exiting without unlocking.
[main thread] Attempting to lock the robust mutex.
[main thread] pthread_mutex_lock() returned EOWNERDEAD
[main thread] Now make the mutex consistent
[main thread] Mutex is now consistent; unlocking
```

## 类型属性

**类型属性**控制着互斥量的锁定特性，POSIX定义了4种类型：

1. **PTHREAD_MUTEX_NORMAL** - 标准互斥量类型，不做任何特殊的错误检查和死锁检测。
2. **PTHREAD_MUTEX_ERRORCHECK** - 错误检查互斥量。
3. **PTHREAD_MUTEX_RECURSIVE** - 递归互斥量。此类互斥量允许同一线程在互斥量解锁之前对该互斥量进行多次加锁，这也意味着，解锁次数如果不等于加锁次数，那么这个锁会一直处于锁定状态。
4. **PTHREAD_MUTEX_DEFAULT** - 默认互斥量类型。不同的操作系统在实现时可能会把它映射到上述不同的互斥量类型中。

下表显示了这4种类型的锁在不同使用场景下的行为：

| 互斥量类型 | 未解锁时重新加锁 | 未占用时解锁 | 已解锁时再解锁 |
|----|:----:|:----:|:----:|
|PTHREAD_MUTEX_NORMAL| 死锁 | 未定义 | 未定义 |
|PTHREAD_MUTEX_ERRORCHECK| 返回错误 | 返回错误 | 返回错误 |
|PTHREAD_MUTEX_RECURSIVE| 允许 | 返回错误 | 返回错误 |
|PTHREAD_MUTEX_DEFAULT| 未定义 | 未定义 | 未定义 |

获取和修改类型属性的方法如下：
```
int pthread_mutexattr_gettype(const pthread_mutexattr_t *restrict attr, int *restrict type);
int pthread_mutexattr_settype(pthread_mutexattr_t *attr, int type);
```

在这4种类型中，`PTHREAD_MUTEX_RECURSIVE`递归互斥量的使用要特别注意。互斥量常常用来保护与条件变量有关的条件，在阻塞线程之前，`pthread_cond_wait()`函数会先释放互斥量，这就允许其他线程触发条件（过程：获取互斥量->改变条件->给条件变量发信号->释放互斥量），如果此时使用了递归互斥量且它被多次加锁，那么在调用`pthread_cond_wait()`函数后，互斥量并不能被真正解锁，这就导致条件永远都得不到满足。
