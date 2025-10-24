# RM装甲板识别 - 01 图像读取与显示

> **阶段目标**: 能读取图片、显示处理结果、保存文件  
> **适合人群**: 刚接触OpenCV的新手  
> **预计用时**: 30分钟

---

## 📚 本阶段核心API清单

| API | 作用 | 重要性 |
|-----|------|--------|
| `cv::imread()` | 读取图片到内存 | ⭐⭐⭐ 核心 |
| `cv::imshow()` | 显示图片窗口 | ⭐⭐⭐ 核心 |
| `cv::waitKey()` | 等待按键 | ⭐⭐⭐ 核心 |
| `cv::imwrite()` | 保存图片 | ⭐⭐ 常用 |
| `cv::Mat` | 图像数据类型 | ⭐⭐⭐ 核心 |
| `cv::VideoCapture` | 打开相机/视频 | ⭐⭐ 进阶 |

---

## 1. cv::imread() - 读取图片

### 📖 函数原型
```cpp
cv::Mat cv::imread(const String& filename, int flags = IMREAD_COLOR);
```

### 📋 参数说明
| 参数 | 类型 | 说明 |
|------|------|------|
| `filename` | string | 图片路径（相对或绝对路径） |
| `flags` | int | 读取模式（见下表） |

**flags常用值:**
- `cv::IMREAD_COLOR` (默认) - 读取彩色图，忽略透明度
- `cv::IMREAD_GRAYSCALE` - 转为灰度图
- `cv::IMREAD_UNCHANGED` - 包含Alpha通道

### 💻 基础用法
```cpp
#include <opencv2/opencv.hpp>
#include <iostream>

int main() {
    // 读取彩色图（装甲板识别用这个）
    cv::Mat img = cv::imread("armor.jpg", cv::IMREAD_COLOR);
    
    // ⚠️ 必须检查是否读取成功！
    if (img.empty()) {
        std::cout << "❌ 图片读取失败！" << std::endl;
        return -1;
    }
    
    // 打印图片信息
    std::cout << "✅ 图片读取成功" << std::endl;
    std::cout << "   尺寸: " << img.cols << " x " << img.rows << std::endl;
    std::cout << "   通道数: " << img.channels() << std::endl;
    
    return 0;
}
```

### 🎯 输出示例
```
✅ 图片读取成功
   尺寸: 1280 x 720
   通道数: 3
```

### ⚠️ 常见错误

#### 错误1: 路径写错
```cpp
// ❌ Windows路径没有转义反斜杠
cv::Mat img = cv::imread("C:\Users\image.jpg");

// ✅ 正确写法（三种任选）
cv::Mat img = cv::imread("C:\\Users\\image.jpg");     // 转义反斜杠
cv::Mat img = cv::imread("C:/Users/image.jpg");       // 使用正斜杠
cv::Mat img = cv::imread(R"(C:\Users\image.jpg)");    // 原始字符串
```

#### 错误2: 忘记检查empty()
```cpp
// ❌ 危险！如果文件不存在，后续操作会崩溃
cv::Mat img = cv::imread("not_exist.jpg");
cv::imshow("Window", img);  // 💥 崩溃

// ✅ 正确写法
cv::Mat img = cv::imread("not_exist.jpg");
if (img.empty()) {
    std::cerr << "文件不存在或格式不支持" << std::endl;
    return -1;
}
```

### 💡 重要知识点
> **OpenCV读取的图片是BGR格式，不是RGB！**  
> 这在后续颜色识别时非常重要。如果你要转RGB需要用 `cv::cvtColor()`

---

## 2. cv::imshow() - 显示图片

### 📖 函数原型
```cpp
void cv::imshow(const String& winname, InputArray mat);
```

### 📋 参数说明
| 参数 | 类型 | 说明 |
|------|------|------|
| `winname` | string | 窗口名称（自己起名） |
| `mat` | Mat | 要显示的图像 |

### 💻 基础用法
```cpp
cv::Mat img = cv::imread("armor.jpg");

// 显示图片
cv::imshow("原图", img);

// ⚠️ 必须配合waitKey()，否则窗口闪现即消失！
cv::waitKey(0);  // 0表示无限等待，直到按任意键

// 关闭所有窗口
cv::destroyAllWindows();
```

### 💻 显示多个窗口
```cpp
cv::Mat img1 = cv::imread("red_armor.jpg");
cv::Mat img2 = cv::imread("blue_armor.jpg");

cv::imshow("红方装甲板", img1);
cv::imshow("蓝方装甲板", img2);

cv::waitKey(0);
cv::destroyAllWindows();
```

### ⚠️ 常见错误
```cpp
// ❌ 错误：窗口闪一下就消失
cv::imshow("Window", img);
// 缺少 waitKey()

// ✅ 正确写法
cv::imshow("Window", img);
cv::waitKey(0);
```

---

## 3. cv::waitKey() - 等待按键

### 📖 函数原型
```cpp
int cv::waitKey(int delay = 0);
```

### 📋 参数说明
| 参数 | 说明 |
|------|------|
| `delay` | 等待时间（毫秒），0表示无限等待 |
| **返回值** | 按下的键的ASCII码，超时返回-1 |

### 💻 实用技巧

#### 技巧1: 等待任意键
```cpp
cv::imshow("Image", img);
cv::waitKey(0);  // 按任意键继续
```

#### 技巧2: 检测特定按键
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

#### 技巧3: 实时视频显示（30fps）
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

### 📖 核心概念
`cv::Mat` 是OpenCV的核心数据结构，可以理解为一个**多维数组**：
- 2D图像 = 二维矩阵
- 彩色图像 = 三维矩阵（宽×高×通道）

### 💻 创建Mat对象

#### 方法1: 通过imread创建
```cpp
cv::Mat img = cv::imread("image.jpg");
```

#### 方法2: 创建空白图像
```cpp
// 创建640×480的黑色图像
cv::Mat black(480, 640, CV_8UC3, cv::Scalar(0, 0, 0));

// 创建白色图像
cv::Mat white(480, 640, CV_8UC3, cv::Scalar(255, 255, 255));

// 创建红色图像
cv::Mat red(480, 640, CV_8UC3, cv::Scalar(0, 0, 255));  // BGR格式！
```

### 📋 常用属性
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

### 💻 访问像素值

#### 方法1: at访问（安全但慢）
```cpp
cv::Mat img = cv::imread("image.jpg");

// 访问(100, 200)位置的像素
cv::Vec3b pixel = img.at<cv::Vec3b>(100, 200);
uchar blue = pixel[0];
uchar green = pixel[1];
uchar red = pixel[2];

// 修改像素
img.at<cv::Vec3b>(100, 200) = cv::Vec3b(255, 0, 0);  // 设为蓝色
```

#### 方法2: 指针访问（快但需小心）
```cpp
for (int y = 0; y < img.rows; y++) {
    uchar* row = img.ptr<uchar>(y);  // 获取第y行的指针
    for (int x = 0; x < img.cols; x++) {
        uchar b = row[x * 3 + 0];
        uchar g = row[x * 3 + 1];
        uchar r = row[x * 3 + 2];
    }
}
```

### 📋 Mat类型代码说明
```cpp
// CV_<bit-depth>{U|S|F}C<channels>
CV_8UC1   // 8位无符号，1通道（灰度图）
CV_8UC3   // 8位无符号，3通道（BGR彩色图）
CV_32FC1  // 32位浮点，1通道
CV_16SC3  // 16位有符号，3通道
```

---

## 5. cv::imwrite() - 保存图片

### 📖 函数原型
```cpp
bool cv::imwrite(const String& filename, InputArray img);
```

### 💻 基础用法
```cpp
cv::Mat img = cv::imread("input.jpg");

// 处理图像...

// 保存为JPG（有损压缩）
cv::imwrite("output.jpg", img);

// 保存为PNG（无损压缩，推荐保存二值图）
cv::imwrite("binary.png", binaryImg);
```

### 💻 设置压缩质量
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

### 📖 函数原型
```cpp
cv::VideoCapture cap(int device);         // 打开相机
cv::VideoCapture cap(const String& filename);  // 打开视频文件
```

### 💻 打开相机
```cpp
#include <opencv2/opencv.hpp>

int main() {
    // 打开默认相机（设备ID=0）
    cv::VideoCapture cap(0);
    
    // 检查是否成功打开
    if (!cap.isOpened()) {
        std::cerr << "❌ 相机打开失败" << std::endl;
        return -1;
    }
    
    // 设置相机参数（可选）
    cap.set(cv::CAP_PROP_FRAME_WIDTH, 1280);
    cap.set(cv::CAP_PROP_FRAME_HEIGHT, 720);
    cap.set(cv::CAP_PROP_FPS, 60);
    
    cv::Mat frame;
    while (true) {
        // 读取一帧
        cap.read(frame);
        // 或者: cap >> frame;
        
        if (frame.empty()) {
            std::cerr << "❌ 无法读取帧" << std::endl;
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

### 💻 读取视频文件
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

## 🎯 本阶段实战练习

### 练习1: 图片查看器
编写一个简单的图片查看器，支持：
- 读取并显示图片
- 按 `s` 保存图片副本
- 按 `ESC` 退出

<details>
<summary>💡 参考答案</summary>

```cpp
#include <opencv2/opencv.hpp>
#include <iostream>

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cout << "用法: " << argv[0] << " <image_path>" << std::endl;
        return -1;
    }
    
    cv::Mat img = cv::imread(argv[1]);
    if (img.empty()) {
        std::cerr << "无法读取图片: " << argv[1] << std::endl;
        return -1;
    }
    
    std::cout << "按 's' 保存, 按 ESC 退出" << std::endl;
    
    while (true) {
        cv::imshow("图片查看器", img);
        int key = cv::waitKey(0);
        
        if (key == 27) {  // ESC
            break;
        } else if (key == 's' || key == 'S') {
            cv::imwrite("saved.jpg", img);
            std::cout << "已保存到 saved.jpg" << std::endl;
        }
    }
    
    cv::destroyAllWindows();
    return 0;
}
```
</details>

### 练习2: 相机实时预览
实现一个相机预览程序，显示当前FPS

<details>
<summary>💡 参考答案</summary>

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

## ✅ 检查清单

完成本阶段后，你应该能够：

- [ ] 用 `cv::imread()` 读取图片并检查是否成功
- [ ] 用 `cv::imshow()` 和 `cv::waitKey()` 显示图片
- [ ] 理解Mat对象的基本属性（rows, cols, channels）
- [ ] 用 `cv::imwrite()` 保存处理结果
- [ ] 用 `cv::VideoCapture` 打开相机并实时显示

---

## 📚 下一步

完成本阶段后，继续学习：
- **[02-颜色提取]** - 如何提取红/蓝色灯条
- **[04-轮廓检测]** - 如何找到灯条的位置

---

## 🔗 参考资料

- [OpenCV官方文档 - imread](https://docs.opencv.org/4.x/d4/da8/group__imgcodecs.html#ga288b8b3da0892bd651fce07b3bbd3a56)
- [OpenCV官方文档 - Mat](https://docs.opencv.org/4.x/d3/d63/classcv_1_1Mat.html)
- [OpenCV官方文档 - VideoCapture](https://docs.opencv.org/4.x/d8/dfe/classcv_1_1VideoCapture.html)
