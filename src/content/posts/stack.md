---
title: 栈与队列
published: 2025-11-08
description: 栈与队列
tags: [算法]
category: 算法
draft: false
--- 
## 栈
- 栈的特点就是**先入后出**
---
### 定义
```cpp
stack<int> st;            // 默认底层容器是 deque<int>
stack<string> s2;
stack<int, vector<int>> s3;  // 指定底层容器（如 vector / list / deque）

```
---
### 手写栈
```cpp
struct stack
{
    vector<int> data;
    int t=0;
    bool empty()
    {
        return t==0;
    }
    void push(int x)
    {
        data.push_back(x);
        t++;
    }
    void pop()
    {
        if(!empty())
        {
            data.pop_back();
            t--;
        }
    }
    int top()
    {
        if(!empty())
        {
            return data[t-1];
        }
        return -1; // or throw an exception
    }
};
```
### 成员函数
---
```cpp
`push()`//入栈 O(1)
`pop()`//出栈 O(1)
`top()`//返回栈顶的元素引用 O(1)
`empty()`//判断栈是否为空 O(1)
```
---

### 括号匹配
```cpp
bool check(string s){
    stack<char> st;
    for (char c: s){
        if (c=='('||c=='['||c=='{') st.push(c);
        else {
            if (st.empty()) return false;
            char t=st.top(); st.pop();
            if ((c==')'&&t!='(')||(c==']'&&t!='[')||(c=='}'&&t!='{')) return false;
        }
    }
    return st.empty();
}
```
---
### 表达式求值（中缀转后缀）
```cpp
void solve() 
{
    string s, ts;
    cin >> s;
    stack<int> a;
for (int i = 0; i < s.length(); i++) 
{
    if (isdigit(s[i])) {
        ts += s[i];
    } else if (s[i] == '.') 
    {
        if (!ts.empty()) 
        {
            a.push(atoi(ts.c_str()));
            ts.clear();
        }
    }
    else if(s[i]=='+')
    {
        int x = a.top(); a.pop();
        int y = a.top(); a.pop();
        a.push(x + y);
    }
    else if(s[i]=='-')
    {
        int x = a.top(); a.pop();
        int y = a.top(); a.pop();
        a.push(y - x);
    }
    else if(s[i]=='*')
    {
        int x = a.top(); a.pop();
        int y = a.top(); a.pop();
        a.push(x * y);
    }
    else if(s[i]=='/')
    {
        int x = a.top(); a.pop();
        int y = a.top(); a.pop();
        a.push(y / x);
    }
    else if(s[i]=='@')
    {
        cout<<a.top()<<endl;
    }
}
}
```
---
## 队列
- 队列就是**先入先出**
---
### 实现
- 一般有链队列和循环队列
- 链队列实际上就是单项链表
- 循环队列是一种顺序表，用两个指针head和tail指向队头和队尾
    - 循环主要为了解决溢出问题
---
### 极简代码
```cpp
const int N=1e5;
int que[N],head,tail;
head++;//弹出队头
que[head];//读取队头数据
que[++tail] = data;//data入队
```
---

### stl的queue

| 方法           | 说明         | 时间复杂度 |
| ------------ | ---------- | ----- |
| `q.push(x)`  | 入队（放到队尾）   | O(1)  |
| `q.pop()`    | 出队（删除队首）   | O(1)  |
| `q.front()`  | 返回队首元素引用   | O(1)  |
| `q.back()`   | 返回队尾元素引用   | O(1)  |
| `q.empty()`  | 判空，返回 bool | O(1)  |
| `q.size()`   | 队列中元素个数    | O(1)  |
| `q.swap(q2)` | 与另一个队列交换内容 | O(1)  |
---
### 手写队列
```cpp
const int N = 1e5 + 10;
int q[N];
int head = 0, tail = 0;   // 队头队尾

bool empty() {
    return head == tail;
}

bool full() {
    return (tail + 1) % N == head;
}

void push(int x) {
    if (full()) return;       // 可自行处理溢出
    q[tail] = x;
    tail = (tail + 1) % N;
}

int front() {
    return q[head];
}

void pop() {
    if (!empty())
        head = (head + 1) % N;
}
```
---
### 双端队列和单调队列
- 双端队列
    - 能在两端进行插入和删除
- 单调队列（用双端实现）
    - 队列中的元素单调有序
    - 两端都能入队和出队
---
- 单调队列
```cpp
int q[N],head,tail; //单调队列记录最小值的位置，方便后面判断某元素是否已经离开窗口
...
head=1,tail=0; //清空队列
for(int i=1;i<=n;i++) //枚举窗口右端
{
  while(head<=tail && i-q[head]+1>k) q[head++]=0; //弹出已经离开窗口的元素
  while(head<=tail && a[q[tail]]>a[i]) q[tail--]=0; //从队尾踢掉之前所有不小于当前元素的数
  q[++tail]=i; //当前元素自己加入队尾
  if(i>=k) res[i-k+1]=q[head]; //完成以上操作后，队头即为最小值
}
```