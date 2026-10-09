# 项目目录整理 / 2026-10-09

将根目录内未跟踪的旧首页方案、旧Sound Mirror方案、旧通用样式与脚本、评审草稿、audit-*、screenshots、tmp及本地策略HTML，原样移动到 `.local/archive/2026-10-09/`。未删除文件，逐文件校验SHA-256一致；原位置与新位置见归档中的move-manifest.json。

正式HTML、CSS、JS、assets、PDF和现有跟踪研究资料保持路径不变。`.design/`与`.audit/`保留原位置，以维持已有检查记录和聊天截图引用。`.codegraph/`、`.local/`和`.vercel/`加入Git忽略。

旧方案如需恢复：先确认原位置没有同名文件，再按move-manifest.json将选定条目移回项目根目录。不要覆盖同名文件。归档中的旧HTML不作为独立可预览副本；其相对资源路径按原根目录设计。

验证：移动前后文件哈希一致；运行发布检查验证正式页面、资源、锚点及语言配对。没有重新制作或改写PDF。
