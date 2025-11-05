---
title: 双指针
published: 2025-10-22
description: 双指针常见技巧
tags: [算法]
category: 算法
draft: false
--- 
- 本篇参考labuladong的算法笔记编写
- [双指针在数组的运用](#双指针在数组的运用)
    - [快慢指针](#快慢指针)
    - [二分搜索](#二分搜索)
    - [数之和](#数之和)
    - [回文/反转](#回文/反转)
    - [滑动窗口](#滑动窗口)
- [双指针在链表的运用](#双指针在链表的运用)
    - [合并](#合并两个有序列表)
    - [分解](#单链表的分解)
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
## 数之和
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
- 但是需要先判断一下回文序列的奇偶，奇偶需要不同的处理方式
     - 如果是奇数，那么两个指针应该重合，再向两侧寻找
     - 如果是偶数，两个指针停留在相同的字符上，再向两侧寻找

```cpp
lass Solution {
public:
    string longestPalindrome(string s) {
        string res = "";
        for (int i = 0; i < s.length(); i++) {
            // 以 s[i] 为中心的最长回文子串
            string s1 = palindrome(s, i, i);
            // 以 s[i] 和 s[i+1] 为中心的最长回文子串
            string s2 = palindrome(s, i, i + 1);
            // res = longest(res, s1, s2)
            res = res.length() > s1.length() ? res : s1;
            res = res.length() > s2.length() ? res : s2;
        }
        return res;
    }

private:
    string palindrome(string s, int l, int r) {
        // 防止索引越界
        while (l >= 0 && r < s.length() && s[l] == s[r]) {
            // 向两边展开
            l--;
            r++;
        }
        // 此时 s[l+1..r-1] 就是最长回文串
        return s.substr(l + 1, r - l - 1);
    }
};

```
## 滑动窗口

- 滑动窗口可以归为快慢双指针，一快一慢两个指针前后相随，中间的部分就是窗口。滑动窗口算法技巧主要用来解决子数组问题，比如让你寻找符合某个条件的最长/最短子数组。
### 滑动窗口框架
```cpp
void slidingWindow(string s) {
    // 用合适的数据结构记录窗口中的数据，根据具体场景变通
    // 比如说，我想记录窗口中元素出现的次数，就用 map
    // 如果我想记录窗口中的元素和，就可以只用一个 int
    auto window = ...

    int left = 0, right = 0;
    while (right < s.size()) {
        // c 是将移入窗口的字符
        char c = s[right];
        window.add(c);
        // 增大窗口
        right++;

        // 进行窗口内数据的一系列更新
        ...

        // *** debug 输出的位置 ***
        printf("window: [%d, %d)\n", left, right);
        // 注意在最终的解法代码中不要 print
        // 因为 IO 操作很耗时，可能导致超时

        // 判断左侧窗口是否要收缩
        while (window needs shrink) {
            // d 是将移出窗口的字符
            char d = s[left];
            window.remove(d);
            // 缩小窗口
            left++;

            // 进行窗口内数据的一系列更新
            ...
        }
    }
}

```
## 字符串的排列
- 给你两个字符串 `s1` 和 `s2` ，写一个函数来判断 `s2` 是否包含 `s1` 的 排列。如果是，返回 `true` ；否则，返回 `false` 。
- 换句话说，`s1` 的排列之一是 `s2` 的 子串 。
示例 1：
```
输入：s1 = "ab" s2 = "eidbaooo"
输出：true
解释：s2 包含 s1 的排列之一 ("ba").
```
示例 2：
```
输入：s1= "ab" s2 = "eidboaoo"
输出：false
```
- 窗口大小固定为 s1.size()
    - 因为 s2 中可能存在的子串长度必须等于 s1。
- 维护一个频次数组
    - 用 cnt1[26] 保存 s1 中每个字母出现的次数。
    - 遍历 s2 时，维护一个窗口 [l, r]，每次加入一个字符，尝试匹配 cnt1。
- 匹配条件
    - 定义 count = k = s1.size()，表示还差多少个字符能匹配成功。
    - 每次加入新字符 s2[r]：
        - 让 cnt1[s2[r]]--。
        - 如果 cnt1[s2[r]] 还大于 0，说明这个字符是需要的 → count--。
    - 当窗口长度等于 k 时：
        - 如果 count == 0，说明窗口里的字符正好是一个排列 → 返回 true。
        - 窗口右移时，把 s2[l] 移出：
            - 如果 ++cnt1[s2[l]] > 0，说明移出了一个必须的字符 → count++。
        - 下一步窗口大小 >k 了，需要l++  → 维持窗口
```cpp
class Solution {
public:
    // 判断 s 中是否存在 t 的排列
    bool checkInclusion(string t, string s) {
        unordered_map<char, int> need, window;
        for (char c : t) need[c]++;

        int left = 0, right = 0;
        int valid = 0;
        while (right < s.size()) {
            char c = s[right];
            right++;
            // 进行窗口内数据的一系列更新
            if (need.count(c)) {
                window[c]++;
                if (window[c] == need[c])
                    valid++;
            }

            // 判断左侧窗口是否要收缩
            while (right - left >= t.size()) {
                // 在这里判断是否找到了合法的子串
                if (valid == need.size())
                    return true;
                char d = s[left];
                left++;
                // 进行窗口内数据的一系列更新
                if (need.count(d)) {
                    if (window[d] == need[d])
                        valid--;
                    window[d]--;
                }
            }
        }
        // 未找到符合条件的子串
        return false;
    }
};
```
---
## 双指针在链表的运用
---
## 合并两个有序列表
- https://leetcode.cn/problems/merge-two-sorted-lists/description/
- 将两个升序链表合并为一个新的 `升序` 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 
示例 1:
<img src="/img/merge_ex1.jpg">
```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```
示例 2：
```
输入：l1 = [], l2 = []
输出：[]
```
示例 3：
```
输入：l1 = [], l2 = [0]
输出：[0]
```
- 比较简单，下面是代码
```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        // 虚拟头结点
        ListNode dummy(-1), *p = &dummy;
        ListNode *p1 = l1, *p2 = l2;
        
        while (p1 != nullptr && p2 != nullptr) {
            // 比较 p1 和 p2 两个指针
            // 将值较小的的节点接到 p 指针
            if (p1->val > p2->val) {
                p->next = p2;
                p2 = p2->next;
            } else {
                p->next = p1;
                p1 = p1->next;
            }
            // p 指针不断前进
            p = p->next;
        }
        
        if (p1 != nullptr) {
            p->next = p1;
        }
        
        if (p2 != nullptr) {
            p->next = p2;
        }
        
        return dummy.next;
    }
};
```
---
## 合并`k`个有序链表
- https://leetcode.cn/problems/merge-k-sorted-lists/description/
- 给你一个链表数组，每个链表都已经按升序排列。
- 请你将所有链表合并到一个升序链表中，返回合并后的链表。
示例 1：
```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
1->1->2->3->4->4->5->6
```
示例 2：
```
输入：lists = []
输出：[]
```
- 合并 `k` 个有序链表的逻辑类似合并两个有序链表，难点在于，如何快速得到 `k` 个节点中的最小节点，接到结果链表上
```cpp
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) return nullptr;
        // 虚拟头结点
        ListNode* dummy = new ListNode(-1);
        ListNode* p = dummy;
        // 优先级队列，最小堆
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        // 将 k 个链表的头结点加入最小堆
        for (ListNode* head : lists) {
            if (head != nullptr) {
                pq.push(head);
            }
        }

        while (!pq.empty()) {
            // 获取最小节点，接到结果链表中
            ListNode* node = pq.top();
            pq.pop();
            p->next = node;
            if (node->next != nullptr) {
                pq.push(node->next);
            }
            // p 指针不断前进
            p = p->next;
        }
        return dummy->next;
    }
};
```

---
## 单链表的分解
- https://leetcode.cn/problems/partition-list/description/
- 给你一个链表的头节点 `head` 和一个特定值 `x` ，请你对链表进行分隔，使得所有 小于 `x` **的节点都出现在** 大于或等于 `x` 的节点之前。

- 你应当 保留 两个分区中每个节点的初始相对位置。
示例 1：
<img src="/img/partition.jpg">
```
输入：head = [1,4,3,2,5,2], x = 3
输出：[1,2,2,4,3,5]
```
示例 2：
```
输入：head = [2,1], x = 2
输出：[1,2]
```
- 是不是很像之前讲过的移动0？
- 思路其实都差不多，快慢指针的思想，一个查找，一个处理
- 然后把所有大于等于x的穿成一个新的链表，最后两个链表合并即可
- 下面是代码


```cpp
class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        // 存放小于 x 的链表的虚拟头结点
        ListNode* dummy1 = new ListNode(-1);
        // 存放大于等于 x 的链表的虚拟头结点
        ListNode* dummy2 = new ListNode(-1);
        // p1, p2 指针负责生成结果链表
        ListNode* p1 = dummy1, *p2 = dummy2;
        // p 负责遍历原链表，类似合并两个有序链表的逻辑
        // 这里是将一个链表分解成两个链表
        ListNode* p = head;
        while (p != nullptr) {
            if (p->val >= x) {
                p2->next = p;
                p2 = p2->next;
            } else {
                p1->next = p;
                p1 = p1->next;
            }
            // 不能直接让 p 指针前进，
            // p = p->next
            // 断开原链表中的每个节点的 next 指针
            ListNode* temp = p->next;
            p->next = nullptr;
            p = temp;
        }
        // 连接两个链表
        p1->next = dummy2->next;

        return dummy1->next;
    }
};
```
