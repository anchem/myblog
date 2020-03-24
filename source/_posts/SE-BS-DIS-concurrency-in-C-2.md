---
title: 基于线程的并发编程——线程管理
date: 2020-03-24 23:53:06
categories: 软件工程师系列
tags:
- C语言
- 并发编程
- Pthreads
keywords: C语言,并发编程,Pthreads,线程管理
description: 介绍Pthreads线程管理类的API，包括创建、销毁、取消、结合、分离线程与设置和查询线程属性等方法。
---

Pthreads线程管理类的API提供了创建、销毁、取消、结合、分离线程与设置和查询线程属性等方法。

# 1. 线程标识

在Pthreads里，数据类型`pthread_t`用来标识一个线程，你也可以称之为线程ID，或者线程句柄。出于移植的目的，你不能把它当做整数处理，因为不同的操作系统的实现是不一样的。

你可以在线程函数内获取线程自身的ID，通过以下方法
```
pthread_t pthread_self(void);
// 返回线程ID
```

当你需要比较2个线程的时候，可以使用以下方法
```
int pthread_equal(pthread_t, pthread_t);
// 若相等，返回非0数值；否则返回0
```

# 2. 创建线程

当你的程序从`main()`函数启动时，它本身就是一个线程，我们姑且把它称作**主线程**，之后如果你需要创建线程，都需要手工创建和管理。也就是说，从`main()`创建的主线程是唯一一个不用我们太操心的线程。

**`pthread_create(thread,attr,start_routine,arg)`**提供了创建线程的方法。
**[参数]**

- thread（pthread_t*） - 是一个指针类型的出参，指向新创建线程的ID；
- attr（pthread_attr_t*） - 设置新线程的一些属性，如果传空就使用默认的；
- start_routine（void*()(void*)） - 新线程要执行的函数；
- arg（void*） - 所要执行函数的入参，是一个任意指针类型，惯用法是在start_routine内部对入参进行类型转换从而得到想要的数据。如果你有多个参数的话，那就封装成一个结构体，把它的指针传进去就好了。

**[返回值]**该函数返回0就表示创建成功了，否则会返回一个错误码（这种情况下，出参指向的内容可能是未定义的，要谨慎使用）。

**[调度]**线程创建了之后，会处于可执行的状态，之后就会被操作系统调度了；这也意味着，你无法控制这个线程具体什么时间会真正跑起来，也无法知晓这个语句执行之后，下一个被调度的线程时主线程还是新线程。

**[限制]**每个进程可以创建多少个线程是有限制的，这个限制和具体的操作系统实现有关。
其中，操作系统限制的创建的最大线程数可以通过如下命令查看`cat /proc/sys/kernel/threads-max`。

但它只是提供了一个逻辑天花板，实际物理天花板在于虚拟内存和线程栈大小之间的关系，也就是`virtual memory / stack size`，其中virtual memory可以通过`ulimit -v`来查看，stack size可以通过`ulimit -s`查看。

同时，由于线程是运行在进程里的，它也会受到系统允许的最大进程数的影响，可以通过`ulimit -u`查看。
而对于具体线程的限制，可以通过`cat /proc/${pid}/limits`命令查看。如果需要修改生效的话，需要确保进程在生效后启动才可以。

# 3. 线程属性

Pthreads接口允许我们通过设置每个对象关联的不同属性来细调线程（和同步对象）的行为。管理这些属性的函数都遵循**相同**的模式：

1. 每个对象与它自己类型的**属性对象**进行关联。比如线程与线程属性关联，互斥量与互斥量属性关联等。
2. 一个属性对象可以代表多个属性。比如你要设置线程的多个属性，只用定义一个属性对象就可以了。
3. 属性对象对应用程序来说是**不透明**的。不透明意味着你无需知道属性对象内部结构的细节，只需要使用相应的函数来管理就可以了。这样可以增强程序的可移植性。
4. 使用**初始化函数**将属性设置为默认值。当然，也可以使用静态变量设置。
5. 如果使用初始化函数分配了与属性对象关联的资源，那么使用完毕后，要使用**销毁函数**来释放这些资源。
6. 每个属性都有一个从属性对象中**获取属性值**的函数。成功返回0，否则返回错误编号。
7. 每个属性都有一个**设置属性值**的函数。

比如，对于线程属性来说，我们可以这样进行设置，使用举例如下：
```
pthread_attr_t attr; // 定义一个线程属性对象
pthread_attr_init(&attr); // 使用初始化函数设置默认值
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE); // 设置一个属性值，此处设置其结合分离属性
// ......
pthread_attr_getdetachstate(&attr, &detachState); // 获取一个属性值，此处获取其结合分离属性，并将其保存在detachState里
// ......
pthread_attr_destroy(&attr); // 最后使用销毁函数释放资源
```
有以下几个属性值得我们关注一下：

## 3.1. 结合与分离

结合与分离提供了一种线程间同步的机制。

在默认情况下，线程是**可结合的（JOINABLE）**，意味着线程能够被其他线程回收或者kill掉，比如主线程可以调用`pthread_join()`方法等待其创建的某个指定的子线程执行完毕后再继续执行，同时也能得到子线程的退出状态（若想等待任意一个子线程，则需要`pthread_wait`方法）。与之相对的就是**分离的（DETATCHED）**，分离的线程不能被其他线程回收或者kill，它是相对自由独立的，自己跑完就完事儿了，不用给它擦屁股。

对于线程占用的资源，可结合的线程的资源在被其他线程回收或kill之前是不会释放的（等着擦屁股呢），如果创建了可结合的线程却没有回收它，则很可能带来内存泄露的问题；而分离的线程的资源在它终止的时候会被系统自动释放。当然，如果进程被干掉了或者主线程结束了，不管哪种类型的线程都会被中止掉并释放资源。基于这个原因，如果没有必须等待线程回收的理由，建议使用分离的线程。

设置线程结合分离可以通过2种方式：

1. 在创建线程时，通过设置线程属性的函数`pthread_attr_setdetachstate(pthread_attr_t *attr, int detachState)`来设置，`attr`是属性对象，`detachState`是要设置的值。若为`PTHREAD_CREATE_DETACHED`，则将其设置为可分离的；`PTHREAD_CREATE_JOINABLE`则设置为可结合的；
2. 在线程函数里，通过`pthread_detach(pthread_self())`函数来将其设置为分离的。一旦线程被设置为分离的之后，就无法再设置为可结合的了噢。

获取线程结合分离的属性可以通过以下方法：
```
pthread_attr_getdetachstate(const pthread_attr_t *attr, int *detachState)
```
其中，`attr`是线程属性对象，`detachState`保存了当前是结合或分离的状态值。

## 3.2. 线程栈大小

每个线程都有自己的栈，POSIX规范并没有规定这个栈的大小应该是多少，这个和具体的机器实现有关。如果线程内的函数调用超过了栈空间上限，则很容易引发程序中止或者数据损坏。作为有修养的程序（安全且可移植的），常常会显式地指定栈空间大小以避免此类问题的发生。同时，Pthreads还允许程序指定线程栈在内存中存放的具体区域。

我们可以使用以下一对方法在属性中设置和获取线程的栈空间大小：
```
pthread_attr_getstacksize(attr, stacksize)
pthread_attr_setstacksize(attr, stacksize)
```
我们也可以使用以下方法在属性中设置和获取线程栈空间的地址区域：
```
pthread_attr_getstackaddr(attr, stackaddr)
pthread_attr_setstackaddr(attr, stackaddr)
```

## 3.3. 其他属性

除此之外，线程属性还支持设置线程的**调度策略**、**优先级**以及优先级的**有效范围**。本次暂时先不讨论，以后用到了再说。

# 4. 结束线程

有始就有终，线程的结束有4种方式。

- 当顶层的线程函数返回时，线程会**隐式**地终止；
- 当线程函数内通过调用`pthread_exit(void *)`函数时，线程会**显式**地终止，返回值为该方法的参数，其他线程可以通过`pthread_join(pthread_t, void**)`方法的第二个参数访问到返回值的指针。如果主线程调用了该方法，它会等待所有其他线程终止后，再结束主线程和整个进程；
- 某个线程调用了Linux的`exit()`函数，该函数会终止进程以及所有与该进程相关的线程；
- 线程可以被同一进程中的其他线程通过`pthread_cancel(pthread_t)`方法**取消**掉。当然这由线程的**状态**和**类型**决定，当线程通过`pthread_setcancelstate()`方法设置其状态为`PTHREAD_CANCEL_ENABLE`时，才能够响应取消，否则取消响应直到线程改变其状态后才能发生。同时，线程有2种取消类型，可以通过`pthread_setcanceltype()`方法设置，默认的是延迟取消`PTHREAD_CANCEL_DEFERRED`，意思是说当取消请求发来时，线程会继续运行直到执行到某个**取消点**，几乎所有使线程挂起的库都是取消点，比如sleep、delay函数；另一种取消类型是异步取消`PTHREAD_CANCEL_ASYNCHRONOUS`，意思是指线程可以在任意时刻被取消掉（通常是这样，但系统并不能完全保证）。

## 4.1. 清理程序

根据POSIX标准，Pthreads还提供了线程清理处理程序，它们需要成对使用，分别是
```
void pthread_cleanup_push(void (*rtn)(void *), void *arg);
void pthread_cleanup_pop(int execute);
```
从名字上也可以看出来，实际上每个线程都有一个清理处理的栈，`pthread_cleanup_push`函数向这个栈里塞入一条清理函数`rtn`，入参是`arg`，而`pthread_cleanup_pop`函数在线程结束时从栈顶弹出一个清理函数并进行处理。由于POSIX允许具体实现可以使用宏的方式，所以一定要在与线程相同的作用域里成对匹配使用，否则可能导致编译错误。

通过`pthread_cleanup_pop`函数执行的清理函数会在以下任意3种情况发生的时候执行：

- 线程调用`pthread_exit()`时；
- 线程响应取消时，在取消点会执行；
- 传入`pthread_cleanup_pop`函数的参数为非0数值时；

如果入参为0，它会删除上一次通过调用`pthread_cleanup_push`建立的清理处理函数而并不会调用清理函数。

需要注意的是，如果线程是通过`return`语句结束返回的话，那么清理函数是不会被调用的。

## 4.2. 内存问题

不管是`pthread_create`还是`pthread_exit`函数，其都能够通过无类型的指针参数传递值，我们格外要注意这个指针指向的内存在调用者完成调用之后必须仍然是有效的。比如，在调用者线程的栈上分配了该内存，其他线程在使用这个内存的时候，其内容可能已经发生了变化；又或者，线程在自己的栈上分配了一块内存，然后把它的指针通过`pthread_exit`函数带了出去，那么其他线程通过`pthread_join`方法试图使用这块内存的时候，其可能已经被撤销或另作他用了。为了解决这个问题，建议使用全局变量或者通过`malloc`函数分配内存。

# 5. 使用示例

```
#include <stdio.h>
#include <pthread.h>

struct Data{
    int id;
    char *msg;
};

void cleanup(void *arg) { // 清理函数
    printf("clean up: %s\n", (char*)arg);
}

void *threadFunc1(void *arg) {
    printf("thread 1 start\n");
    pthread_cleanup_push(cleanup, "thread 1, 1st cleanup");
    pthread_cleanup_push(cleanup, "thread 1, 2nd cleanup"); // 设置清理函数栈
    int data = (int) arg;
    printf("thread 1 get data : %d\n", data);
    pthread_cleanup_pop(1);
    pthread_cleanup_pop(1); // 执行清理函数，与设置的顺序相反
    return ((void*)1);
}

void *threadFunc2(void *arg) {
    printf("thread 2 start\n");
    pthread_cleanup_push(cleanup, "thread 2, 1st cleanup");
    pthread_cleanup_push(cleanup, "thread 2, 2nd cleanup");
    pthread_cleanup_push(cleanup, "thread 2, 3rd cleanup");
    struct Data *data = (struct Data*)arg; // 函数入参转换
    printf("thread 2 get data with id:%d, msg:%s\n", data->id, data->msg);
    pthread_cleanup_pop(1);
    pthread_cleanup_pop(0); // 删除位于清理函数栈顶的函数，这样"2nd"的清理函数就不会被执行了
    pthread_cleanup_pop(1);
    pthread_exit((void*)2);
}

int main() {
    int error;
    pthread_t pid1, pid2;
    pthread_attr_t pAttr;
    int data1 = 1;
    struct Data data2;
    void *ret;

    pthread_attr_init(&pAttr); // 初始化线程属性
    pthread_attr_setdetachstate(&pAttr, PTHREAD_CREATE_JOINABLE); // 设置一个线程属性值

    error = pthread_create(&pid1, NULL, threadFunc1, (void*)data1); // 创建一个线程，使用默认属性
    if (error != 0) {
        printf("can not create thread 1");
        exit(1);
    }
    data2.id = 2;
    data2.msg = "thread 2 data";
    error = pthread_create(&pid2, &pAttr, threadFunc2, (void*)&data2); // 创建一个线程，使用自定义的属性，可以将自定义结构体的指针作为参数传入
    if (error != 0) {
        printf("can not create thread 2");
        exit(1);
    }

    error = pthread_join(pid1, &ret); // 等待一个线程返回，并获取其返回值
    if (error != 0) {
        printf("can not join with thread 1");
        exit(1);
    }
    printf("thread 1 join with ret : %ld\n", (long)ret);

    error = pthread_join(pid2, &ret);
    if (error != 0) {
        printf("can not join with thread 2");
        exit(1);
    }
    printf("thread 2 join with ret : %ld\n", (long)ret);
    pthread_attr_destroy(&pAttr); // 销毁线程属性，释放资源
    exit(0);
}
```

**【程序输出】**
```
thread 1 start
thread 1 get data : 1
clean up: thread 1, 2nd cleanup
clean up: thread 1, 1st cleanup
thread 2 start
thread 2 get data with id:2, msg:thread 2 data
clean up: thread 2, 3rd cleanup
clean up: thread 2, 1st cleanup
thread 1 join with ret : 1
thread 2 join with ret : 2
```
也有可能是这样的：
```
thread 1 start
thread 1 get data : 1
clean up: thread 1, 2nd cleanup
thread 2 start
thread 2 get data with id:2, msg:thread 2 data
clean up: thread 2, 3rd cleanup
clean up: thread 2, 1st cleanup
clean up: thread 1, 1st cleanup
thread 1 join with ret : 1
thread 2 join with ret : 2
```
或者这样的：
```
thread 1 start
thread 2 start
thread 2 get data with id:2, msg:thread 2 data
clean up: thread 2, 3rd cleanup
clean up: thread 2, 1st cleanup
thread 1 get data : 1
clean up: thread 1, 2nd cleanup
clean up: thread 1, 1st cleanup
thread 1 join with ret : 1
thread 2 join with ret : 2
```
