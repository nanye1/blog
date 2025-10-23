---
title: 双指针
published: 2025-10-22
description: 双指针常见技巧
tags: [算法]
category: 算法
draft: false
--- 
- [双指针在数组的运用](#双指针在数组的运用)
    - [快慢指针](#快慢指针)
    - [二分搜索](#二分搜索)
    - [滑动窗口](#滑动窗口)
    - [回文/反转](#回文/反转)
    - [数之和](#数之和)
- [双指针在链表的运用](#双指针在链表的运用)
    - [合并](#合并)
    - [分解](#分解)
    - [其他](#其他)
- [总结](#总结)
---
## 双指针在数组的运用
---
## 快慢指针
### 数组的原地修改

- 力扣第 26 题「删除有序数组中的重复项」，让你在有序数组去重：
https://leetcode.cn/problems/remove-duplicates-from-sorted-array/
---
- 给你一个**非严格递增排列**的数组```nums``` ，请你**原地**删除重复出现的元素，使每个元素**只出现一次**，返回删除后数组的新长度。元素的**相对顺序**应该保持**一致**。然后返回 ```nums``` 中唯一元素的个数。
- 考虑 ```nums ```的唯一元素的数量为 ```k```。去重后，返回唯一元素的数量 k。
- ```nums``` 的前 k 个元素应包含 排序后 的唯一数字。下标 ```k - 1 ```之后的剩余元素可以忽略。

判题标准:

系统会用下面的代码来测试你的题解:
```cpp
int[] nums = [...]; // 输入数组
int[] expectedNums = [...]; // 长度正确的期望答案
int k = removeDuplicates(nums); // 调用
assert k == expectedNums.length;
for (int i = 0; i < k; i++) {
    assert nums[i] == expectedNums[i];
}
```
如果所有断言都通过，那么您的题解将被**通过**。

示例 1：
```cpp
输入：nums = [1,1,2]
输出：2, nums = [1,2,_]
解释：函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。
```
示例 2：
```cpp
输入：nums = [0,0,1,1,1,2,2,3,3,4]
输出：5, nums = [0,1,2,3,4,_,_,_,_,_]
解释：函数应该返回新的长度 5 ， 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4 。不需要考虑数组中超出新长度后面的
```

- **原地**意味着只能对当前数组进行修改，不能新建一个数组
- 这里所需要用到的就是**快慢指针**
- 简单来说就是一个快指针去识别，另一个慢指针去操作
- **注意**  这里指针是广义上的指针，数组的索引也可以是**指针**
- 如果 ```fast``` 遇到值为 ```val ```的元素，则直接跳过，否则就赋值给 ```slow``` 指针，并让 ```slow ```前进一步。

具体代码如下
```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;

        int slow = 0;
        for (int fast = 1; fast < nums.size(); fast++) {
            if (nums[slow] != nums[fast]) {
                slow++;
                nums[slow] = nums[fast];
            }
        }

        return slow + 1;
    }
};
```
- 注意这里需要**先```slow++```再赋值**，要不然第一个会被吞掉
---
- 下面一道题也是快慢指针的思想，如果掌握了前一道题，这题会很简单
- **力扣283移动0**https://leetcode.cn/problems/move-zeroes/
- 给定一个数组 **nums**，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。
- 请注意 ，必须在不复制数组的情况下原地对数组进行操作。
 

示例 1:
```cpp
输入: nums = [0,1,0,3,12]
输出: [1,3,12,0,0]
示例 2:
```
```cpp
输入: nums = [0]
输出: [0]
```
这里我就直接上代码了
```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int slow = 0;  // 指向下一个非零应放置的位置
        for (int fast = 0; fast < nums.size(); fast++) {
            if (nums[fast] != 0) {
                nums[slow] = nums[fast];
                slow++;
            }
        }

        // slow 之后的全部置为 0
        for (int i = slow; i < nums.size(); i++) {
            nums[i] = 0;
        }
    }
};

```
---
## 二分搜索
- 在我们都玩过的猜数字游戏中，用的就是二分搜素的技巧

- 我们先看最笨的顺序查找，我们从1-100遍历全部数字，虽然说运气好可能一下会猜中，但是期望的次数还是很多，复杂度为O(n)
- 如果是凭感觉找，一样还是要看运气
- 如果第一次猜50，然后继续一半一半缩小区间，最坏也能在7次内解决
    - 如何数字来到1-1000000，二分搜索最坏20次就能找到答案
- 二分搜索的时间复杂度是O(log  N)
- 下面是最基本代码
```cpp
int binarySearch(vector<int>& nums, int target) {
    // 一左一右两个指针相向而行
    int left = 0, right = nums.size() - 1;
    while(left <= right) {
        int mid = (right + left) / 2;
        if(nums[mid] == target)
            return mid; 
        else if (nums[mid] < target)
            left = mid + 1; 
        else if (nums[mid] > target)
            right = mid - 1;
    }
    return -1;
}
```