---
title: RM装甲板识别 - 02 装甲板颜色提取
published: 2025-10-24
description: 无
tags: [RM,学习]
category: RM
---

## 本阶段核心API清单

| API | 作用 | 
|-----|------|
| `cv::split()` | 分离BGR通道 | 
| `cv::cvtColor()` | 颜色空间转换 | 
| `cv::inRange()` | 颜色范围筛选 | 
| `cv::threshold()` | 简单阈值二值化 | 
| `cv::subtract()` | 通道相减 | 
| `cv::bitwise_or/and()` | 位运算组合mask | 

---

##  核心思路

装甲板的灯条有两个特点：
1. **特定颜色**（红色或蓝色）
2. **高亮度**（灯条是发光的）



### 通道相减法 
- **原理**: BGR图像中，红色区域R通道值高、B通道值低，相减后红色凸显
- **优点**: 速度极快（1-2ms），实时性好
- **缺点**: 易受环境光干扰，需要后续强筛选
- **适用**: 比赛实战、光照稳定环境

### HSV筛选法 
- **原理**: HSV分离了颜色和亮度，可精确筛选颜色范围
- **优点**: 抗干扰能力强，准确度高
- **缺点**: 速度较慢（5-10ms），参数需调优
- **适用**: 复杂光照、高精度需求

---

## 1. cv::split() - 分离BGR通道


###  基础用法
```cpp
#include <opencv2/opencv.hpp>
#include <vector>

int main() {
    cv::Mat img = cv::imread("armor.jpg");
    // 分离通道
    std::vector<cv::Mat> channels;
    cv::split(img, channels);    
    // 现在：
    // channels[0] = B通道（蓝色分量）
    // channels[1] = G通道（绿色分量）
    // channels[2] = R通道（红色分量）  
    cv::waitKey(0);
    
    return 0;
}
```
---

## 2. 通道相减法

###  提取红色
```cpp
cv::Mat img = cv::imread("red_armor.jpg");
// 分离通道
std::vector<cv::Mat> channels;
cv::split(img, channels);
// 红色 = R通道 - B通道
cv::Mat red;
cv::subtract(channels[2], channels[0], red);
// 二值化
cv::Mat binary;
cv::threshold(red, binary, 100, 255, cv::THRESH_BINARY);
// 查看效果

```

### 提取蓝色
```cpp
// 蓝色 = B通道 - R通道
cv::Mat blue;
cv::subtract(channels[0], channels[2], blue);

cv::Mat binary_blue;
cv::threshold(blue, binary_blue, 100, 255, cv::THRESH_BINARY);
```

---

## 3. cv::cvtColor() - 颜色空间转换

###  
###  常用转换代码

- `COLOR_BGR2GRAY`  BGR转灰度
- `COLOR_BGR2HSV`  BGR转HSV 
- `COLOR_BGR2RGB` BGR转RGB 
- `COLOR_HSV2BGR`  HSV转回BGR

###  HSV颜色空间详解

HSV把颜色分解为3个维度：

```
H (色调 Hue): 0-180
├─ 0-10:    红色(第一段)
├─ 100-124: 蓝色  装甲板蓝色
└─ 170-180: 红色(第二段) 装甲板红色

S (饱和度 Saturation): 0-255
└─ 100-255: 鲜艳色 灯条在这里

V (明度 Value): 0-255
└─ 100-255: 明亮 灯条在这里
```

###  BGR转HSV
```cpp
cv::Mat img = cv::imread("armor.jpg");
cv::Mat hsv;
cv::cvtColor(img, hsv, cv::COLOR_BGR2HSV);

```

---

## 4. cv::inRange() - 颜色范围筛选

- `src`  输入图像（通常是HSV） 
- `lowerb`  下界（Scalar(H_min, S_min, V_min)） 
- `upperb`  上界（Scalar(H_max, S_max, V_max)） 
- `dst`  输出二值图（在范围内=255，否则=0） 

###  提取红色（完整版）

```cpp
cv::Mat img = cv::imread("red_armor.jpg");
cv::Mat hsv;
cv::cvtColor(img, hsv, cv::COLOR_BGR2HSV);

// 红色的H值跨越了0-180的边界！需要分两段
// 第一段: H=0-10
cv::Scalar lower_red1(0, 100, 100);    // (H, S, V)
cv::Scalar upper_red1(10, 255, 255);

// 第二段: H=170-180
cv::Scalar lower_red2(170, 100, 100);
cv::Scalar upper_red2(180, 255, 255);

// 分别提取两段
cv::Mat mask1, mask2, red_mask;
cv::inRange(hsv, lower_red1, upper_red1, mask1);
cv::inRange(hsv, lower_red2, upper_red2, mask2);

// 合并两段（位运算：或）
cv::bitwise_or(mask1, mask2, red_mask);

```

### 提取蓝色
```cpp
// 蓝色只需要一段
cv::Scalar lower_blue(100, 100, 100);  // H=100-130
cv::Scalar upper_blue(130, 255, 255);

cv::Mat blue_mask;
cv::inRange(hsv, lower_blue, upper_blue, blue_mask);
```

###  参数调优技巧

**创建滑块实时调参**：
```cpp
#include <opencv2/opencv.hpp>

// 全局变量
int h_min = 0, h_max = 10;
int s_min = 100, s_max = 255;
int v_min = 100, v_max = 255;

void on_trackbar(int, void*) {
    // 回调函数，每次滑块变化时调用
}

int main() {
    cv::Mat img = cv::imread("armor.jpg");
    cv::Mat hsv;
    cv::cvtColor(img, hsv, cv::COLOR_BGR2HSV);
    
    // 创建窗口
    cv::namedWindow("调参");
    
    // 创建滑块
    cv::createTrackbar("H min", "调参", &h_min, 180, on_trackbar);
    cv::createTrackbar("H max", "调参", &h_max, 180, on_trackbar);
    cv::createTrackbar("S min", "调参", &s_min, 255, on_trackbar);
    cv::createTrackbar("S max", "调参", &s_max, 255, on_trackbar);
    cv::createTrackbar("V min", "调参", &v_min, 255, on_trackbar);
    cv::createTrackbar("V max", "调参", &v_max, 255, on_trackbar);
    
    while (true) {
        cv::Scalar lower(h_min, s_min, v_min);
        cv::Scalar upper(h_max, s_max, v_max);
        
        cv::Mat mask;
        cv::inRange(hsv, lower, upper, mask);
        
        cv::imshow("原图", img);
        cv::imshow("mask", mask);
        
        if (cv::waitKey(30) == 27) break;
    }
    
    // 打印最终参数
    std::cout << "最优参数:" << std::endl;
    std::cout << "lower: (" << h_min << ", " << s_min << ", " << v_min << ")" << std::endl;
    std::cout << "upper: (" << h_max << ", " << s_max << ", " << v_max << ")" << std::endl;
    
    return 0;
}
```

---

## 5. cv::threshold() - 简单阈值二值化


- `THRESH_BINARY` | 标准二值化 
- `THRESH_BINARY_INV` | 反向二值化 
- `THRESH_TRUNC` | 截断 
- `THRESH_TOZERO` | 低于阈值归零 

###  配合通道相减使用
```cpp
// 提取红色
cv::Mat red;
cv::subtract(channels[2], channels[0], red);

// 阈值二值化
cv::Mat binary;
cv::threshold(red, binary, 100, 255, cv::THRESH_BINARY);
// 像素 > 100 → 255(白)
// 像素 <= 100 → 0(黑)
```

###  自适应阈值（应对光照不均）
```cpp
cv::Mat gray;
cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);

cv::Mat adaptive;
cv::adaptiveThreshold(gray, adaptive, 255,
                      cv::ADAPTIVE_THRESH_GAUSSIAN_C,
                      cv::THRESH_BINARY, 11, 2);
// blockSize=11: 邻域大小
// C=2: 常数调整值
```

---

## 6. cv::bitwise 位运算

###  常用函数
```cpp
void cv::bitwise_or(InputArray src1, InputArray src2, OutputArray dst);
void cv::bitwise_and(InputArray src1, InputArray src2, OutputArray dst);
void cv::bitwise_not(InputArray src, OutputArray dst);
void cv::bitwise_xor(InputArray src1, InputArray src2, OutputArray dst);
```

###  合并多个mask
```cpp
// 红色有两段，需要合并
cv::Mat red_mask1, red_mask2, red_final;
cv::inRange(hsv, lower_red1, upper_red1, red_mask1);
cv::inRange(hsv, lower_red2, upper_red2, red_mask2);
cv::bitwise_or(red_mask1, red_mask2, red_final);
```

###  提取同时满足多个条件的区域
```cpp
// 同时是红色 且 亮度很高
cv::Mat color_mask, brightness_mask, final_mask;
cv::inRange(hsv, lower_red, upper_red, color_mask);
cv::threshold(hsv_channels[2], brightness_mask, 200, 255, cv::THRESH_BINARY);
cv::bitwise_and(color_mask, brightness_mask, final_mask);
```

###  反转mask
```cpp
cv::Mat mask, inverted;
cv::inRange(hsv, lower, upper, mask);
cv::bitwise_not(mask, inverted);  // 黑白反转
```

---

##  完整实战代码

### 方案1: 通道相减法（快速）
```cpp
#include <opencv2/opencv.hpp>

cv::Mat extractRedFast(const cv::Mat& img) {
    std::vector<cv::Mat> channels;
    cv::split(img, channels);
    
    // R - B
    cv::Mat red;
    cv::subtract(channels[2], channels[0], red);
    
    // 二值化
    cv::Mat binary;
    cv::threshold(red, binary, 100, 255, cv::THRESH_BINARY);
    
    return binary;
}

int main() {
    cv::Mat img = cv::imread("red_armor.jpg");
    cv::Mat binary = extractRedFast(img);
    
    cv::imshow("原图", img);
    cv::imshow("红色提取", binary);
    cv::waitKey(0);
    
    return 0;
}
```

### 方案2: HSV筛选法（精确）
```cpp
#include <opencv2/opencv.hpp>

cv::Mat extractRedAccurate(const cv::Mat& img) {
    cv::Mat hsv;
    cv::cvtColor(img, hsv, cv::COLOR_BGR2HSV);
    
    // 红色两段
    cv::Scalar lower1(0, 100, 100);
    cv::Scalar upper1(10, 255, 255);
    cv::Scalar lower2(170, 100, 100);
    cv::Scalar upper2(180, 255, 255);
    
    cv::Mat mask1, mask2, mask;
    cv::inRange(hsv, lower1, upper1, mask1);
    cv::inRange(hsv, lower2, upper2, mask2);
    cv::bitwise_or(mask1, mask2, mask);
    
    return mask;
}

cv::Mat extractBlue(const cv::Mat& img) {
    cv::Mat hsv;
    cv::cvtColor(img, hsv, cv::COLOR_BGR2HSV);
    
    cv::Scalar lower(100, 100, 100);
    cv::Scalar upper(130, 255, 255);
    
    cv::Mat mask;
    cv::inRange(hsv, lower, upper, mask);
    
    return mask;
}

int main() {
    cv::Mat img = cv::imread("armor.jpg");
    
    cv::Mat red_mask = extractRedAccurate(img);
    cv::Mat blue_mask = extractBlue(img);
    
    cv::imshow("原图", img);
    cv::imshow("红色mask", red_mask);
    cv::imshow("蓝色mask", blue_mask);
    cv::waitKey(0);
    
    return 0;
}
```

---
