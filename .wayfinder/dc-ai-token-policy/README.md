# DC 员工 AI 额度机制本地 Wayfinder

本目录使用本地 Markdown 模拟 issue tracker。

- `map.md` 是唯一地图，带 `wayfinder:map` 标签。
- `tickets/` 中每个文件是一张子 issue；标题是对外引用名称。
- `status: open` 且 `assignee` 为空，并且 `blocked_by` 中所有票已关闭时，该票位于 frontier。
- 开始处理前先在 `assignee` 中写入负责人；结论作为 `## Resolution` 追加到对应票，随后改为 `status: closed`。
- 关闭决策票后，只在地图的 `Decisions so far` 中增加一行摘要和链接，不重复完整结论。

当前 frontier：

- [建立真实用量基线](tickets/02-建立真实用量基线.md)
