---
title: 前缀和
published: 2025-11-04
description: 前缀和
tags: [算法]
category: 算法
draft: false
--- 
- 基本的代码
```cpp
  vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) {
        pre[i + 1] = pre[i] + o[i];
    }
```
- 主要是在O（1）用来算一段区间的和