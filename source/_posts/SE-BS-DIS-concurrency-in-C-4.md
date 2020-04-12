---
title: 基于线程的并发编程——读写锁
date: 2020-04-13
categories: 软件工程师系列
tags:
- C语言
- 并发编程
- Pthreads
keywords: C语言,并发编程,Pthreads,读写锁
description: 介绍Pthreads读写锁及其属性的API
---

# 概念

互斥量提供了同一时间内只有一个线程可以访问共享资源的机制，但它也存在弊端，那就是并发效率较低。如果大多数情况下，多个线程都是在读取这个共享资源而并非写入的话，仅仅是读取并不会带来一致性的问题，这样，强制让所有线程都互斥访问就显得有些多余。这时我们就可以使用第二种同步机制——**读写锁**。

# 状态

读写锁有3种状态，分别是，**读模式加锁**，**写模式加锁**和**解锁**。读写锁允许多个线程占有**读模式**下的锁，而仅允许一个线程一次占有一个**写模式**的锁。也就是说，如果有多个线程尝试以**读模式加锁**，那么它们都可以拿到锁，不会被阻塞。而当有一个线程尝试以**写模式加锁**的话，如果此时没有线程占有这个锁，那么它可以拿到锁，此时其他的线程不管是以读模式加锁还是以写模式加锁都会被阻塞；如果此时有线程占有这个锁，不管是读模式还是写模式的，那么试图加写模式锁的线程会被阻塞，直到这个锁被释放掉。同时，在锁被其他线程占有的情况下，如果某线程尝试加写模式的锁，那么后续其他线程再想加读模式的锁也会被阻塞，这样可以避免出现由于读模式的锁长期被占用，而导致写模式的锁一直得不到满足的情况。

读写锁的这种特性也被称之为“共享互斥锁”，也就是说，当读写锁以读模式锁住时，锁是共享的，大家都可以用；而当读写锁以写模式锁住时，锁是互斥的，一次只有一个线程可以使用。这种特性使其非常适用于对数据读的次数远大于写的情况，会比互斥量更加高效。

# 使用

在使用上，读写锁与互斥量类似，使用前都需要初始化，释放底层内存前必须销毁（顺序不要反了）：
```
int pthread_rwlock_init(pthread_rwlock_t *restrict rwlock,
                        const pthread_rwlockattr_t *restrict attr);
int pthread_rwlock_destroy(pthread_rwlock_t *rwlock);
```

锁定与解锁的方法也一目了然，相比互斥量，加锁提供了2种模式，分别是读模式和写模式：
```
int pthread_rwlock_rdlock(pthread_rwlock_t *rwlock); // 读模式加锁
int pthread_rwlock_wrlock(pthread_rwlock_t *rwlock); // 写模式加锁
int pthread_rwlock_unlock(pthread_rwlock_t *rwlock);
```

**[Single UNIX Specification]**

Single UNIX Specification 还额外提供了2种加锁的版本：
```
// 非阻塞式的加锁
int pthread_rwlock_tryrdlock(pthread_rwlock_t *rwlock); 
int pthread_rwlock_trywrlock(pthread_rwlock_t *rwlock);

// 带有超时的读写锁，第2个参数表示绝对时间
int pthread_rwlock_timedrdlock(pthread_rwlock_t *rwlock,
                               const struct timespec *restrict tsptr);
int pthread_rwlock_timedwrlock(pthread_rwlock_t *rwlock,
                               const struct timespec *restrict tsptr);
```

# 读写锁属性

和互斥量属性类似，读写锁也有自己的属性，使用`pthread_rwlockattr_t`定义，并且提供初始化和反初始化的方法：
```
int pthread_rwlockattr_init(pthread_rwlockattr_t *attr);
int pthread_rwlockattr_destroy(pthread_rwlockattr_t *attr);
```

不过POSIX对读写锁属性只定义了**进程共享**属性，和互斥量的进程共享属性是相同的。

读取和设置读写锁的进程共享属性的方法如下：
```
int pthread_rwlockattr_getpthread(const pthread_rwlockattr_t *restrict attr, int *restrict pshared);
int pthread_rwlockattr_setshared(pthread_rwlockattr_t *attr, int pshared);
```
