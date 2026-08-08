import type { ChartValue } from "@tanstack/charts";
import { Chart } from "@tanstack/react-charts";
import type { ChartProps } from "@tanstack/react-charts";
import type { CSSProperties, ReactNode } from "react";

export type TanStackChartProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = Omit<ChartProps<TDatum, TXValue, TYValue>, "height" | "initialWidth"> & {
  children?: ReactNode;
  height: number;
  initialWidth?: number;
  style?: CSSProperties;
};

/**
 * Shared chart host. The definition stays framework-neutral while this host
 * owns the React adapter's SSR width and the application's responsive surface.
 */
export function TanStackChart<TDatum, TXValue extends ChartValue, TYValue extends ChartValue>({
  ariaDescription,
  ariaLabel,
  children,
  className,
  definition,
  height,
  initialWidth = 720,
  onFocusChange,
  onSelect,
  style,
}: TanStackChartProps<TDatum, TXValue, TYValue>) {
  return (
    <div
      className={className}
      data-chart-engine="tanstack"
      style={{ minHeight: height, width: "100%", ...style }}
    >
      <Chart
        ariaDescription={ariaDescription}
        ariaLabel={ariaLabel}
        definition={definition}
        height={height}
        initialWidth={initialWidth}
        onFocusChange={onFocusChange}
        onSelect={onSelect}
      />
      {children}
    </div>
  );
}
