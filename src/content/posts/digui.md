---
title: 递归，分治
published: 2025-11-05
description: 递归，分治
tags: [算法]
category: 算法
draft: false
--- 
## 递归
- 递归其实很好理解，类比于数学数列的递推，或者说数学归纳法
- 用编程语言来说就是函数不断地调用自身
- 递归的核心思想就是把原问题分解成重复的子问题，也就是分治
- 例如，计算阶乘：
```cpp
int fact(int n) {
    if (n == 1) return 1;   // 递归出口
    return n * fact(n - 1); // 递归调用
}
```
---
## 为什么用递归？
- 逻辑简洁，**可读性强**；
- 适合表达 **分治思想**；
- 在树、图、排序、搜索等问题中，递归往往比迭代更自然。

但要注意：递归深度过大会带来栈空间问题，因此有时需要改写为循环或手动栈。
## 分析递归
- 画递归搜索树
---
## 分治
- 上面也说了，分治思想就是把原问题分解成重复的子问题
- 分治的三个步骤：
1. **分解**：把原问题拆分成规模更小但性质相同的子问题
2. **解决**：递归求解这些子问题
3. **合并**：将子问题的结果合并成最终解
---
- 注意，分治是思维方式，递归是实现方法，分治很大程度都是基于递归的
- 几乎所有分治算法（如归并排序、快排、二分查找）都可以用递归来实现。
- 下面是一些常见排序的实现
---
## 冒泡排序
---
```cpp
void bubble(vector<int>& arr, int n) {
    if (n == 1) return; // 递归出口
    
    for (int i = 0; i < n - 1; i++) { // 每轮冒泡
        if (arr[i] > arr[i + 1]) {
            swap(arr[i], arr[i + 1]);
        }
    }
    // 最大元素已在末尾，对前 n-1 个元素递归
    bubble(arr, n - 1);
}

```
## 选择排序
---
```cpp
void check(vector<int>& arr, int n) {
    if (n == 1) return; 

    int max = 0;
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[max]) {
            max = i;
        }
    }
    // 把最大值放到末尾
    swap(arr[max], arr[n - 1]);
    check(arr, n - 1);
}

```
### 优化
---
- 其实可以把最大最小同时选出来放在两边
```cpp
void selection(vector<int>& arr, int left,int right) {
    if (right-left == 1||right-left == 0 )return; 
    int max 0 ;int min = 0;
    int left = 0;int right = size(arr) - 1;
    for (int i = left; i <= right; i++) {
        if (arr[i] > arr[max]) 
            max = i;
         if (arr[i] < arr[min]) 
            min = i;
        
    }
    // 先把最大值放到右端
    swap(arr[max], arr[right]);

    // 注意：如果最大值原来在左边，而被换到右边，
    // min 的位置可能被影响，因此要修正
    if (min == right) min = max;

    // 再把最小值放到左端
    swap(arr[min], arr[left]);
    selection(arr, left + 1,right - 1);
}
```
## 插入排序
---
```cpp
void insert(vector<int>& arr, int n, int i = 1) {
    if (i == n) return; // 递归出口：所有元素都已插入

    int key = arr[i];
    int pos = binary_search(arr, 0, i, key); //用二分搜索会更快

    // 把 [pos, i-1] 后移一位
    for (int j = i; j > pos; j--)
        arr[j] = arr[j - 1];
    arr[pos] = key;

    insert(arr, n, i + 1); // 递归处理下一个元素
}
int binary_search(const vector<int>& arr, int left, int right, int key) {
    if (left >= right) 
        return left; // 插入位置

    int mid = (left + right) / 2;

    if (key < arr[mid]) 
        return binary_search(arr, left, mid, key);
    else if (key > arr[mid])
        return binary_search(arr, mid + 1, right, key);
    else 
        return mid; // 找到了相同值
}

```
## 快速排序
---
```cpp
void quicksort(vector<int>& arr, int left, int right) {
    if (left >= right) return; // 递归出口

    int i = left, j = right, pivot = arr[left]; // 选取基准

    while (i < j) {
        while (i < j && arr[j] >= pivot) j--; // 从右找比基准小的
        while (i < j && arr[i] <= pivot) i++; // 从左找比基准大的
        if (i < j) swap(arr[i], arr[j]); // 交换左右
    }

    swap(arr[left], arr[i]); // 把基准放到正确位置

    quicksort(arr, left, i - 1); // 递归处理左区间
    quicksort(arr, i + 1, right); // 递归处理右区间
}
```

---