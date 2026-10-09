# Junyan Lu · Portfolio

中英文静态作品集。正式页面保留在根目录，维持现有页面 URL 与相对资源链接。

## 文件入口

| 位置 | 用途 |
| --- | --- |
| `index.html` / `index-en.html` | 中英文首页 |
| `project-*.html` | 项目案例；`-en` 为英文版 |
| `*.css` / `*.js` | 正式页面样式与交互；部分命名沿用原设计方案 |
| `assets/` | 按项目组织的页面图片与素材 |
| `output/pdf/` | 简历与 YouFeed 指南下载；只有明确允许的文件进入 Git |
| `docs/` | 项目修改记录、检查结果与目录说明 |
| `scripts/` | 发布文件清单与检查脚本 |
| `.github/` | 自动检查配置 |
| `last30days-research/` / `.wayfinder/` | 已有研究与规划资料，不作为网站发布入口 |
| `.local/` | 本地归档，不提交；2026-10-09整理的旧方案和临时文件在其下 |
| `.design/` / `.audit/` | 本地视觉检查记录，保留历史引用路径 |

## 预览与检查

```sh
python3 -m http.server 8013 --bind 127.0.0.1
node scripts/check-release.mjs
```

浏览器打开 `http://127.0.0.1:8013/`。发布入口见 `scripts/release-files.txt`；该清单也包含检查所需文件，并非可直接上传全部仓库的指令。

## 整理原则

正式页面、样式和资源不改名、不移动。旧方案和临时材料只归档、不删除；移动清单及SHA-256校验记录位于 `.local/archive/2026-10-09/move-manifest.json`。旧方案按原路径布局保存在归档中，恢复到原位置后可继续编辑。详细说明见 [目录整理记录](docs/project-organization-2026-10-09.md)。
