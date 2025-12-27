
# 熊孩子/mybaby (TV-Limit)

**基于 MAC 地址的家庭网络上网时长管控插件（OpenWrt / iStoreOS）**

> 面向家庭场景的儿童电视 / 平板短视频观看管控解决方案。支持 IPv4 / IPv6 双栈，不依赖 DNS 劫持。

---

## 🌟 项目亮点

*   **二层识别 (Layer 2 Recognition)**：基于 MAC 地址识别设备。
*   **nftables 原子拦截**：使用 `inet` 表统一处理 IPv4/IPv6，在 `forward` 链进行拦截。
*   **双模式管控**：累计时长模式 (Quota) 与 固定时段模式 (Schedule)。
*   **不入侵网络环境**：与 OpenClash、AdGuard Home 完美兼容。

---

## 🛠 技术方案

| 模块 | 技术实现 |
| :--- | :--- |
| **流量拦截** | nftables (`inet` table) |
| **设备识别** | MAC 地址 (`ether saddr`) |
| **平台识别** | 域名解析 -> 定时更新 IP Set (`nft set`) |
| **前端界面** | React / LuCI |

---

## 🚀 适用人群

*   **家长**：需要管控孩子通过电视、平板过度观看短视频。
*   **OpenWrt 玩家**：寻求比自带“上网时间控制”更精准的方案。
