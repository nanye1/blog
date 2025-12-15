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
## 二维前缀和
```cpp
ll a[N][N], pre[N][N];
void solve()
{
    ll n, m, c;
    cin >> n >> m >> c;
    for(int i = 1; i <= n; ++i)
        for(int j = 1; j <= m; ++j)
         cin >> a[i][j];
    for(int i = 1; i <= n; ++i)
        for(int j = 1; j <= m; ++j)
         pre[i][j] = pre[i][j - 1] + pre[i - 1][j] - pre[i - 1][j - 1] + a[i][j];
    ll ans = -INF;
    ll x = 0, y = 0;
    for(int i = 1; i <= n; ++i)
    {   
        for(int j = 1; j <= m; ++j)
        {
            if(i + c - 1 > n || j + c - 1 > m)
                continue;
            if(ans < pre[i + c - 1][j + c - 1] - pre[i + c - 1][j - 1] - pre[i - 1][j +c - 1] + pre[i - 1][j - 1])
            {
                ans = pre[i + c - 1][j + c - 1] - pre[i + c - 1][j - 1] - pre[i - 1][j+ c - 1] + pre[i - 1][j - 1];
                x = i, y = j;
            }
        }
    }
    cout << x << " " << y << '\n';
}
```