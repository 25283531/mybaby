# 熊孩子/mybaby (TV-Limit)

**基于 MAC 地址的家庭网络上网时长管控插件（OpenWrt / iStoreOS）**

> 面向家庭场景的儿童电视 / 平板短视频观看管控解决方案。支持 IPv4 / IPv6 双栈，不依赖 DNS 劫持，不影响 OpenClash 等代理体系。

---

## 🌟 项目亮点

*   **二层识别 (Layer 2 Recognition)**：基于 MAC 地址识别设备，从根本上解决 IPv4 租期变化及 IPv6 SLAAC 地址动态变化导致的管控失效问题。
*   **nftables 原子拦截**：使用 `inet` 表统一处理 IPv4/IPv6，在 `forward` 链进行 MAC + 目标 IP Set 的匹配，性能极高且不破坏系统原有的防火墙规则。
*   **双模式管控**：
    *   **累计时长模式 (Quota)**：每日限制访问指定平台（如抖音、B站）的总时间。
    *   **固定时段模式 (Schedule)**：在指定的时间窗口内才允许访问相关平台。
*   **不入侵网络环境**：不修改 DNS，不做 TPROXY。这意味着它与 OpenClash、AdGuard Home 等流行路由插件完美兼容，且不影响内网通信。
*   **AI 育儿助手**：集成 Gemini API，根据设备的实际使用数据提供专业的育儿建议和健康的上网配额指导。

---

## 🛠 技术方案

| 模块 | 技术实现 |
| :--- | :--- |
| **流量拦截** | nftables (`inet` table) |
| **设备识别** | MAC 地址 (`ether saddr`) |
| **平台识别** | 域名解析 -> 定时更新 IP Set (`nft set`) |
| **统计粒度** | 30 秒 (Userspace daemon) |
| **配置管理** | UCI (Unified Configuration Interface) |
| **前端界面** | React / LuCI (本仓库为 Web 控制面板原型) |

---

## 📸 功能截图

### 1. 数据概览 (Dashboard)
实时监控受控设备的在线状态、今日流量趋势以及各大平台的拦截分布。

### 2. 限制规则管理 (Rules Collection)
内置主流视频平台（抖音、快手、B站等）规则，支持自定义规则集。通过维护 IP 集合动态识别应用流量。

### 3. 设备策略配置 (Device Control)
为不同设备设置不同的管理模式。无论是限制每天只能看 1 小时电视，还是限制只有在写完作业的 18:30-19:30 才能刷平板，都能轻松搞定。

### 4. AI 育儿建议 (Parenting Advisor)
结合 Gemini 大模型，分析孩子的上网习惯，帮助家长以更科学、更温和的方式建立数字生活边界。

---

## 📂 项目结构

```bash
├── App.tsx             # 主程序逻辑与状态管理
├── components/         # 界面组件 (Dashboard, DeviceList, PlatformManager等)
├── services/           # AI 服务集成 (Gemini API)
├── types.ts            # 核心数据模型定义
├── constants.tsx       # 初始配置与静态数据
└── metadata.json       # 项目元数据
```

---

## 🚀 适用人群

*   **家长**：需要管控孩子通过电视、平板过度观看短视频。
*   **OpenWrt 玩家**：寻求比自带“上网时间控制”更精准、更灵活的管控方案。
*   **追求稳定者**：不希望因为 DNS 修改导致全网断网或代理服务异常的用户。

---

## 📜 许可证

本项目采用 MIT 许可证。

> **项目定位总结**：熊孩子/mybaby 不是一个“极客玩具”，而是一个真正面向家庭的网络基础设施插件。它解决的是电视系统封闭不可控、DNS 方案维护成本高、IPv6 环境管控难等实际痛点。
