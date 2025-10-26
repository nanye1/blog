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
    - [数之和](#数之和)
    - [回文/反转](#回文/反转)
    - [滑动窗口](#滑动窗口)
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
## 两数之和
- 作为力扣的第一道题，很多人上来直接就是两个for循环暴力枚举，但实际上有更聪明的枚举方式，这个题就是一个典型的双指针问题
- https://leetcode.cn/problems/two-sum/
---
- 给定一个整数数组``` num```s 和一个整数目标值``` target```，请你在该数组中找出 **和为目标值**``` target```  的那 **两个** 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

示例 1：
```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```
示例 2：
```
输入：nums = [3,2,4], target = 6
输出：[1,2]

```
- 这题的思路和二分搜索很相似，而且这种问题显然让数组有序会更好做
- 当数组有序之后，```首项+尾项/2```很接近所有数的平均数，因此也最可能接近```target```。
- 我们让```left```指向最小```right```指向最大,如果小了就让left++，大了就让right--
--- 下面是代码
```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<pair<int, int>> vec;//这里为了保留原数组的索引
        for (int i = 0; i < nums.size(); ++i)
            vec.push_back({nums[i], i});

        sort(vec.begin(), vec.end());

        int left = 0, right = vec.size() - 1;
        while (left < right) {
            int sum = vec[left].first + vec[right].first;
            if (sum == target) {
                return {vec[left].second, vec[right].second};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        
    }
};
```
- 其实这题的最优解是哈希表，但是现在讲的是双指针，后面再说

---
## 回文/反转
### 反转字符串
- https://leetcode.cn/problems/reverse-string/description/
- 编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 s 的形式给出。
- 不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。
示例 1：
```
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]
```
示例 2：
```
输入：s = ["H","a","n","n","a","h"]
输出：["h","a","n","n","a","H"]
```
- 这题很简单，我就直接给代码了
```cpp
class Solution {
public:
    void reverseString(vector<char>& s) {
        int n = s.size();
        for (int left = 0, right = n - 1; left < right; ++left, --right) {
            swap(s[left], s[right]);
        }
    }
};
```
### 最长回文子串
- 给你一个字符串 ```s```，找到``` s ```中最长的 **回文** 子串。

示例 1：
```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```
示例 2：
```
输入：s = "cbbd"
输出："bb"
``` 
- 像这种回文/对称，应该想到用双指针
- 但是需要注意一下回文序列的奇偶 