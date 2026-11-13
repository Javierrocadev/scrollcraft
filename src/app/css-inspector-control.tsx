"use client";

import * as React from "react";
import {
  useToolcraftEvaluatedValues,
  type ToolcraftCustomControlRendererProps,
} from "@/toolcraft/runtime/react";

import { generateScrollDrivenCss } from "./css-generator";
import { readScrollCraftConfigFromValues } from "./scroll-config";
import styles from "./css-inspector-control.module.css";

export function CssInspectorControl({
  value,
}: ToolcraftCustomControlRendererProps): React.JSX.Element {
  const evaluated = useToolcraftEvaluatedValues();
  const config = React.useMemo(
    () => readScrollCraftConfigFromValues(evaluated),
    [evaluated],
  );
  const generated = React.useMemo(
    () => generateScrollDrivenCss(config),
    [config],
  );
  const isCopied = value === "copied";

  return (
    <div
      className={styles.inspector}
      data-scrollcraft-css-inspector=""
    >
      <div className={styles.headerRow}>
        <span className={styles.compatBadge}>
          <span className={styles.compatDot} />
          Baseline 2026 Ready
        </span>
        <span
          className={styles.statusBadge}
          data-scrollcraft-copy-status={isCopied ? "copied" : "ready"}
        >
          {isCopied ? "¡Copiado!" : generated.selectorName}
        </span>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaChip}>{generated.timelineRule}</span>
        <span className={styles.metaChip}>{generated.rangeSummary}</span>
      </div>

      <pre
        className={styles.codeBlock}
        data-scrollcraft-css-code=""
      >
        <code>{generated.cssText}</code>
      </pre>

      <div className={styles.compatNote}>
        {generated.compatibilitySummary}
      </div>
    </div>
  );
}
