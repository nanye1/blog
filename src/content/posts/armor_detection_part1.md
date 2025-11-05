---
title: RM装甲板识别 - 05灯条配对
published: 2025-10-26
description: 无
tags: [RM,学习]
category: RM
---

##  核心API清单

| API | 作用 |
|-----|------|
| `cv::norm()` | 计算两点距离 | 
| `std::abs()` | 绝对值 | 
| `cv::line()` | 绘制直线 | 
| `cv::rectangle()` | 绘制矩形 |
| `cv::putText()` | 绘制文字 |

---


##  装甲板的四大判据

| 判据 | 物理意义 | 合理范围 |
|------|----------|----------|
| 距离 | 两灯条中心间距 | 1.5~4倍灯条长度 |
| 角度差 | 两灯条是否平行 | < 10° |
| 长度比 | 两灯条长度比 | 1.0~2.0 |
| 高度差 | 两灯条y坐标差 | < 0.5倍灯条长度 |

---

## 1️ 距离判断：cv::norm()


###  计算两点欧氏距离
```cpp
cv::Point2f p1(100, 200);
cv::Point2f p2(400, 500);

double distance = cv::norm(p1 - p2);

```

###  应用：计算灯条间距
```cpp
// 两个灯条的中心点
cv::Point2f center1 = bar1.rect.center;
cv::Point2f center2 = bar2.rect.center;

// 计算距离-
float distance = cv::norm(center1 - center2);

// 判断距离是否合理（参数随便给的）
float avgLength = (bar1.rect.size.height + bar2.rect.size.height) / 2;
if (distance < avgLength * 1.5 || distance > avgLength * 4.0) {
    // 距离不合理，不是装甲板
    return false;
}
```

---

## 2️ 角度差判断

###  基础用法
```cpp
float angle1 = bar1.rect.angle;
float angle2 = bar2.rect.angle;

// 计算角度差的绝对值
float angleDiff = std::abs(angle1 - angle2);

// 判断是否平行
if (angleDiff > 10.0) {
    // 角度差太大，不平行
    return false;
}
```

###  角度差的陷阱
```cpp
// 问题：OpenCV的angle范围是-90°到0°
// 如果一个灯条angle=-5°，另一个是-85°
// 直接相减：|-5 - (-85)| = 80°  实际上它们可能是平行的！

// 解决方案：归一化角度
float normalizeAngle(float angle) {
    // 将angle转换到0-90范围
    angle = std::abs(angle);
    if (angle > 90) angle = 180 - angle;
    return angle;
}

float angle1 = normalizeAngle(bar1.rect.angle);
float angle2 = normalizeAngle(bar2.rect.angle);
float angleDiff = std::abs(angle1 - angle2);
```

---

## 3️ 长度比判断

###  基础用法
```cpp
float length1 = bar1.rect.size.height;  // 假设已确保height是长边
float length2 = bar2.rect.size.height;

// 计算长度比（大/小）
float lengthRatio = std::max(length1, length2) / std::min(length1, length2);

// 判断
if (lengthRatio > 2.0) {
    // 长度相差超过2倍，不是装甲板
    return false;
}
```

---

## 4️ 高度差判断

###  基础用法
```cpp
float centerY1 = bar1.rect.center.y;
float centerY2 = bar2.rect.center.y;

// 计算y坐标差的绝对值
float heightDiff = std::abs(centerY1 - centerY2);

// 用平均长度作为参考
float avgLength = (bar1.rect.size.height + bar2.rect.size.height) / 2;

// 判断高度差是否合理
if (heightDiff > avgLength * 0.5) {
    // 高度差太大，不在同一水平线
    return false;
}
```

---

##  数据结构设计

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <algorithm>

// 灯条结构体
struct LightBar {
    cv::RotatedRect rect;
    cv::Point2f center;
    float length;
    float angle;
    
    LightBar(const cv::RotatedRect& r) : rect(r) {
        center = r.center;
        length = std::max(r.size.width, r.size.height);
        angle = r.angle;
        
        // 确保长边是height
        if (r.size.width > r.size.height) {
            angle += 90;
        }
    }
};

// 装甲板结构体
struct ArmorPlate {
    LightBar leftBar;
    LightBar rightBar;
    cv::Point2f center;
    float width;
    float height;
    
    ArmorPlate(const LightBar& left, const LightBar& right) 
        : leftBar(left), rightBar(right) {
        // 计算装甲板中心
        center.x = (left.center.x + right.center.x) / 2;
        center.y = (left.center.y + right.center.y) / 2;
        
        // 计算宽高
        width = cv::norm(left.center - right.center);
        height = (left.length + right.length) / 2;
    }
};
```
---
##  核心判断函数

### 归一化角度函数
```cpp
// 归一化角度到0-90度范围
float normalizeAngle(float angle) {
    angle = std::abs(angle);
    if (angle > 90) {
        angle = 180 - angle;
    }
    return angle;
}
```

### 判断两个灯条能否组成装甲板
```cpp
bool isValidArmorPair(const LightBar& bar1, const LightBar& bar2) {
    // ============ 判据1：距离检查 ============
    float distance = cv::norm(bar1.center - bar2.center);
    float avgLength = (bar1.length + bar2.length) / 2;
    
    // 距离应该在1.5~4倍平均长度之间
    if (distance < avgLength * 1.5) {
        std::cout << " 距离太近: " << distance 
                  << " < " << avgLength * 1.5 << std::endl;
        return false;
    }
    if (distance > avgLength * 4.0) {
        std::cout << " 距离太远: " << distance 
                  << " > " << avgLength * 4.0 << std::endl;
        return false;
    }
    
    // ============ 判据2：角度检查 ============
    float angle1 = normalizeAngle(bar1.angle);
    float angle2 = normalizeAngle(bar2.angle);
    float angleDiff = std::abs(angle1 - angle2);
    
    // 角度差应小于10度
    if (angleDiff > 10.0) {
        std::cout << " 角度差太大: " << angleDiff << "°" << std::endl;
        return false;
    }
    
    // ============ 判据3：长度比检查 ============
    float maxLength = std::max(bar1.length, bar2.length);
    float minLength = std::min(bar1.length, bar2.length);
    float lengthRatio = maxLength / minLength;
    
    // 长度比应小于2.0
    if (lengthRatio > 2.0) {
        std::cout << " 长度比过大: " << lengthRatio << std::endl;
        return false;
    }
    
    // ============ 判据4：高度差检查 ============
    float heightDiff = std::abs(bar1.center.y - bar2.center.y);
    
    // 高度差应小于平均长度的50%
    if (heightDiff > avgLength * 0.5) {
        std::cout << " 高度差太大: " << heightDiff 
                  << " > " << avgLength * 0.5 << std::endl;
        return false;
    }
    
    // ============ 通过所有判据 ============
    std::cout << "[通过] 距离:" << distance 
              << " 角度差:" << angleDiff 
              << " 长度比:" << lengthRatio 
              << " 高度差:" << heightDiff << std::endl;
    return true;
}
```

---

##  配对主函数

```cpp
// 从灯条列表中配对出所有装甲板
std::vector<ArmorPlate> findArmorPlates(const std::vector<LightBar>& lightBars) {
    std::vector<ArmorPlate> armorPlates;
    
    std::cout << "\n========== 开始配对 ==========" << std::endl;
    std::cout << "灯条数量: " << lightBars.size() << std::endl;
    
    // 双重循环遍历所有灯条对
    for (size_t i = 0; i < lightBars.size(); i++) {
        for (size_t j = i + 1; j < lightBars.size(); j++) {
            const LightBar& bar1 = lightBars[i];
            const LightBar& bar2 = lightBars[j];
            
            std::cout << "\n测试灯条对 (" << i << ", " << j << "):" << std::endl;
            
            // 判断能否组成装甲板
            if (isValidArmorPair(bar1, bar2)) {
                // 确保左边的灯条在左侧
                if (bar1.center.x < bar2.center.x) {
                    armorPlates.emplace_back(bar1, bar2);
                } else {
                    armorPlates.emplace_back(bar2, bar1);
                }
                std::cout << " 找到装甲板！" << std::endl;
            }
        }
    }
    
    std::cout << "\n========== 配对完成 ==========" << std::endl;
    std::cout << "找到装甲板数量: " << armorPlates.size() << std::endl;
    
    return armorPlates;
}
```

---

## 可视化绘制函数

### 绘制单个装甲板
```cpp
void drawArmorPlate(cv::Mat& image, const ArmorPlate& armor, int index) {
    // 1. 绘制左侧灯条（绿色）
    cv::Point2f vertices1[4];
    armor.leftBar.rect.points(vertices1);
    for (int i = 0; i < 4; i++) {
        cv::line(image, vertices1[i], vertices1[(i+1)%4], 
                 cv::Scalar(0, 255, 0), 2);
    }
    
    // 2. 绘制右侧灯条（绿色）
    cv::Point2f vertices2[4];
    armor.rightBar.rect.points(vertices2);
    for (int i = 0; i < 4; i++) {
        cv::line(image, vertices2[i], vertices2[(i+1)%4], 
                 cv::Scalar(0, 255, 0), 2);
    }
    
    // 3. 绘制连接线（黄色）
    cv::line(image, armor.leftBar.center, armor.rightBar.center, 
             cv::Scalar(0, 255, 255), 2);
    
    // 4. 绘制装甲板外框（蓝色）
    cv::Point2f topLeft = vertices1[0];
    cv::Point2f topRight = vertices2[1];
    cv::Point2f bottomRight = vertices2[2];
    cv::Point2f bottomLeft = vertices1[3];
    
    cv::line(image, topLeft, topRight, cv::Scalar(255, 0, 0), 2);
    cv::line(image, topRight, bottomRight, cv::Scalar(255, 0, 0), 2);
    cv::line(image, bottomRight, bottomLeft, cv::Scalar(255, 0, 0), 2);
    cv::line(image, bottomLeft, topLeft, cv::Scalar(255, 0, 0), 2);
    
    // 5. 绘制中心点（红色）
    cv::circle(image, armor.center, 5, cv::Scalar(0, 0, 255), -1);
    
    // 6. 显示装甲板信息
    std::string info = "Armor#" + std::to_string(index);
    cv::putText(image, info, 
                cv::Point(armor.center.x - 30, armor.center.y - 15),
                cv::FONT_HERSHEY_SIMPLEX, 0.6, 
                cv::Scalar(255, 255, 255), 2);
    
    // 7. 显示宽度信息
    std::string sizeInfo = "W:" + std::to_string((int)armor.width);
    cv::putText(image, sizeInfo, 
                cv::Point(armor.center.x - 25, armor.center.y + 5),
                cv::FONT_HERSHEY_SIMPLEX, 0.4, 
                cv::Scalar(255, 255, 255), 1);
}
```

### 绘制所有装甲板
```cpp
void drawAllArmorPlates(cv::Mat& image, const std::vector<ArmorPlate>& armorPlates) {
    for (size_t i = 0; i < armorPlates.size(); i++) {
        drawArmorPlate(image, armorPlates[i], i);
    }
    
    // 在左上角显示统计信息
    std::string stats = "Armors: " + std::to_string(armorPlates.size());
    cv::putText(image, stats, cv::Point(10, 30),
                cv::FONT_HERSHEY_SIMPLEX, 1.0, 
                cv::Scalar(0, 255, 255), 2);
}
```

---

##  完整主函数

```cpp
int main() {
    // 1. 读取图片
    cv::Mat src = cv::imread("armor_test.jpg");
    if (src.empty()) {
        std::cerr << " 无法读取图片！" << std::endl;
        return -1;
    }
    
    std::cout << " 图片读取成功: " << src.cols << "x" << src.rows << std::endl;
    
    // 2. 预处理（这里假设你已经有灯条检测函数）
    std::vector<LightBar> lightBars = detectLightBars(src);
    
    std::cout << " 检测到 " << lightBars.size() << " 个灯条" << std::endl;
    
    // 3. 装甲板配对
    std::vector<ArmorPlate> armorPlates = findArmorPlates(lightBars);
    
    // 4. 绘制结果
    cv::Mat result = src.clone();
    drawAllArmorPlates(result, armorPlates);
    
    // 5. 显示和保存
    cv::imshow("原图", src);
    cv::imshow("装甲板检测结果", result);
    cv::imwrite("armor_result.jpg", result);
    
    std::cout << "\n========== 最终结果 ==========" << std::endl;
    std::cout << " 成功检测到 " << armorPlates.size() << " 个装甲板" << std::endl;
    std::cout << "结果已保存到 armor_result.jpg" << std::endl;
    
    cv::waitKey(0);
    return 0;
}
```

---


##  完整可运行示例

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>

// ========== 数据结构 ==========
struct LightBar {
    cv::RotatedRect rect;
    cv::Point2f center;
    float length;
    float angle;
    
    LightBar() : length(0), angle(0) {}
    
    LightBar(const cv::RotatedRect& r) : rect(r) {
        center = r.center;
        length = std::max(r.size.width, r.size.height);
        angle = r.angle;
        if (r.size.width > r.size.height) {
            angle += 90;
        }
    }
};

struct ArmorPlate {
    LightBar leftBar;
    LightBar rightBar;
    cv::Point2f center;
    float width;
    float height;
    
    ArmorPlate(const LightBar& left, const LightBar& right) 
        : leftBar(left), rightBar(right) {
        center.x = (left.center.x + right.center.x) / 2;
        center.y = (left.center.y + right.center.y) / 2;
        width = cv::norm(left.center - right.center);
        height = (left.length + right.length) / 2;
    }
};

// ========== 核心函数 ==========
float normalizeAngle(float angle) {
    angle = std::abs(angle);
    if (angle > 90) angle = 180 - angle;
    return angle;
}

bool isValidArmorPair(const LightBar& bar1, const LightBar& bar2) {
    float distance = cv::norm(bar1.center - bar2.center);
    float avgLength = (bar1.length + bar2.length) / 2;
    
    if (distance < avgLength * 1.5 || distance > avgLength * 4.0) return false;
    
    float angle1 = normalizeAngle(bar1.angle);
    float angle2 = normalizeAngle(bar2.angle);
    float angleDiff = std::abs(angle1 - angle2);
    if (angleDiff > 10.0) return false;
    
    float lengthRatio = std::max(bar1.length, bar2.length) / 
                        std::min(bar1.length, bar2.length);
    if (lengthRatio > 2.0) return false;
    
    float heightDiff = std::abs(bar1.center.y - bar2.center.y);
    if (heightDiff > avgLength * 0.5) return false;
    
    return true;
}

std::vector<ArmorPlate> findArmorPlates(const std::vector<LightBar>& lightBars) {
    std::vector<ArmorPlate> armorPlates;
    
    for (size_t i = 0; i < lightBars.size(); i++) {
        for (size_t j = i + 1; j < lightBars.size(); j++) {
            if (isValidArmorPair(lightBars[i], lightBars[j])) {
                if (lightBars[i].center.x < lightBars[j].center.x) {
                    armorPlates.emplace_back(lightBars[i], lightBars[j]);
                } else {
                    armorPlates.emplace_back(lightBars[j], lightBars[i]);
                }
            }
        }
    }
    
    return armorPlates;
}

void drawArmorPlate(cv::Mat& image, const ArmorPlate& armor, int index) {
    cv::Point2f v1[4], v2[4];
    armor.leftBar.rect.points(v1);
    armor.rightBar.rect.points(v2);
    
    for (int i = 0; i < 4; i++) {
        cv::line(image, v1[i], v1[(i+1)%4], cv::Scalar(0, 255, 0), 2);
        cv::line(image, v2[i], v2[(i+1)%4], cv::Scalar(0, 255, 0), 2);
    }
    
    cv::line(image, armor.leftBar.center, armor.rightBar.center, 
             cv::Scalar(0, 255, 255), 2);
    cv::circle(image, armor.center, 5, cv::Scalar(0, 0, 255), -1);
    
    std::string info = "Armor#" + std::to_string(index);
    cv::putText(image, info, cv::Point(armor.center.x - 30, armor.center.y - 15),
                cv::FONT_HERSHEY_SIMPLEX, 0.6, cv::Scalar(255, 255, 255), 2);
}

// ========== 主函数 ==========
int main() {
    cv::Mat src = cv::imread("armor_test.jpg");
    if (src.empty()) {
        std::cerr << "无法读取图片！" << std::endl;
        return -1;
    }
    
    // 假设已有灯条检测函数
    // std::vector<LightBar> lightBars = detectLightBars(src);
    std::vector<LightBar> lightBars;  // 示例数据
    
    std::vector<ArmorPlate> armorPlates = findArmorPlates(lightBars);
    
    cv::Mat result = src.clone();
    for (size_t i = 0; i < armorPlates.size(); i++) {
        drawArmorPlate(result, armorPlates[i], i);
    }
    
    std::cout << "检测到 " << armorPlates.size() << " 个装甲板" << std::endl;
    cv::imshow("结果", result);
    cv::waitKey(0);
    
    return 0;
}
```
##  性能优化

### 优化1：提前剔除明显不合理的灯条对

```cpp
// 快速预判（避免不必要的计算）
bool quickReject(const LightBar& bar1, const LightBar& bar2) {
    // 如果x坐标差太小，肯定不是装甲板（两灯条重叠）
    float xDiff = std::abs(bar1.center.x - bar2.center.x);
    if (xDiff < 10) return true;
    
    // 如果x坐标差太大，距离肯定超标
    float maxLength = std::max(bar1.length, bar2.length);
    if (xDiff > maxLength * 5) return true;
    
    return false;
}

std::vector<ArmorPlate> findArmorPlatesOptimized(const std::vector<LightBar>& lightBars) {
    std::vector<ArmorPlate> armorPlates;
    
    for (size_t i = 0; i < lightBars.size(); i++) {
        for (size_t j = i + 1; j < lightBars.size(); j++) {
            // 快速预判
            if (quickReject(lightBars[i], lightBars[j])) {
                continue;
            }
            
            // 详细判断
            if (isValidArmorPair(lightBars[i], lightBars[j])) {
                if (lightBars[i].center.x < lightBars[j].center.x) {
                    armorPlates.emplace_back(lightBars[i], lightBars[j]);
                } else {
                    armorPlates.emplace_back(lightBars[j], lightBars[i]);
                }
            }
        }
    }
    
    return armorPlates;
}
```

### 优化2：按x坐标排序（减少比较次数）

```cpp
std::vector<ArmorPlate> findArmorPlatesSorted(std::vector<LightBar> lightBars) {
    // 按x坐标排序
    std::sort(lightBars.begin(), lightBars.end(), 
              [](const LightBar& a, const LightBar& b) {
                  return a.center.x < b.center.x;
              });
    
    std::vector<ArmorPlate> armorPlates;
    
    for (size_t i = 0; i < lightBars.size(); i++) {
        for (size_t j = i + 1; j < lightBars.size(); j++) {
            // 如果j灯条的x坐标已经太远，后面的更远，直接break
            float xDiff = lightBars[j].center.x - lightBars[i].center.x;
            if (xDiff > lightBars[i].length * 5) {
                break;
            }
            
            if (isValidArmorPair(lightBars[i], lightBars[j])) {
                armorPlates.emplace_back(lightBars[i], lightBars[j]);
            }
        }
    }
    
    return armorPlates;
}
```

---
##  进阶功能

### 处理倾斜装甲板

当装甲板整体倾斜时，需要调整高度差判据：

```cpp
// 计算两灯条连线与水平线的夹角
float calculateTiltAngle(const LightBar& bar1, const LightBar& bar2) {
    float dx = bar2.center.x - bar1.center.x;
    float dy = bar2.center.y - bar1.center.y;
    return std::atan2(dy, dx) * 180.0 / CV_PI;
}

// 改进的高度差判据
bool isValidArmorPair_Advanced(const LightBar& bar1, const LightBar& bar2) {
    // ... 前面的判据 ...
    
    // 计算倾斜角度
    float tiltAngle = std::abs(calculateTiltAngle(bar1, bar2));
    
    // 如果倾斜角度大，放宽高度差要求
    float heightThreshold = avgLength * 0.5;
    if (tiltAngle > 15.0) {
        heightThreshold = avgLength * 0.8;  // 放宽到0.8倍
    }
    
    if (heightDiff > heightThreshold) {
        return false;
    }
    
    return true;
}
```

### 区分大小装甲板

根据宽高比区分大小装甲板：

```cpp
enum ArmorType {
    SMALL_ARMOR,  // 小装甲板
    LARGE_ARMOR   // 大装甲板
};

struct ArmorPlate {
    LightBar leftBar;
    LightBar rightBar;
    cv::Point2f center;
    float width;
    float height;
    ArmorType type;  // 新增：装甲板类型
    
    ArmorPlate(const LightBar& left, const LightBar& right) 
        : leftBar(left), rightBar(right) {
        center.x = (left.center.x + right.center.x) / 2;
        center.y = (left.center.y + right.center.y) / 2;
        width = cv::norm(left.center - right.center);
        height = (left.length + right.length) / 2;
        
        // 根据宽高比判断类型
        float aspectRatio = width / height;
        if (aspectRatio > 3.0) {
            type = LARGE_ARMOR;  // 宽高比大，大装甲板
        } else {
            type = SMALL_ARMOR;  // 宽高比小，小装甲板
        }
    }
    
    std::string getTypeName() const {
        return (type == SMALL_ARMOR) ? "Small" : "Large";
    }
};

// 绘制时显示类型
void drawArmorPlate(cv::Mat& image, const ArmorPlate& armor, int index) {
    // ... 原来的绘制代码 ...
    
    // 显示类型
    std::string typeInfo = armor.getTypeName();
    cv::Scalar color = (armor.type == SMALL_ARMOR) ? 
                       cv::Scalar(0, 255, 0) : cv::Scalar(255, 0, 255);
    cv::putText(image, typeInfo, 
                cv::Point(armor.center.x - 30, armor.center.y + 20),
                cv::FONT_HERSHEY_SIMPLEX, 0.5, color, 2);
}
```

### 置信度评分系统

给每个装甲板打分，选出最佳目标：

```cpp
struct ArmorPlate {
    LightBar leftBar;
    LightBar rightBar;
    cv::Point2f center;
    float width;
    float height;
    float confidence;  // 置信度 0-100
    
    ArmorPlate(const LightBar& left, const LightBar& right) 
        : leftBar(left), rightBar(right) {
        center.x = (left.center.x + right.center.x) / 2;
        center.y = (left.center.y + right.center.y) / 2;
        width = cv::norm(left.center - right.center);
        height = (left.length + right.length) / 2;
        
        // 计算置信度
        confidence = calculateConfidence(left, right);
    }
    
private:
    float calculateConfidence(const LightBar& bar1, const LightBar& bar2) {
        float score = 100.0;
        
        // 1. 角度差越小越好（满分20）
        float angle1 = normalizeAngle(bar1.angle);
        float angle2 = normalizeAngle(bar2.angle);
        float angleDiff = std::abs(angle1 - angle2);
        float angleScore = std::max(0.0f, 20.0f - angleDiff * 2.0f);
        
        // 2. 长度比越接近1越好（满分20）
        float lengthRatio = std::max(bar1.length, bar2.length) / 
                           std::min(bar1.length, bar2.length);
        float lengthScore = std::max(0.0f, 20.0f - (lengthRatio - 1.0f) * 10.0f);
        
        // 3. 高度差越小越好（满分20）
        float avgLength = (bar1.length + bar2.length) / 2;
        float heightDiff = std::abs(bar1.center.y - bar2.center.y);
        float heightScore = std::max(0.0f, 20.0f - heightDiff / avgLength * 40.0f);
        
        // 4. 距离合理性（满分20）
        float distance = cv::norm(bar1.center - bar2.center);
        float idealDist = avgLength * 2.5;  // 理想距离
        float distDiff = std::abs(distance - idealDist);
        float distScore = std::max(0.0f, 20.0f - distDiff / avgLength * 10.0f);
        
        // 5. 面积大小（满分20）- 面积越大越好
        float area = width * height;
        float areaScore = std::min(20.0f, area / 10000.0f * 20.0f);
        
        score = angleScore + lengthScore + heightScore + distScore + areaScore;
        return std::min(100.0f, score);
    }
};

// 选择最佳装甲板
ArmorPlate selectBestArmor(const std::vector<ArmorPlate>& armorPlates) {
    if (armorPlates.empty()) {
        throw std::runtime_error("没有装甲板可选择！");
    }
    
    // 找出置信度最高的装甲板
    auto bestArmor = std::max_element(armorPlates.begin(), armorPlates.end(),
        [](const ArmorPlate& a, const ArmorPlate& b) {
            return a.confidence < b.confidence;
        });
    
    std::cout << "最佳装甲板置信度: " << bestArmor->confidence << std::endl;
    return *bestArmor;
}

// 绘制时显示置信度
void drawArmorPlateWithConfidence(cv::Mat& image, const ArmorPlate& armor, int index) {
    // ... 原来的绘制代码 ...
    
    // 显示置信度
    std::string confInfo = "Conf:" + std::to_string((int)armor.confidence);
    cv::putText(image, confInfo, 
                cv::Point(armor.center.x - 30, armor.center.y + 20),
                cv::FONT_HERSHEY_SIMPLEX, 0.5, 
                cv::Scalar(255, 255, 0), 1);
}
```

---

##  实战技巧

### 动态参数调整

根据距离动态调整判据：

```cpp
bool isValidArmorPair_Dynamic(const LightBar& bar1, const LightBar& bar2, 
                               float cameraDistance) {
    float avgLength = (bar1.length + bar2.length) / 2;
    
    // 根据相机距离调整参数
    float distanceMin, distanceMax, angleDiffMax;
    
    if (cameraDistance < 3.0) {  // 近距离（3米内）
        distanceMin = avgLength * 2.0;
        distanceMax = avgLength * 3.5;
        angleDiffMax = 5.0;
    } else {  // 远距离（3米外）
        distanceMin = avgLength * 1.5;
        distanceMax = avgLength * 4.5;
        angleDiffMax = 12.0;
    }
    
    float distance = cv::norm(bar1.center - bar2.center);
    if (distance < distanceMin || distance > distanceMax) {
        return false;
    }
    
    // ... 其他判据 ...
    
    return true;
}
```

### 处理边界情况

```cpp
bool isValidArmorPair_Robust(const LightBar& bar1, const LightBar& bar2) {
    // 检查输入有效性
    if (bar1.length <= 0 || bar2.length <= 0) {
        std::cerr << "警告：灯条长度无效！" << std::endl;
        return false;
    }
    
    if (bar1.center == bar2.center) {
        std::cerr << "警告：两灯条中心重合！" << std::endl;
        return false;
    }
    
    // 避免除零错误
    float minLength = std::min(bar1.length, bar2.length);
    if (minLength < 1e-6) {
        return false;
    }
    
    // 正常判断流程...
    
    return true;
}
```

### 帧稳定性检测

```cpp
class ArmorTracker {
private:
    std::vector<ArmorPlate> historyArmors;  // 历史帧的装甲板
    const int HISTORY_SIZE = 5;  // 保持最近5帧
    
public:
    // 添加新帧的装甲板
    void addFrame(const std::vector<ArmorPlate>& armors) {
        if (historyArmors.size() >= HISTORY_SIZE) {
            historyArmors.erase(historyArmors.begin());
        }
        historyArmors.insert(historyArmors.end(), armors.begin(), armors.end());
    }
    
    // 获取稳定的装甲板（连续出现多帧）
    std::vector<ArmorPlate> getStableArmors() {
        // 统计每个位置出现的次数
        std::vector<ArmorPlate> stableArmors;
        
        // 实际应该实现位置聚类和计数
        // 这里简化处理
        
        return stableArmors;
    }
};
```

### 参数调优助手

创建滑动条实时调整参数：

```cpp
// 全局参数
int g_distanceMin = 15;  // 1.5 * 10
int g_distanceMax = 40;  // 4.0 * 10
int g_angleDiffMax = 10;
int g_lengthRatioMax = 20;  // 2.0 * 10
int g_heightDiffMax = 5;  // 0.5 * 10

void createParamWindow() {
    cv::namedWindow("参数调整");
    
    cv::createTrackbar("距离最小(x0.1)", "参数调整", &g_distanceMin, 50);
    cv::createTrackbar("距离最大(x0.1)", "参数调整", &g_distanceMax, 100);
    cv::createTrackbar("角度差最大", "参数调整", &g_angleDiffMax, 30);
    cv::createTrackbar("长度比最大(x0.1)", "参数调整", &g_lengthRatioMax, 50);
    cv::createTrackbar("高度差最大(x0.1)", "参数调整", &g_heightDiffMax, 20);
}

bool isValidArmorPair_Tunable(const LightBar& bar1, const LightBar& bar2) {
    float distance = cv::norm(bar1.center - bar2.center);
    float avgLength = (bar1.length + bar2.length) / 2;
    
    // 使用全局参数
    float distanceMin = g_distanceMin / 10.0f * avgLength;
    float distanceMax = g_distanceMax / 10.0f * avgLength;
    
    if (distance < distanceMin || distance > distanceMax) {
        return false;
    }
    
    // ... 其他判据使用全局参数 ...
    
    return true;
}
```

---

##  完整代码示例（可直接运行）

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <algorithm>

// ========== 数据结构 ==========
struct LightBar {
    cv::RotatedRect rect;
    cv::Point2f center;
    float length;
    float angle;
    
    LightBar() : length(0), angle(0) {}
    
    LightBar(const cv::RotatedRect& r) : rect(r) {
        center = r.center;
        length = std::max(r.size.width, r.size.height);
        angle = r.angle;
        if (r.size.width > r.size.height) {
            angle += 90;
        }
    }
};

struct ArmorPlate {
    LightBar leftBar;
    LightBar rightBar;
    cv::Point2f center;
    float width;
    float height;
    
    ArmorPlate(const LightBar& left, const LightBar& right) 
        : leftBar(left), rightBar(right) {
        center.x = (left.center.x + right.center.x) / 2;
        center.y = (left.center.y + right.center.y) / 2;
        width = cv::norm(left.center - right.center);
        height = (left.length + right.length) / 2;
    }
};

// ========== 工具函数 ==========
float normalizeAngle(float angle) {
    angle = std::abs(angle);
    if (angle > 90) {
        angle = 180 - angle;
    }
    return angle;
}

// ========== 核心判断 ==========
bool isValidArmorPair(const LightBar& bar1, const LightBar& bar2) {
    // 判据1：距离
    float distance = cv::norm(bar1.center - bar2.center);
    float avgLength = (bar1.length + bar2.length) / 2;
    if (distance < avgLength * 1.5 || distance > avgLength * 4.0) {
        return false;
    }
    
    // 判据2：角度
    float angle1 = normalizeAngle(bar1.angle);
    float angle2 = normalizeAngle(bar2.angle);
    float angleDiff = std::abs(angle1 - angle2);
    if (angleDiff > 10.0) {
        return false;
    }
    
    // 判据3：长度比
    float lengthRatio = std::max(bar1.length, bar2.length) / 
                        std::min(bar1.length, bar2.length);
    if (lengthRatio > 2.0) {
        return false;
    }
    
    // 判据4：高度差
    float heightDiff = std::abs(bar1.center.y - bar2.center.y);
    if (heightDiff > avgLength * 0.5) {
        return false;
    }
    
    return true;
}

// ========== 配对函数 ==========
std::vector<ArmorPlate> findArmorPlates(const std::vector<LightBar>& lightBars) {
    std::vector<ArmorPlate> armorPlates;
    
    for (size_t i = 0; i < lightBars.size(); i++) {
        for (size_t j = i + 1; j < lightBars.size(); j++) {
            if (isValidArmorPair(lightBars[i], lightBars[j])) {
                if (lightBars[i].center.x < lightBars[j].center.x) {
                    armorPlates.emplace_back(lightBars[i], lightBars[j]);
                } else {
                    armorPlates.emplace_back(lightBars[j], lightBars[i]);
                }
            }
        }
    }
    
    return armorPlates;
}

// ========== 可视化 ==========
void drawArmorPlate(cv::Mat& image, const ArmorPlate& armor, int index) {
    // 绘制左侧灯条
    cv::Point2f v1[4];
    armor.leftBar.rect.points(v1);
    for (int i = 0; i < 4; i++) {
        cv::line(image, v1[i], v1[(i+1)%4], cv::Scalar(0, 255, 0), 2);
    }
    
    // 绘制右侧灯条
    cv::Point2f v2[4];
    armor.rightBar.rect.points(v2);
    for (int i = 0; i < 4; i++) {
        cv::line(image, v2[i], v2[(i+1)%4], cv::Scalar(0, 255, 0), 2);
    }
    
    // 绘制连接线
    cv::line(image, armor.leftBar.center, armor.rightBar.center, 
             cv::Scalar(0, 255, 255), 2);
    
    // 绘制中心点
    cv::circle(image, armor.center, 5, cv::Scalar(0, 0, 255), -1);
    
    // 显示信息
    std::string info = "Armor#" + std::to_string(index);
    cv::putText(image, info, 
                cv::Point(armor.center.x - 30, armor.center.y - 15),
                cv::FONT_HERSHEY_SIMPLEX, 0.6, 
                cv::Scalar(255, 255, 255), 2);
}

// ========== 主函数 ==========
int main() {
    // 读取图片
    cv::Mat src = cv::imread("armor_test.jpg");
    if (src.empty()) {
        std::cerr << "无法读取图片！" << std::endl;
        return -1;
    }
    
    // 这里需要调用之前的灯条检测函数
    // std::vector<LightBar> lightBars = detectLightBars(src);
    
    // 示例：手动创建测试数据
    std::vector<LightBar> lightBars;
    // TODO: 添加测试灯条
    
    // 装甲板配对
    std::vector<ArmorPlate> armorPlates = findArmorPlates(lightBars);
    
    // 绘制结果
    cv::Mat result = src.clone();
    for (size_t i = 0; i < armorPlates.size(); i++) {
        drawArmorPlate(result, armorPlates[i], i);
    }
    
    // 显示
    std::cout << "检测到 " << armorPlates.size() << " 个装甲板" << std::endl;
    cv::imshow("结果", result);
    cv::waitKey(0);
    
    return 0;
}
```
