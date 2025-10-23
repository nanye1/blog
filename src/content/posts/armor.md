---
title: 装甲板自动识别与位姿估计学习
published: 2025-10-22
description: 一些小笔记
tags: [RM, 学习]
category: RM 
---

## 目录
1. [总览：系统做的事情是什么](#总览系统做的事情是什么)
2. [关键知识点速通](#关键知识点速通)
3. [端到端流程图（一帧图像如何被处理）](#端到端流程图一帧图像如何被处理)
4. [模块逐个拆解（含核心代码片段）](#模块逐个拆解含核心代码片段)
   - 4.1 数字分类器 `NumberClassifier`
   - 4.2 视觉检测器 `Detector`
   - 4.3 灯条角点精修 `LightCornerCorrector`
   - 4.4 位姿估计 `ArmorPoseEstimator`（PnP + BA）
   - 4.5 BA 优化器与图优化算子 `BaSolver` / `GraphOptimizer`
   - 4.6 ROS2 节点 `ArmorDetectorNode`
5. [参数如何影响效果（调参指南）](#参数如何影响效果调参指南)
6. [实战：从源码到运行与可视化](#实战从源码到运行与可视化)
7. [常见问题与定位思路](#常见问题与定位思路)
8. [进阶练习题（带方向提示）](#进阶练习题带方向提示)
9. [术语与坐标系小抄](#术语与坐标系小抄)

---

## 总览：系统做的事情是什么

**目标**：从相机来的彩色图像中，自动找出“**两根灯条组成的装甲板**”，**识别装甲数字**，并估计装甲板在**相机坐标系**下的三维位姿（位置 + 姿态），最后通过 **ROS2** 发布结果与可视化。

**关键阶段**：
1. 图像预处理 → 二值化轮廓 → **灯条候选**。
2. 灯条几何筛选 & 颜色判定 → **灯条配对成装甲板**。
3. 透视展开中部区域 → **数字分类**（ONNX 模型）。
4. 对灯条上下角点做**几何细化**（提升 PnP 稳定性）。
5. 用 **PnP 求初解** → 条件允许时用 **BA（仅优化 yaw）**做小优化。
6. 封装为 ROS2 节点：**订阅图像/相机内参/TF**，发布调试图像与 **Marker**。

---

## 关键知识点速通

- **轮廓检测与几何筛选（OpenCV）**：`findContours`、旋转矩形、长短边比、倾角、区域颜色统计。
- **透视展开**：`getPerspectiveTransform` + `warpPerspective` 把斜着的装甲板拉直。
- **二值化与分类（OpenCV DNN）**：OTSU 自动阈值、`blobFromImage`、ONNX 前向。
- **PnP 位姿估计**：2D-3D 对应点 + 相机内参 → `solvePnPGeneric` 求 R/t。
- **两解选择与稳定化**：重投影误差、roll 限制、根据灯条倾斜推断 yaw 正负。
- **BA（Bundle Adjustment）**：这里**只优化 yaw**，用 g2o 把像素投影误差最小化。
- **ROS2 组件化**：参数声明、话题订阅/发布、动态参数回调、TF 查询、RViz 可视化。

---

## 端到端流程图（一帧图像如何被处理）

```
Image(rgb8)
   └─► 预处理(灰度/阈值)
          └─► 轮廓→灯条(Light)
                 └─► 同色 + 几何关系 → 装甲(Armor)
                        ├─► (可选) 灯条角点精修
                        ├─► 透视展开数字ROI → 二值化 → 分类
                        └─► PnP求位姿 → (可选) BA优化yaw
                               └─► 发布Armors + RViz Marker + 调试图像
```

---

## 模块逐个拆解（含核心代码片段）



### 4.1 数字分类器 `NumberClassifier`

**职责**：从装甲板两根灯条之间裁出数字图（固定尺寸），二值化后喂给 ONNX 分类网络，得到类别与置信度。

**核心：透视展开 + 二值化 + DNN 前向**

```cpp
// 透视展开并裁 ROI（宽度随大小装甲而变）
cv::Mat NumberClassifier::extractNumber(const cv::Mat& src, const Armor& armor) const noexcept {
  static const int light_length = 12, warp_height = 28;
  static const int small_armor_width = 32, large_armor_width = 54;
  static const cv::Size roi_size(20, 28), input_size(28, 28);

  cv::Point2f lights_vertices[4] = {
    armor.left_light.bottom, armor.left_light.top,
    armor.right_light.top,   armor.right_light.bottom
  };
  const int top_light_y    = (warp_height - light_length) / 2 - 1;
  const int bottom_light_y = top_light_y + light_length;
  const int warp_width     = (armor.type == ArmorType::SMALL ? small_armor_width : large_armor_width);
  cv::Point2f target_vertices[4] = {
    {0, bottom_light_y}, {0, top_light_y},
    {warp_width - 1, top_light_y}, {warp_width - 1, bottom_light_y},
  };

  cv::Mat number_image, M = cv::getPerspectiveTransform(lights_vertices, target_vertices);
  cv::warpPerspective(src, number_image, M, cv::Size(warp_width, warp_height));

  // 中部 ROI → 灰度&OTSU → 28x28
  number_image = number_image(cv::Rect((warp_width - roi_size.width) / 2, 0, roi_size.width, roi_size.height));
  cv::cvtColor(number_image, number_image, cv::COLOR_RGB2GRAY);
  cv::threshold(number_image, number_image, 0, 255, cv::THRESH_BINARY | cv::THRESH_OTSU);
  cv::resize(number_image, number_image, input_size);
  return number_image;
}
```

```cpp
// 前向分类 + 结果解码
void NumberClassifier::classify(const cv::Mat&, Armor& armor) noexcept {
  cv::Mat input = armor.number_img / 255.0;  // [0,1]
  cv::Mat blob; cv::dnn::blobFromImage(input, blob);
  mutex_.lock(); net_.setInput(blob); cv::Mat out = net_.forward().clone(); mutex_.unlock();

  double conf; cv::Point idp;
  minMaxLoc(out.reshape(1, 1), nullptr, &conf, nullptr, &idp);
  int label_id = idp.x;
  armor.confidence = conf;
  armor.number     = class_names_[label_id];
  armor.classfication_result = fmt::format("{}:{:.1f}%", armor.number, armor.confidence * 100.0);
}
```

```cpp
// 过滤：按阈值/忽略列表 + 大小装甲与类别的互斥规则
void NumberClassifier::eraseIgnoreClasses(std::vector<Armor>& armors) noexcept {
  armors.erase(std::remove_if(armors.begin(), armors.end(), [this](const Armor &a) {
    if (a.confidence < threshold) return true;
    for (auto& ig : ignore_classes_) if (a.number == ig) return true;

    bool mismatch = false;
    if (a.type == ArmorType::LARGE)  mismatch = (a.number == "outpost" || a.number == "2" || a.number == "sentry");
    if (a.type == ArmorType::SMALL)  mismatch = (a.number == "1"      || a.number == "base");
    return mismatch;
  }), armors.end());
}
```

**要点**：ROI 宽度与装甲尺寸匹配；OTSU 让阈值更稳；`blobFromImage` 封装归一化与 NHWC→NCHW。

---

### 4.2 视觉检测器 `Detector`

**职责**：灰度/阈值 → 轮廓 → 灯条（形状 + 倾角）→ 统计颜色 → 左右同色配对 → 装甲。若有分类器与角点修正器，则并行进行数字分类与角点细化。

**总体流程**

```cpp
std::vector<Armor> Detector::detect(const cv::Mat& input) noexcept {
  binary_img = preprocessImage(input);               // 灰度+固定阈值
  lights_    = findLights(input, binary_img);        // 轮廓→Light（比例/角度/颜色）
  armors_    = matchLights(lights_);                 // 左右配对 → Armor

  if (!armors_.empty() && classifier) {
    std::for_each(std::execution::par, armors_.begin(), armors_.end(), [this,&input](Armor& a){
      a.number_img = classifier->extractNumber(input, a);
      classifier->classify(input, a);
      if (corner_corrector) corner_corrector->correctCorners(a, gray_img_);
    });
    classifier->eraseIgnoreClasses(armors_);
  }
  return armors_;
}
```

**关键判定：灯条与配对**

```cpp
// 灯条筛选：短长边比 + 倾角
bool Detector::isLight(const Light& l) noexcept {
  float ratio = l.width / l.length;
  bool ratio_ok = light_params.min_ratio < ratio && ratio < light_params.max_ratio;
  bool angle_ok = l.tilt_angle < light_params.max_angle;
  return ratio_ok && angle_ok;
}

// 颜色：在轮廓像素中统计R/B强度差（红/蓝）
for (auto& pt: contour) { sum_r += rgb(pt)[0]; sum_b += rgb(pt)[2]; }
if (abs(sum_r - sum_b)/contour.size() > light_params.color_diff_thresh)
  light.color = (sum_r > sum_b ? RED : BLUE);

// 夹灯检测：两灯条外接矩形内是否还“夹”着别的灯条（且排除数字/红点等干扰）
bool containLight(int i, int j, const std::vector<Light>& lights);

// 配对：同色 + X方向扫描 + 中心距窗口（区分大小装甲）+ 两灯条长度相近 + 夹角限制
std::vector<Armor> Detector::matchLights(const std::vector<Light>& lights) noexcept;
```

---

### 4.3 灯条角点精修 `LightCornerCorrector`

**职责**：更精确地找到每根灯条的**上下端点**与**中心/轴向**，提升 PnP 的 2D-3D 对应精度（在二值化或噪声环境下尤其有用）。

**算法思路**：
1. 以灯条外接框为基础做**适度扩展**并检查边界；
2. 对该小区域做**重心与主方向**估计（亮度加权 + PCA/一阶矩），得到**对称轴**；
3. 沿对称轴的上下方向，以多个平行“扫描线”寻找**亮度突变最大**的位置作为端点候选，最后求平均。

**要点代码**

```cpp
// 角点修正入口：宽度太小则跳过，避免噪声
void LightCornerCorrector::correctCorners(Armor& armor, const cv::Mat& gray) {
  constexpr int PASS_OPTIMIZE_WIDTH = 3;
  if (armor.left_light.width  > PASS_OPTIMIZE_WIDTH) { /* 求 axis & 角点 */ }
  if (armor.right_light.width > PASS_OPTIMIZE_WIDTH) { /* 求 axis & 角点 */ }
}

// 沿对称轴寻找“亮度突变最大”的点作为角点（多条平行线，取候选平均）
cv::Point2f LightCornerCorrector::findCorner(const cv::Mat& gray, const Light& light,
                                             const SymmetryAxis& axis, std::string order) {
  // ... 扫描 START~END 的小段，累计亮度差最大处 ...
  // 返回均值点；无候选则返回 (-1,-1)
}
```

---

### 4.4 位姿估计 `ArmorPoseEstimator`（PnP + BA）

**职责**：把装甲四角的 2D 像素点与已知 3D 模型点（大/小装甲的真实尺寸）对应，解出 R/t。若 roll 小且开启 BA，则进一步仅在 **yaw** 维进行图优化，使投影误差更小。

**核心流程**

```cpp
// 1) PnP 初解（solvePnPGeneric 可能返回两组解）
if (pnp_solver_->solvePnPGeneric(armor.landmarks(), rvecs, tvecs, type_name)) {
  sortPnPResult(armor, rvecs, tvecs);   // 2) 解的选择（误差/roll/灯条倾角→yaw正负）

  cv::Mat rmat; cv::Rodrigues(rvecs[0], rmat);
  Eigen::Matrix3d R = cvToEigen(rmat);
  Eigen::Vector3d t = cvToEigen(tvecs[0]);

  double roll = rotationMatrixToRPY(R_gimbal_camera_ * R)[0] * 180/M_PI;
  if (use_ba_ && roll < 15) {
    // 3) BA：仅优化 yaw，小幅修正 R 以减小投影误差
    R = ba_solver_->solveBa(armor, t, R, R_imu_camera);
  }
  // 4) 填充消息（位姿 + 文本）
}
```

**两解选择（直觉）**：
- 先看**重投影误差**与 **roll**（太差的解直接放弃切换）；
- 再用**灯条在像面上的整体倾斜**来判断当前**yaw 的正负是否“合理”**，必要时对调解。

---

### 4.5 BA 优化器与图优化算子 `BaSolver` / `GraphOptimizer`

**思想**：只把**装甲 yaw** 当成优化变量（一个顶点 `VertexYaw`），装甲的 3D 角点为固定顶点。观测为每个角点在图像里的像素位置，误差就是**观测像素**减去**投影像素**。这样 BA 既轻量又能稳住姿态。

**构图与优化**

```cpp
// 填图：一个 yaw 顶点 + 四个固定的 3D 顶点 + 四条投影误差边（带 Huber 鲁棒核）
VertexYaw* v_yaw = new VertexYaw(); v_yaw->setEstimate(initial_armor_yaw);
for (i in 4 corners) {
  VertexPointXYZ* vp = new VertexPointXYZ(); vp->setFixed(true);
  EdgeProjection* e = new EdgeProjection(R_camera_imu, R_pitch, t, K);
  e->setVertex(0, v_yaw); e->setVertex(1, vp);
  e->setMeasurement(pixel_observation);
  e->setRobustKernel(new g2o::RobustKernelHuber);
}
optimizer.initializeOptimization(); optimizer.optimize(20);
```

```cpp
// 自定义顶点增量：在 SO3 上用李代数更新 yaw，避免角度跳变
void VertexYaw::oplusImpl(const double* update) {
  Sophus::SO3d R_yaw = Sophus::SO3d::exp({0,0,update[0]}) * Sophus::SO3d::exp({0,0,_estimate});
  _estimate = R_yaw.log()(2);
}
```

```cpp
// 投影边误差：像素观测 - 投影(R_camera_imu * R_yaw * R_pitch * P + t)
void EdgeProjection::computeError() {
  double yaw = static_cast<VertexYaw*>(_vertices[0])->estimate();
  Sophus::SO3d R = R_camera_imu_ * Sophus::SO3d::exp({0,0,yaw}) * R_pitch_;
  Eigen::Vector3d p = R * P3D + t_;
  Eigen::Vector2d proj = (K_ * (p / p.z())).head<2>();
  _error = obs - proj;
}
```

---

### 4.6 ROS2 节点 `ArmorDetectorNode`

**职责**：把检测 → 分类 →（可选）角点修正 → PnP/BA → 发布可视化，全流程在 ROS2 中跑起来。负责：参数、订阅/发布、TF、调试。

**节点初始化（节选）**

```cpp
// 读取参数，初始化 Detector、NumberClassifier、LightCornerCorrector
int binary_thres = declare_parameter("binary_thres", 160);
Detector::LightParams l_params = {.min_ratio=0.08, .max_ratio=0.4, .max_angle=40.0, .color_diff_thresh=25};
Detector::ArmorParams a_params = { .min_light_ratio=0.6, .min_small_center_distance=0.8, .max_small_center_distance=3.2,
                                   .min_large_center_distance=3.2, .max_large_center_distance=5.0, .max_angle=35.0 };
detector_ = std::make_unique<Detector>(binary_thres, EnemyColor::RED, l_params, a_params);

auto model_path = utils::URLResolver::getResolvedPath("package://armor_detector/model/lenet.onnx");
auto label_path = utils::URLResolver::getResolvedPath("package://armor_detector/model/label.txt");
double threshold = declare_parameter("classifier_threshold", 0.7);
auto ignores = declare_parameter<std::vector<std::string>>("ignore_classes", {"negative"});
detector_->classifier = std::make_unique<NumberClassifier>(model_path, label_path, threshold, ignores);

bool use_pca = declare_parameter("use_pca", true);
if (use_pca) detector_->corner_corrector = std::make_unique<LightCornerCorrector>();
```

**图像回调（节选）**

```cpp
// 1) TF: odom → 相机的旋转矩阵（IMU→Camera）
auto odom_to_cam = tf2_buffer_->lookupTransform(odom_frame_, img_msg->header.frame_id, img_msg->header.stamp, 10ms);
Eigen::Matrix3d imu_to_camera = tf2MatrixFrom(odom_to_cam.transform.rotation);

// 2) 检测 + 分类 + 角点修正
auto armors = detector_->detect(cv_bridge::toCvShare(img_msg, "rgb8")->image);

// 3) PnP/BA 提取位姿
armors_msg_.armors = armor_pose_estimator_->extractArmorPoses(armors, imu_to_camera);

// 4) 可视化与发布：Marker / 调试图像 / Armors
publishMarkersAndDebugImages(...);
armors_pub_->publish(armors_msg_);
```

---

## 参数如何影响效果（调参指南）

- `binary_thres`：阈值高→噪点少但灯条可能断；阈值低→连通域粘连。先打开调试图像话题观察再调。
- `light.min_ratio / max_ratio / max_angle`：控制灯条的“细长”和“近垂直”程度；误检多就收紧，漏检多就放宽。
- `light.color_diff_thresh`：越大越“保守”地判断颜色；太小会把杂散光当成红/蓝。
- `armor.*_center_distance`：两灯条中心距窗口；与焦距/距离有关，镜头变化后要重调。
- `classifier_threshold / ignore_classes`：分类阈值与忽略类，先松后紧，结合实测混淆再收敛。
- `use_pca`：角点修正，噪声环境或分辨率不高时常有帮助。
- `use_ba`：轻量的 yaw 优化，能减抖、稳姿态；但在极端视角下可能收益有限。

---

## 实战：从源码到运行与可视化

1. **准备**：相机话题 `image_raw`、`camera_info`，并确认 TF 链路（`odom → camera`）。
2. **启动节点**：加载参数（上面提到的阈值与窗口）并打开 `debug`。
3. **RViz**：添加 `MarkerArray` 订阅 `armor_detector/marker`；把调试图像话题（`binary_img/number_img/result_img`）也开出来。
4. **观察与调整**：
   - 先让**灯条候选**稳定 → 再看**配对**是否合理 → 最后看**数字分类**与**位姿**是否稳定。
   - 逐项微调参数，记录每项调整对召回/精度的影响。

---

## 常见问题与定位思路

- **灯条“夹灯”/误配对**：检查 `containLight` 规则与数字/红点宽度过滤；适当提高 `color_diff_thresh`。
- **分类不稳**：对比 `number_img` 是否干净；检查 ROI 宽度是否与大/小装甲一致；适当调阈值或忽略类。
- **位姿“翻面”**：理解 `sortPnPResult` 的选择逻辑（误差、roll、灯条倾角与 yaw 正负），必要时在近景贴纸纹理上做辅助。
- **姿态抖动**：开启 `use_ba`；或在 `LightCornerCorrector` 中加大候选条数。

---

## 进阶练习题（带方向提示）

1. **把阈值改成自适应**：尝试 `cv::adaptiveThreshold` 或根据区域亮度动态调 `binary_thres`。
2. **加入时序稳定**：在 `Detector` 输出上做跟踪（Kalman/匈牙利匹配），让数字与姿态在帧间更稳。
3. **数据增强与再训练**：对 `number_img` 做随机仿射/噪声增强，微调 ONNX 模型，观察混淆类的改善。
4. **多目标选择策略**：当同屏多块装甲时，基于 `distance_to_image_center`、置信度或历史 ID 选择目标。

---

## 术语与坐标系小抄


