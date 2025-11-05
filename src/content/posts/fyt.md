---
title: 中南自瞄
published: 2025-10-23
description: 中南自瞄的代码框架解读
tags: [RM,学习]
category: RM
---
## 装甲板检测
### **检测类**
- Detector
    - 成员
        - `LightParams` 灯条参数
            - `min_ratio`，`max_ratio` 宽高比
            - `max_angle` 最大倾斜角
            - `color_diff_thresh` 颜色阈值，用来判断颜色（通道相减）
        - `ArmorParams` 装甲板参数
            - `min_light_ratio` 最小灯条宽高比（那上面的是什么）
            - `center_distance` 装甲板距离
            - `max_angle` 最大倾斜角（那上面的是什么）
        - `binary_thres` 二值化阈值
        - `detect_color` 颜色
        - `classifier` 识别数字 `corner_corrector` 角点修正（智能指针？不会用）
        - `binary_img` 二值化图像 
        - `rm_interfaces::msg::DebugLights debug_lights` `rm_interfaces::msg::DebugArmors debug_armors` 发布消息
        - `gray_img_` 灰度图
        - `lights_` `armors_` 检测的所有灯条和装甲板
    - 函数（noexcept性能优化？）
        - `detect` 检测入口
            - `preprocessImage` 图像预处理
                - 转灰度，二值化
            - `findLights` 
                - 寻找轮廓，然后简单判断，如果点太少就跳过
                - 转换成灯条
                - 判断是否是灯条
                    - 判断颜色
                    - 保存
                - 按横坐标排序，返回
            - `matchLights` 匹配装甲板
        - `getAllNumbersImage` 调试函数
        - `drawResults` 绘制结果
        - `isLight` 判断灯条 `isArmor` 判断装甲板（为啥一个公有一个私有，对于什么公有什么私有有点晕其实）
        - `containLight` 判断是否已配对


