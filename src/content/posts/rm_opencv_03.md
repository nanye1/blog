---
title: RM装甲板识别 - 03 形态学处理
published: 2025-10-24
description: 无
tags: [RM,学习]
category: RM
---
##  本阶段核心API清单

| API | 作用 |
|-----|------|
| `cv::getStructuringElement()` | 创建形态学核 | 
| `cv::dilate()` | 膨胀（变胖） |
| `cv::erode()` | 腐蚀（变瘦） |
| `cv::morphologyEx()` | 高级形态学 |

---

##  核心思路

颜色提取后的二值图有两个主要问题：

### 问题1: 噪点（小白点到处都是）

### 问题2: 断裂（灯条中间有缝隙）

**形态学操作就是解决这些问题的工具！**

---

## 形态学四种处理方式

| 操作 | 效果 | 比喻 | 用途 |
|------|------|------|------|
| **膨胀 dilate** | 白色区域变大 | 涂胖笔 | 连接断裂 |
| **腐蚀 erode** | 白色区域变小 | 橡皮擦 | 去除噪点 |
| **开运算 open** | 先腐蚀后膨胀 | 先擦后涂 | 去噪保形 |
| **闭运算 close** | 先膨胀后腐蚀 | 先涂后擦 | 填缝保形 |

---

## 1. cv::getStructuringElement() - 创建形态学核

###  核形状类型

| shape | 说明 | 效果 |
|-------|------|------|
| `MORPH_RECT` | 矩形（最常用） | 各方向均匀 |
| `MORPH_ELLIPSE` | 椭圆形 | 边缘更圆滑 |
| `MORPH_CROSS` | 十字形 | 只作用于上下左右 |

###  基础用法
```cpp
// 创建3×3矩形核
cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));
// 创建5×5椭圆核
cv::Mat kernel2 = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(5, 5));
// 创建7×7十字核
cv::Mat kernel3 = cv::getStructuringElement(cv::MORPH_CROSS, cv::Size(7, 7));
```

###  核大小如何选择？

| 尺寸 | 效果 | 适用场景 |
|------|------|----------|
| 3×3 | 轻微处理 | 小噪点、细微缝隙 |
| 5×5 | 中等效果 | **推荐**，平衡效果和性能 |
| 7×7 | 强力效果 | 大噪点、大缝隙（可能破坏灯条形状） |
| 9×9+ | 极强效果 | 慎用！容易把灯条变形 |


---

## 2. cv::dilate() - 膨胀操作

###  函数原型
```cpp
void cv::dilate(InputArray src, OutputArray dst, InputArray kernel,
                Point anchor = Point(-1,-1), int iterations = 1);
```

###  参数说明

- `src`  输入二值图 
- `dst`  输出结果 
- `kernel`  形态学核 
- `anchor`  锚点位置（-1,-1表示中心） 
- `iterations`  迭代次数（重复膨胀几次） 


###  基础用法
```cpp
cv::Mat binary = extractColor(img);
cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));

// 腐蚀一次
cv::Mat eroded;
cv::erode(binary, eroded, kernel);

```

###  应用场景

- 去除小噪点
- 分离粘连物体

###  腐蚀的副作用
- 灯条也会变细
- 解决方案：腐蚀后再膨胀回来（开运算）

---

## 4. cv::morphologyEx() - 高级形态学操作

###  操作类型

| op | 操作 | 公式 | 效果 |
|----|------|------|------|
| `MORPH_OPEN` | 开运算 | erode → dilate | **去噪保形** |
| `MORPH_CLOSE` | 闭运算 | dilate → erode | **填缝保形** |
| `MORPH_GRADIENT` | 形态学梯度 | dilate - erode | 提取边缘 |
| `MORPH_TOPHAT` | 顶帽 | src - open | 提取小亮点 |
| `MORPH_BLACKHAT` | 黑帽 | close - src | 提取小暗点 |

---

## 5. 闭运算 (MORPH_CLOSE)

###  基础用法
```cpp
cv::Mat binary = extractColor(img);
cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));
// 闭运算
cv::Mat closed;
cv::morphologyEx(binary, closed, cv::MORPH_CLOSE, kernel);

```

###  应用场景
-  连接灯条的细微断裂
-  填补灯条内部的小黑洞
-  保持灯条的整体形状

###  注意事项
```cpp
// 核太大会让两个灯条粘在一起！
cv::Mat kernel_bad = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(15, 15));
//  可能导致左右灯条合并

// 推荐使用5×5或7×7
cv::Mat kernel_good = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));
```

---

## 6. 开运算 (MORPH_OPEN) - 去噪利器


###  基础用法
```cpp
cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));

// 开运算
cv::Mat opened;
cv::morphologyEx(binary, opened, cv::MORPH_OPEN, kernel);
```
###  应用场景
-  去除小噪点
-  分离轻微粘连的物体
-  平滑物体边缘
---

## 7. RM装甲板识别推荐流程
###  标准流程（两步法）

```cpp
cv::Mat processArmor(const cv::Mat& img) {
    // 1. 颜色提取
    cv::Mat binary = extractColor(img); 
    // 2. 形态学处理
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));
    // 第一步：闭运算（填补灯条缝隙）
    cv::Mat closed;
    cv::morphologyEx(binary, closed, cv::MORPH_CLOSE, kernel);
    // 第二步：开运算（去除噪点）
    cv::Mat result;
    cv::morphologyEx(closed, result, cv::MORPH_OPEN, kernel);
    
    return result;
}
```
---

## 8. 形态学梯度 (MORPH_GRADIENT)

###  基础用法
```cpp
cv::Mat gradient;
cv::morphologyEx(binary, gradient, cv::MORPH_GRADIENT, kernel);
```

###  效果
提取物体的**外轮廓线**，类似边缘检测


###  应用场景
- 能量机关扇叶边缘检测
- 装甲板外框提取（不常用）

---

##  完整实战代码

### 方案1: 快速版（单次操作）
```cpp
#include <opencv2/opencv.hpp>

int main() {
    cv::Mat img = cv::imread("armor.jpg");
    
    // 颜色提取（假设已实现）
    cv::Mat binary = extractRedColor(img);
    
    // 形态学核
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));
    
    // 闭运算（最常用）
    cv::Mat result;
    cv::morphologyEx(binary, result, cv::MORPH_CLOSE, kernel);
    
    // 显示对比
    cv::imshow("原始二值图", binary);
    cv::imshow("形态学处理后", result);
    cv::waitKey(0);
    
    return 0;
}
```

### 方案2: 标准版（两步法）
```cpp
#include <opencv2/opencv.hpp>

cv::Mat morphologyProcess(const cv::Mat& binary) {
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5, 5));
    
    // 第一步：闭运算填缝
    cv::Mat closed;
    cv::morphologyEx(binary, closed, cv::MORPH_CLOSE, kernel);
    
    // 第二步：开运算去噪
    cv::Mat opened;
    cv::morphologyEx(closed, opened, cv::MORPH_OPEN, kernel);
    
    return opened;
}

int main() {
    cv::Mat img = cv::imread("armor.jpg");
    cv::Mat binary = extractColor(img);
    
    cv::Mat result = morphologyProcess(binary);
    
    // 显示三步对比
    cv::imshow("1-原始", binary);
    cv::Mat closed;
    cv::morphologyEx(binary, closed, cv::MORPH_CLOSE, 
                     cv::getStructuringElement(cv::MORPH_RECT, cv::Size(5,5)));
    cv::imshow("2-闭运算", closed);
    cv::imshow("3-最终结果", result);
    
    cv::waitKey(0);
    return 0;
}
```

### 方案3: 自适应版（根据图像大小调整核）
```cpp
cv::Mat adaptiveMorphology(const cv::Mat& binary) {
    // 根据图像大小自适应核尺寸
    int kernelSize = std::max(3, (int)(binary.cols * 0.005));
    if (kernelSize % 2 == 0) kernelSize++;  // 确保是奇数
    
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, 
                                               cv::Size(kernelSize, kernelSize));
    
    cv::Mat closed, result;
    cv::morphologyEx(binary, closed, cv::MORPH_CLOSE, kernel);
    cv::morphologyEx(closed, result, cv::MORPH_OPEN, kernel);
    
    std::cout << "使用核尺寸: " << kernelSize << "×" << kernelSize << std::endl;
    return result;
}
```
---