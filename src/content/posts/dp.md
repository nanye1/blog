---
title: 动态规划
published: 2026-03-03
description: 简单的dp
tags: [算法]
category: 算法
draft: false
--- 
## dp中的概念
- **阶段** 把原问题分割成若干个子问题
- **状态** 每个阶段面临的状况
- **决策** 不同阶段之间转移的选取
- **子问题重叠性** 子问题会被反复计算多次，因此递推保存在数组中
- **无后效性** 现在的子问题不受后面子问题的影响
- **最优子结构** 下一个阶段的最优解能够由前面各阶段子问题的最优解推出
---
## 线性dp
- 一般来说都是和序列相关，是一个一维的状态
- 一般来说`f[i]`都表示以`i`为结尾的状态
### 最长上升子序列
- B3637
- 给出一个由 n(n≤5000) 个不超过10e6的正整数组成的序列。请输出这个序列的最长上升子序列的长度。 
- 阶段：以第i个数结尾
- 状态：以i结尾最长的上升子序列为`f[i]`
- 决策：如果前`i - 1`个数没有比i小的，`f[i] = 1`,否则`f[i] = max(f[j]) + 1` (这里的j在i的前面，且满足`a[i] < a[j]`)
- 答案：`max(f[i])`
```cpp
vector<int> a(n + 1);
    for(int i = 1; i <= n; i++) cin >> a[i];
    vector<int> f(n + 1, -inf);
    for(int i = 1; i <= n; i++) f[i] = 1;
    for(int i = 1;i <= n; i++)
    {
        for(int j =1; j < i; j++)
        {
            if(a[j] < a[i])
            {
                f[i] = max(f[i], f[j] + 1);
            }
        }
    }
    cout << *max_element(f.begin(), f.end()) << endl;
```
### 合唱队形
- P1091
- `n `位同学站成一排，音乐老师要请其中的 `n−k` 位同学出列，使得剩下的 `k` 位同学排成合唱队形。
- 设` k` 位同学从左到右依次编号为 `1,2, … ,k，`他们的身高分别为 `t[1],t[2]...t[k]`,则他们的身高满足`t[1] < ... < t[i] > t[i+1] > t[k]`
- 已知n位同学的身高，计算至少需要多少同学出列可以使剩下的同学排成合唱队形
- 阶段：让`i`作为最大的
- 状态：`i`左边的最长上升子序列为`f[i]`,右边的最长下降子序列为`g[i]`
- 决策：和最长上升子序列一样
- 答案：`max(f[i] + g[i] - 1)`
```cpp
int n;
    cin >> n;
    vector<int> a(n + 1);
    vector<int> f(n + 1, 1);f[0] = -inf;
    vector<int> g(n + 1, 1);g[0] = -inf;
    for(int i = 1; i <= n; i++) cin >> a[i];
    for(int i = 1; i <= n; i++)
    {
        for(int j = 1; j < i; j++)
        {
            if(a[j] < a[i]) f[i] = max(f[i], f[j] + 1);
        }
    }
    for(int i = n; i >= 1; i--)
    {
        for(int j = n; j > i; j--)
        {
            if(a[j] < a[i]) g[i] = max(g[i], g[j] + 1);
        }
    }
    int ans = 0;
    for(int i = 1; i <= n; i++)
    {
        ans = max(ans, f[i] + g[i] - 1);
    }
    cout << n - ans << endl;
```
### 摆花
- P1077
- 小明的花店新开张，为了吸引顾客，他想在花店的门口摆上一排花，共 `m` 盆。通过调查顾客的喜好，小明列出了顾客最喜欢的 `n` 种花，从`1` 到 `n`标号。为了在门口展出更多种花，规定第 `i` 种花不能超过`a[i]`盆，摆花时同一种花放在一起，且不同种类的花需按标号的从小到大的顺序依次摆列。
- 计算一共有多少种方案
- 阶段：前i种花
- 状态：前`i`种花总共摆放了j盆的方案数为 `f[i][j]`。
- 决策：`f[i][j] = 求和f[i -1][j - k](0 <= j <= min(a[i],j)) `
- 答案：f[n][m]
```cpp
int n, m;
    cin >> n >> m;
    vector<int> a(n + 1);
    for(int i = 1; i <= n; i++) cin >> a[i];
    vector<vector<int>> f(n + 1, vector<int>(m + 1, 0));
    f[0][0] = 1;
    for(int i = 1; i <= n; i++){
        for(int j = 0; j <= m; j++){
            for(int k = 0; k <= min(a[i], j); k++){
                f[i][j] = (f[i][j] + f[i - 1][j - k]) % mod;
            }
        }
    }
    cout << f[n][m] << endl;
```