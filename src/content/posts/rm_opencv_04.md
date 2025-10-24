---
title: RM装甲板识别 - 04 轮廓检测
published: 2025-10-24
description: 无
tags: [RM,学习]
category: RM
---
## 📚 本阶段核心API清单

| API | 作用 
|-----|------|
| `cv::findContours()` | 查找轮廓 |
| `cv::contourArea()` | 计算轮廓面积 |
| `cv::minAreaRect()` | 最小旋转矩形 | 
| `cv::RotatedRect` | 旋转矩形类 | 
| `cv::drawContours()` | 绘制轮廓 | 
| `cv::boundingRect()` | 正矩形包围框 | 
| `cv::fitEllipse()` | 椭圆拟合 | 

---

##  核心思路

- 经过形态学处理后，二值图已经很干净：

- 现在要做的是：
1. **找轮廓** - 把每个白色区域的边界找出来
2. **拟合矩形** - 用旋转矩形描述每个轮廓
3. **筛选灯条** - 根据长宽比、面积、角度等特征过滤

---

## 1. cv::findContours() - 查找轮廓

###  函数原型
```cpp
void cv::findContours(InputOutputArray image, 
                      OutputArrayOfArrays contours,
                      int mode, int method, 
                      Point offset = Point());
```

###  参数详解

#### mode - 轮廓检索模式

| mode | 说明 | 用途 |
|------|------|------|
| `RETR_EXTERNAL` | 只检测最外层轮廓 | **RM推荐**，忽略内部孔洞 |
| `RETR_LIST` | 检测所有轮廓，不建立层级 | 当需要所有轮廓时 |
| `RETR_TREE` | 检测所有并建立完整层级树 | 复杂嵌套结构 |
| `RETR_CCOMP` | 两层层级（外轮廓和孔） | 较少使用 |

#### method - 轮廓近似方法

| method | 说明 | 优缺点 |
|--------|------|--------|
| `CHAIN_APPROX_NONE` | 保存所有轮廓点 | 精确但占内存 |
| `CHAIN_APPROX_SIMPLE` | 压缩轮廓，只保留关键点 | **RM推荐**，节省内存 |

###  基础用法
```cpp
#include <opencv2/opencv.hpp>
#include <vector>

int main() {
    cv::Mat img = cv::imread("armor.jpg");
    
    // 获取二值图（假设已实现）
    cv::Mat binary = processImage(img);
    
    // 查找轮廓
    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(binary, contours, cv::RETR_EXTERNAL, 
                     cv::CHAIN_APPROX_SIMPLE);
    
    std::cout << "找到 " << contours.size() << " 个轮廓" << std::endl;
    
    // 遍历所有轮廓
    for (size_t i = 0; i < contours.size(); i++) {
        std::cout << "轮廓 " << i << " 有 " << contours[i].size() 
                  << " 个点" << std::endl;
    }
    
    return 0;
}
```

###  重要注意事项

#### 注意1: findContours会修改输入图像！
```cpp
//  错误：原始binary被修改了
cv::findContours(binary, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

//  正确：传入副本
cv::Mat binary_copy = binary.clone();
cv::findContours(binary_copy, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

// 或者直接在临时对象上调用
cv::findContours(binary.clone(), contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);
```

#### 注意2: 输入必须是二值图
```cpp
//  错误：彩色图不行
cv::Mat img = cv::imread("armor.jpg");
cv::findContours(img, contours, ...);  //  结果不对

//  正确：必须是二值图（0或255）
cv::Mat binary;
cv::threshold(gray, binary, 128, 255, cv::THRESH_BINARY);
cv::findContours(binary, contours, ...);
```

---

## 2. 轮廓数据结构理解

###  轮廓的本质
```cpp
// 轮廓 = 点的集合
std::vector<cv::Point> contour = contours[0];

// 每个点是(x, y)坐标
cv::Point p = contour[0];
std::cout << "第一个点: (" << p.x << ", " << p.y << ")" << std::endl;
```

###  轮廓操作示例
```cpp
std::vector<std::vector<cv::Point>> contours;
cv::findContours(binary, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

// 轮廓数量
int num = contours.size();

// 第i个轮廓的点数
int pointCount = contours[i].size();

// 访问第i个轮廓的第j个点
cv::Point p = contours[i][j];
```

---

## 3. cv::contourArea() - 计算轮廓面积

###  函数原型
```cpp
double cv::contourArea(InputArray contour, bool oriented = false);
```

###  基础用法
```cpp
for (const auto& contour : contours) {
    double area = cv::contourArea(contour);
    std::cout << "轮廓面积: " << area << " 像素" << std::endl;
}
```

###  用于过滤噪点
```cpp
std::vector<std::vector<cv::Point>> validContours;

for (const auto& contour : contours) {
    double area = cv::contourArea(contour);
    
    // 过滤太小的轮廓（噪点）
    if (area < 100) continue;
    
    // 过滤太大的轮廓（可能是整个装甲板或背景）
    if (area > 10000) continue;
    
    // 保留合理大小的轮廓
    validContours.push_back(contour);
}

std::cout << "过滤后剩余 " << validContours.size() << " 个轮廓" << std::endl;
```

###  面积阈值如何选择？

这取决于：
1. **图像分辨率** - 1920×1080 vs 640×480
2. **装甲板距离** - 近距离灯条大，远距离灯条小
3. **相机FOV** - 视场角大小

**推荐方法**：
```cpp
// 根据图像大小自适应
int imageArea = binary.rows * binary.cols;
double minArea = imageArea * 0.0001;  // 0.01%
double maxArea = imageArea * 0.05;    // 5%

for (const auto& contour : contours) {
    double area = cv::contourArea(contour);
    if (area > minArea && area < maxArea) {
        // 合理范围
    }
}
```

---

## 4. cv::minAreaRect() - 最小旋转矩形

###  函数原型
```cpp
RotatedRect cv::minAreaRect(InputArray points);
```

###  为什么用旋转矩形？

灯条通常是**倾斜**的，普通矩形无法准确描述：

###  基础用法
```cpp
for (const auto& contour : contours) {
    // 拟合最小旋转矩形
    cv::RotatedRect rect = cv::minAreaRect(contour);
    
    // 获取矩形信息
    cv::Point2f center = rect.center;      // 中心点
    cv::Size2f size = rect.size;           // 尺寸(width, height)
    float angle = rect.angle;              // 旋转角度(-90到0)
    
    std::cout << "中心: (" << center.x << ", " << center.y << ")" << std::endl;
    std::cout << "尺寸: " << size.width << " × " << size.height << std::endl;
    std::cout << "角度: " << angle << "°" << std::endl;
}
```

---

## 5. cv::RotatedRect 类详解

###  核心属性

```cpp
cv::RotatedRect rect = cv::minAreaRect(contour);

// 中心点
cv::Point2f center = rect.center;  // 矩形中心的(x,y)坐标

// 尺寸
cv::Size2f size = rect.size;       // width × height
float width = size.width;
float height = size.height;

// 旋转角度
float angle = rect.angle;          // 范围: -90° ~ 0°
```

###  angle的陷阱

**OpenCV的angle定义很反直觉！**

```cpp
// angle的含义：
// 从水平方向逆时针旋转到矩形长边的角度
// 范围：-90° 到 0°

// 例子：
angle = -90°  → 矩形垂直（竖着）
angle = -45°  → 矩形倾斜45度
angle = 0°    → 矩形水平（横着）
```

###  确保height是长边

```cpp
cv::RotatedRect rect = cv::minAreaRect(contour);

float width = rect.size.width;
float height = rect.size.height;

//  OpenCV不保证height > width！
// 需要手动调整
if (width > height) {
    std::swap(width, height);
    // 如果需要，也可以调整angle
}

// 现在 height 一定是长边
float aspectRatio = height / width;  // 长宽比
```

###  获取四个顶点坐标

```cpp
cv::RotatedRect rect = cv::minAreaRect(contour);

// 获取四个顶点
cv::Point2f vertices[4];
rect.points(vertices);

// vertices[0], vertices[1], vertices[2], vertices[3]
// 按逆时针顺序排列

// 绘制旋转矩形
for (int i = 0; i < 4; i++) {
    cv::line(img, vertices[i], vertices[(i+1)%4], 
             cv::Scalar(0, 255, 0), 2);
}
```

---

## 6. 灯条特征筛选（核心）

###  灯条的典型特征

| 特征 | 合理范围 | 说明 |
|------|----------|------|
| **长宽比** | 2.0 ~ 10.0 | 灯条是细长的 |
| **面积** | 100 ~ 5000像素 | 根据分辨率调整 |
| **角度** | 接近垂直 | 通常在±30°内 |
| **填充度** | > 0.5 | 轮廓面积/外接矩形面积 |

###  完整筛选代码

```cpp
#include <opencv2/opencv.hpp>
#include <vector>

struct LightBar {
    cv::RotatedRect rect;
    double area;
    float aspectRatio;
    float angle;
};

std::vector<LightBar> detectLightBars(const cv::Mat& binary) {
    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(binary.clone(), contours, 
                     cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);
    
    std::vector<LightBar> lightBars;
    
    for (const auto& contour : contours) {
        // 1. 面积筛选
        double area = cv::contourArea(contour);
        if (area < 100 || area > 5000) continue;
        
        // 2. 拟合旋转矩形
        cv::RotatedRect rect = cv::minAreaRect(contour);
        
        // 3. 确保height是长边
        float width = rect.size.width;
        float height = rect.size.height;
        if (width > height) {
            std::swap(width, height);
        }
        
        // 4. 长宽比筛选
        float aspectRatio = height / width;
        if (aspectRatio < 2.0 || aspectRatio > 10.0) continue;
        
        // 5. 角度筛选（可选，根据实际情况）
        // 灯条应该接近垂直
        float angle = std::abs(rect.angle);
        if (angle > 30 && angle < 60) continue;  // 太斜的排除
        
        // 6. 填充度筛选（可选）
        double rectArea = width * height;
        double fillRatio = area / rectArea;
        if (fillRatio < 0.5) continue;  // 太空的不是灯条
        
        // 通过所有筛选，保存
        LightBar bar;
        bar.rect = rect;
        bar.area = area;
        bar.aspectRatio = aspectRatio;
        bar.angle = angle;
        lightBars.push_back(bar);
    }
    
    std::cout << "找到 " << lightBars.size() << " 个灯条" << std::endl;
    return lightBars;
}
```

###  筛选效果展示

```cpp
// 假设找到20个轮廓：

轮廓1: 面积=50      太小，过滤
轮廓2: 面积=800    通过面积
       长宽比=5.2    通过长宽比
       填充度=0.8  通过填充度
       结果: 灯条候选1 

轮廓3: 面积=1200     通过面积
       长宽比=1.1   太矮，过滤

轮廓4: 面积=900      通过面积
       长宽比=4.8    通过长宽比
       填充度=0.3   太空，过滤

...

最终: 找到4个灯条（2对装甲板）
```

---

## 7. cv::drawContours() - 绘制轮廓（调试）

###  函数原型
```cpp
void cv::drawContours(InputOutputArray image,
                      InputArrayOfArrays contours,
                      int contourIdx, 
                      const Scalar& color,
                      int thickness = 1);
```

###  基础用法

```cpp 
cv::Mat display = img.clone();

// 绘制所有轮廓
cv::drawContours(display, contours, -1, cv::Scalar(0, 255, 0), 2);
// -1 表示绘制所有轮廓

// 绘制第i个轮廓
cv::drawContours(display, contours, i, cv::Scalar(255, 0, 0), 2);

// 填充轮廓
cv::drawContours(display, contours, i, cv::Scalar(0, 0, 255), -1);
// thickness=-1 表示填充
```

###  彩色调试可视化

```cpp
void visualizeContours(const cv::Mat& img, 
                       const std::vector<std::vector<cv::Point>>& contours) {
    cv::Mat display = img.clone();
    
    // 为每个轮廓随机颜色
    cv::RNG rng(12345);
    
    for (size_t i = 0; i < contours.size(); i++) {
        cv::Scalar color(rng.uniform(0, 256), 
                        rng.uniform(0, 256), 
                        rng.uniform(0, 256));
        
        // 绘制轮廓
        cv::drawContours(display, contours, i, color, 2);
        
        // 标注序号
        cv::Moments m = cv::moments(contours[i]);
        cv::Point2f center(m.m10/m.m00, m.m01/m.m00);
        cv::putText(display, std::to_string(i), center,
                    cv::FONT_HERSHEY_SIMPLEX, 0.5, color, 2);
    }
    
    cv::imshow("轮廓可视化", display);
}
```

---

## 8. 绘制旋转矩形

###  标准方法

```cpp
void drawRotatedRect(cv::Mat& img, const cv::RotatedRect& rect, 
                     const cv::Scalar& color, int thickness = 2) {
    cv::Point2f vertices[4];
    rect.points(vertices);
    
    for (int i = 0; i < 4; i++) {
        cv::line(img, vertices[i], vertices[(i+1)%4], color, thickness);
    }
}

// 使用
for (const auto& bar : lightBars) {
    drawRotatedRect(display, bar.rect, cv::Scalar(0, 255, 0), 2);
}
```

### 🎨 增强版（带中心点和文字）

```cpp
void drawLightBar(cv::Mat& img, const LightBar& bar, int id) {
    // 绘制旋转矩形
    cv::Point2f vertices[4];
    bar.rect.points(vertices);
    for (int i = 0; i < 4; i++) {
        cv::line(img, vertices[i], vertices[(i+1)%4], 
                 cv::Scalar(0, 255, 0), 2);
    }
    
    // 绘制中心点
    cv::circle(img, bar.rect.center, 5, cv::Scalar(0, 0, 255), -1);
    
    // 标注信息
    std::string text = "ID:" + std::to_string(id) + 
                       " R:" + std::to_string((int)bar.aspectRatio);
    cv::putText(img, text, 
                cv::Point(bar.rect.center.x + 10, bar.rect.center.y),
                cv::FONT_HERSHEY_SIMPLEX, 0.5, 
                cv::Scalar(255, 255, 255), 2);
}
```

---

## 9. cv::boundingRect() - 正矩形包围框

###  函数原型
```cpp
Rect cv::boundingRect(InputArray points);
```

### 基础用法

```cpp
for (const auto& contour : contours) {
    // 获取正矩形（水平/垂直边）
    cv::Rect bbox = cv::boundingRect(contour);
    
    // 绘制
    cv::rectangle(img, bbox, cv::Scalar(255, 0, 0), 2);
    
    // 裁剪ROI
    cv::Mat roi = img(bbox);
}
```

###  正矩形 vs 旋转矩形

```cpp
cv::Rect bbox = cv::boundingRect(contour);         // 正矩形
cv::RotatedRect rect = cv::minAreaRect(contour);   // 旋转矩形

// 正矩形：边平行于坐标轴，面积可能较大
// 旋转矩形：最小面积，但边可能倾斜

// 用途：
// - 正矩形：裁剪ROI、快速碰撞检测
// - 旋转矩形：精确描述灯条形状和角度
```

---

## 10. cv::fitEllipse() - 椭圆拟合（能量机关用）

###  函数原型
```cpp
RotatedRect cv::fitEllipse(InputArray points);
```

###  基础用法

```cpp
for (const auto& contour : contours) {
    // 至少需要5个点
    if (contour.size() < 5) continue;
    
    // 拟合椭圆
    cv::RotatedRect ellipse = cv::fitEllipse(contour);
    
    // 绘制椭圆
    cv::ellipse(img, ellipse, cv::Scalar(0, 255, 255), 2);
}
```

###  能量机关扇叶识别

```cpp
// 能量机关的R标是椭圆形
bool isEnergyRune(const std::vector<cv::Point>& contour) {
    if (contour.size() < 5) return false;
    
    cv::RotatedRect ellipse = cv::fitEllipse(contour);
    
    // 椭圆的长短轴比应该接近1（近似圆形）
    float ratio = ellipse.size.width / ellipse.size.height;
    if (ratio < 0.8 || ratio > 1.2) return false;
    
    // 面积合理
    double area = CV_PI * ellipse.size.width/2 * ellipse.size.height/2;
    if (area < 500 || area > 3000) return false;
    
    return true;
}
```

---

##  完整实战代码

### 完整的灯条检测系统

```cpp
#include <opencv2/opencv.hpp>
#include <vector>
#include <iostream>

// 灯条结构体
struct LightBar {
    cv::RotatedRect rect;
    double area;
    float aspectRatio;
    
    LightBar(const cv::RotatedRect& r, double a, float ar)
        : rect(r), area(a), aspectRatio(ar) {}
};

// 灯条检测函数
std::vector<LightBar> detectLightBars(const cv::Mat& binary, 
                                      const cv::Mat& display) {
    // 1. 查找轮廓
    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(binary.clone(), contours, 
                     cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);
    
    std::cout << "总轮廓数: " << contours.size() << std::endl;
    
    std::vector<LightBar> lightBars;
    
    // 2. 遍历筛选
    for (size_t i = 0; i < contours.size(); i++) {
        const auto& contour = contours[i];
        
        // 面积筛选
        double area = cv::contourArea(contour);
        if (area < 100) {
            std::cout << "轮廓" << i << ": 面积=" << area 
                      << "  太小" << std::endl;
            continue;
        }
        if (area > 5000) {
            std::cout << "轮廓" << i << ": 面积=" << area 
                      << " 太大" << std::endl;
            continue;
        }
        
        // 拟合旋转矩形
        cv::RotatedRect rect = cv::minAreaRect(contour);
        
        // 确保height是长边
        float width = rect.size.width;
        float height = rect.size.height;
        if (width > height) {
            std::swap(width, height);
        }
        
        // 长宽比筛选
        float aspectRatio = height / width;
        if (aspectRatio < 2.0) {
            std::cout << "轮廓" << i << ": 长宽比=" << aspectRatio 
                      << " 太矮" << std::endl;
            continue;
        }
        if (aspectRatio > 10.0) {
            std::cout << "轮廓" << i << ": 长宽比=" << aspectRatio 
                      << "太细" << std::endl;
            continue;
        }
        
        // 填充度筛选
        double rectArea = width * height;
        double fillRatio = area / rectArea;
        if (fillRatio < 0.5) {
            std::cout << "轮廓" << i << ": 填充度=" << fillRatio 
                      << "  太空" << std::endl;
            continue;
        }
        
        // 通过筛选！
        std::cout << "轮廓" << i << ":  灯条候选" << std::endl;
        std::cout << "    面积=" << area << ", 长宽比=" << aspectRatio 
                  << ", 填充度=" << fillRatio << std::endl;
        
        lightBars.emplace_back(rect, area, aspectRatio);
        
        // 绘制（调试用）
        if (!display.empty()) {
            cv::Point2f vertices[4];
            rect.points(vertices);
            for (int j = 0; j < 4; j++) {
                cv::line(display, vertices[j], vertices[(j+1)%4],
                         cv::Scalar(0, 255, 0), 2);
            }
            cv::circle(display, rect.center, 5, cv::Scalar(0, 0, 255), -1);
        }
    }
    
    std::cout << "\n最终找到 " << lightBars.size() << " 个灯条" << std::endl;
    return lightBars;
}

int main() {
    // 读取图像
    cv::Mat img = cv::imread("armor.jpg");
    if (img.empty()) {
        std::cerr << "无法读取图像" << std::endl;
        return -1;
    }
    
    // 颜色提取（假设已实现）
    cv::Mat binary = extractRedColor(img);
    
    // 形态学处理（假设已实现）
    binary = morphologyProcess(binary);
    
    // 灯条检测
    cv::Mat display = img.clone();
    std::vector<LightBar> lightBars = detectLightBars(binary, display);
    
    // 显示结果
    cv::imshow("原图", img);
    cv::imshow("二值图", binary);
    cv::imshow("检测结果", display);
    cv::waitKey(0);
    
    return 0;
}
```

---

##  常见问题排查

### 问题1: 找不到轮廓
```cpp
// 检查清单：
// 1. 二值图是否正确？
cv::imshow("binary", binary);  // 应该是黑白的

// 2. 前景是白色吗？
// findContours找的是白色区域！如果反了需要反转
cv::bitwise_not(binary, binary);

// 3. 图像是单通道吗？
std::cout << "通道数: " << binary.channels() << std::endl;  // 应该是1
```

### 问题2: 找到太多轮廓（都是噪点）
```cpp
// 解决方案：
// 1. 加强形态学处理
cv::morphologyEx(binary, binary, cv::MORPH_OPEN, kernel);

// 2. 提高面积阈值
if (area < 200) continue;  // 增大

// 3. 添加填充度筛选
double fillRatio = area / (width * height);
if (fillRatio < 0.6) continue;
```

### 问题3: 灯条被筛掉了
```cpp
// 调试步骤：
// 1. 打印每个轮廓的参数
for (size_t i = 0; i < contours.size(); i++) {
    double area = cv::contourArea(contours[i]);
    cv::RotatedRect rect = cv::minAreaRect(contours[i]);
    float ratio = rect.size.height / rect.size.width;
    std::cout << i << ": area=" << area << ", ratio=" << ratio << std::endl;
}

// 2. 放宽筛选条件
if (aspectRatio < 1.5 || aspectRatio > 15.0) continue;  // 放宽范围

// 3. 可视化被筛掉的轮廓
cv::drawContours(rejected_img, contours, i, cv::Scalar(0,0,255), 2);
```

### 问题4: 旋转矩形角度不对
```cpp
// OpenCV的angle有时不符合预期
// 解决方案：自己计算角度
cv::Point2f vertices[4];
rect.points(vertices);

// 计算长边的角度
cv::Point2f edge = vertices[1] - vertices[0];
float angle = std::atan2(edge.y, edge.x) * 180 / CV_PI;
```

---
