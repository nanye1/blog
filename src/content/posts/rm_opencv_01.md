---
title: RM装甲板识别 - 01 图像读取与显示
published: 2025-10-23
description: 无
tags: [RM,学习]
category: RM
---

## 写到现在发现自己写的太垃圾了，详见
- https://harry-hhj.github.io/posts/RM-Tutorial-3-Getting-Started-with-OpenCV/
## 本阶段核心API清单

| API | 作用 | 
|-----|------|
| `cv::imread()` | 读取图片到内存 | 
| `cv::imshow()` | 显示图片窗口 | 
| `cv::waitKey()` | 等待按键 | 
| `cv::imwrite()` | 保存图片 | 
| `cv::Mat` | 图像数据类型 | 
| `cv::VideoCapture` | 打开相机/视频 | 

---

## 1. cv::imread() - 读取图片


###  参数说明

- `filename`    图片路径（相对或绝对路径） 
-`flags` 读取模式（见下表） 

**flags常用值:**
- `cv::IMREAD_COLOR` (默认) - 读取彩色图，忽略透明度
- `cv::IMREAD_GRAYSCALE` - 转为灰度图
- `cv::IMREAD_UNCHANGED` - 包含Alpha通道

###  基础用法
```cpp

    // 读取彩色图（装甲板识别用这个）
    cv::Mat img = cv::imread("armor.jpg", cv::IMREAD_COLOR);
    
    //  必须检查是否读取成功，不检查后续操作会崩溃
    if (img.empty()) {
        std::cout << " 图片读取失败！" << std::endl;
        return -1;
    }
    
    // 打印图片信息
    std::cout << " 图片读取成功" << std::endl;
    std::cout << "   尺寸: " << img.cols << " x " << img.rows << std::endl;
    std::cout << "   通道数: " << img.channels() << std::endl;

```

###  输出示例
```
 图片读取成功
   尺寸: 1280 x 720
   通道数: 3
```
### 注意路径的写法

```cpp
cv::Mat img = cv::imread("/home/user/img.jpg");     // 绝对路径
cv::Mat img = cv::imread("img.jpg");       //相对路径

```

> **OpenCV读取的图片是BGR格式，不是RGB！**  
> 这在后续颜色识别时非常重要。如果你要转RGB需要用 `cv::cvtColor()`

---

## 2. cv::imshow() - 显示图片

###  参数说明

- `winname`（自己起名） 
- `mat` 要显示的图像 

### 基础用法
```cpp
cv::Mat img = cv::imread("armor.jpg");

// 显示图片
cv::imshow("原图", img);

//  必须配合waitKey()，否则窗口闪现即消失
cv::waitKey(0);  // 0表示无限等待，直到按任意键

// 关闭所有窗口
cv::destroyAllWindows();
```

###  显示多个窗口
```cpp
cv::Mat img1 = cv::imread("red_armor.jpg");
cv::Mat img2 = cv::imread("blue_armor.jpg");

cv::imshow("红方装甲板", img1);
cv::imshow("蓝方装甲板", img2);

cv::waitKey(0);
cv::destroyAllWindows();
```

---

## 3. cv::waitKey() - 等待按键



### 等待任意键
```cpp
cv::imshow("Image", img);
cv::waitKey(0);  // 按任意键继续
```

### 检测特定按键
```cpp
cv::imshow("Image", img);
int key = cv::waitKey(0);

if (key == 27) {  // ESC键
    std::cout << "用户取消" << std::endl;
} else if (key == 's' || key == 'S') {  // S键
    cv::imwrite("saved.jpg", img);
    std::cout << "图片已保存" << std::endl;
}
```

###  实时视频显示（30fps）
```cpp
while (true) {
    cv::Mat frame = getFrame();  // 获取一帧
    cv::imshow("Video", frame);
    
    // 等待33ms（约30fps），按ESC退出
    if (cv::waitKey(33) == 27) break;
}
```

---

## 4. cv::Mat - 图像数据类型

###  核心概念
`cv::Mat` 是OpenCV的核心数据结构，可以理解为一个**多维数组**：
- 2D图像 = 二维矩阵
- 彩色图像 = 三维矩阵（宽×高×通道）

###  创建Mat对象

#### 方法1: 通过imread创建
```cpp
cv::Mat img = cv::imread("image.jpg");
```

#### 方法2: 创建空白图像
```cpp
// 创建640×480的黑色图像
cv::Mat black(480, 640, CV_8UC3, cv::Scalar(0, 0, 0));

```

###  常用属性
```cpp
cv::Mat img = cv::imread("image.jpg");

// 基本信息
int width = img.cols;      // 宽度（列数）
int height = img.rows;     // 高度（行数）
int channels = img.channels();  // 通道数（1=灰度，3=彩色）
bool isEmpty = img.empty();     // 是否为空

// 数据类型
int type = img.type();     // CV_8UC3 等
int depth = img.depth();   // CV_8U 等

// 内存信息
size_t total = img.total();    // 总像素数 = rows × cols
size_t bytes = img.total() * img.elemSize();  // 占用字节数
```

###  Mat类型代码说明
```cpp
// CV_<bit-depth>{U|S|F}C<channels>
CV_8UC1   // 8位无符号，1通道（灰度图）
CV_8UC3   // 8位无符号，3通道（BGR彩色图）
CV_32FC1  // 32位浮点，1通道
CV_16SC3  // 16位有符号，3通道
```

---

## 5. cv::imwrite() - 保存图片

### 基础用法
```cpp
cv::Mat img = cv::imread("input.jpg");

// 处理图像...

// 保存为JPG（有损压缩）
cv::imwrite("output.jpg", img);

// 保存为PNG（无损压缩，推荐保存二值图）
cv::imwrite("binary.png", binaryImg);
```

###  设置压缩质量
```cpp
// JPG质量控制（0-100，默认95）
std::vector<int> jpg_params;
jpg_params.push_back(cv::IMWRITE_JPEG_QUALITY);
jpg_params.push_back(90);  // 质量90%
cv::imwrite("output.jpg", img, jpg_params);

// PNG压缩级别（0-9，默认3）
std::vector<int> png_params;
png_params.push_back(cv::IMWRITE_PNG_COMPRESSION);
png_params.push_back(9);  // 最大压缩
cv::imwrite("output.png", img, png_params);
```

---

## 6. cv::VideoCapture - 打开相机/视频


###  打开相机
```cpp
#include <opencv2/opencv.hpp>

int main() {
    // 打开默认相机（设备ID=0）
    cv::VideoCapture cap(0);
    
    // 检查是否成功打开
    if (!cap.isOpened()) {
        std::cerr << " 相机打开失败" << std::endl;
        return -1;
    }
  
    cv::Mat frame;
    while (true) {
        // 读取一帧
        cap.read(frame);
        // 或者: cap >> frame;
        
        if (frame.empty()) {
            std::cerr << " 无法读取帧" << std::endl;
            break;
        }
        
        // 显示
        cv::imshow("Camera", frame);
        
        // 按ESC退出
        if (cv::waitKey(30) == 27) break;
    }
    
    cap.release();
    cv::destroyAllWindows();
    return 0;
}
```

###  读取视频文件
```cpp
cv::VideoCapture cap("video.mp4");

if (!cap.isOpened()) {
    std::cerr << "视频文件打开失败" << std::endl;
    return -1;
}

// 获取视频信息
int fps = cap.get(cv::CAP_PROP_FPS);
int width = cap.get(cv::CAP_PROP_FRAME_WIDTH);
int height = cap.get(cv::CAP_PROP_FRAME_HEIGHT);
int frame_count = cap.get(cv::CAP_PROP_FRAME_COUNT);

std::cout << "视频信息: " << width << "x" << height 
          << " @ " << fps << "fps, 共" << frame_count << "帧" << std::endl;

cv::Mat frame;
while (cap.read(frame)) {
    cv::imshow("Video", frame);
    if (cv::waitKey(1000/fps) == 27) break;  // 按原速播放
}
```

---

##  本阶段实战练习


</details>

### 练习: 相机实时预览
实现一个相机预览程序，显示当前FPS

<details>
<summary> 参考答案</summary>

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>
#include <chrono>

int main() {
    cv::VideoCapture cap(0);
    if (!cap.isOpened()) {
        std::cerr << "相机打开失败" << std::endl;
        return -1;
    }
    
    cv::Mat frame;
    auto last_time = std::chrono::high_resolution_clock::now();
    double fps = 0;
    
    while (true) {
        cap >> frame;
        if (frame.empty()) break;
        
        // 计算FPS
        auto current_time = std::chrono::high_resolution_clock::now();
        double elapsed = std::chrono::duration<double>(current_time - last_time).count();
        fps = 1.0 / elapsed;
        last_time = current_time;
        
        // 在图像上绘制FPS
        std::string fps_text = "FPS: " + std::to_string(int(fps));
        cv::putText(frame, fps_text, cv::Point(10, 30),
                    cv::FONT_HERSHEY_SIMPLEX, 1, cv::Scalar(0, 255, 0), 2);
        
        cv::imshow("Camera Preview", frame);
        if (cv::waitKey(1) == 27) break;
    }
    
    cap.release();
    cv::destroyAllWindows();
    return 0;
}
```
</details>

---
