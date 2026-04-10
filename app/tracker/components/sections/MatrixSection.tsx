"use client";

import { Paper, ScrollArea, Text } from "@mantine/core";
import { buildTopicCells } from "../../lib/stats";
import { formatShortDate } from "../../lib/date";
import type { DailyEntry, Topic } from "../../lib/types";
import classes from "./MatrixSection.module.css";

interface MatrixSectionProps {
  topics: Topic[];
  dates: string[];
  entryMap: Map<string, DailyEntry>;
  onSelectCell: (topic: Topic, date: string) => void;
}

export default function MatrixSection({
  topics,
  dates,
  entryMap,
  onSelectCell,
}: MatrixSectionProps) {
  return (
    <Paper className={classes.section} radius="md" data-testid="tracker-matrix-grid">
      <Text className={classes.title}>Topic x day matrix</Text>
      <Text className={classes.subtitle}>
        Expected cells are interactive. Non-expected days stay out of compliance metrics.
      </Text>
      <ScrollArea mt="lg">
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Topic</th>
              {dates.map((date) => (
                <th key={date}>{formatShortDate(date)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => {
              const cells = buildTopicCells(topic, dates, entryMap);

              return (
                <tr key={topic.id}>
                  <td>
                    <div className={classes.topicCell}>
                      <span className={classes.dot} style={{ backgroundColor: topic.color }} />
                      <span>{topic.name}</span>
                    </div>
                  </td>
                  {cells.map((cell) => (
                    <td key={`${topic.id}-${cell.date}`}>
                      <button
                        className={classes.cell}
                        data-state={cell.state}
                        disabled={!cell.expected}
                        onClick={() => onSelectCell(topic, cell.date)}
                        type="button"
                      >
                        {cell.entry ? `${cell.entry.value}%` : cell.expected ? "..." : " "}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </Paper>
  );
}
