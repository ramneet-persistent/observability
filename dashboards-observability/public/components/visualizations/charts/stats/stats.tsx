/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist';
import { uniqBy } from 'lodash';
import { Plt } from '../../plotly/plot';
import { ThresholdUnitType } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls/config_thresholds';
import { EmptyPlaceholder } from '../../../event_analytics/explorer/visualizations/shared_components/empty_placeholder';
import { ConfigListEntry } from '../../../../../common/types/explorer';
import {
  hexToRgb,
  filterDataConfigParameter,
  getRoundOf,
  getTooltipHoverInfo,
} from '../../../event_analytics/utils/utils';
import { uiSettingsService } from '../../../../../common/utils';
import {
  STATS_GRID_SPACE_BETWEEN_X_AXIS,
  STATS_GRID_SPACE_BETWEEN_Y_AXIS,
  DefaultStatsParameters,
  STATS_AXIS_MARGIN,
  STATS_ANNOTATION,
  STATS_REDUCE_VALUE_SIZE_PERCENTAGE,
  STATS_REDUCE_TITLE_SIZE_PERCENTAGE,
  STATS_REDUCE_METRIC_UNIT_SIZE_PERCENTAGE,
  STATS_METRIC_UNIT_SUBSTRING_LENGTH,
} from '../../../../../common/constants/explorer';
import { DefaultChartStyles, FILLOPACITY_DIV_FACTOR } from '../../../../../common/constants/shared';
import { COLOR_BLACK, COLOR_WHITE } from '../../../../../common/constants/colors';

const {
  DefaultOrientation,
  DefaultTextMode,
  DefaultChartType,
  BaseThreshold,
  DefaultTextColor,
} = DefaultStatsParameters;

interface CreateAnnotationType {
  index: number;
  label: string;
  value: number | string;
  valueColor: string;
}

export const Stats = ({ visualizations, layout, config }: any) => {
  const { vis } = visualizations;
  const {
    data,
    metadata: { fields },
  } = visualizations?.data?.rawVizData;

  // data config parametrs
  const {
    dataConfig: {
      chartStyles = {},
      valueOptions = {},
      panelOptions = {},
      tooltipOptions = {},
      thresholds = [],
    },
    layoutConfig = {},
  } = visualizations?.data?.userConfigs;
  const dimensions = valueOptions?.dimensions
    ? filterDataConfigParameter(valueOptions.dimensions)
    : [];
  const metrics = valueOptions?.metrics ? filterDataConfigParameter(valueOptions.metrics) : [];
  const metricsLength = metrics.length;
  const chartType = chartStyles.chartType || vis.charttype;

  if ((chartType === DefaultChartType && dimensions.length === 0) || metricsLength === 0)
    return <EmptyPlaceholder icon={visualizations?.vis?.icontype} />;

  // thresholds
  const appliedThresholds = thresholds.length ? thresholds : [BaseThreshold];
  const sortedThresholds = uniqBy(
    [...appliedThresholds].sort((a: ThresholdUnitType, b: ThresholdUnitType) => a.value - b.value),
    'value'
  );
  // style panel parameters
  let titleSize =
    chartStyles.titleSize ||
    vis.titlesize - vis.titlesize * metricsLength * STATS_REDUCE_TITLE_SIZE_PERCENTAGE;
  const valueSize =
    chartStyles.valueSize ||
    vis.valuesize - vis.valuesize * metricsLength * STATS_REDUCE_VALUE_SIZE_PERCENTAGE;
  const selectedOrientation = chartStyles.orientation || vis.orientation;
  const orientation =
    selectedOrientation === DefaultOrientation || selectedOrientation === 'v'
      ? DefaultOrientation
      : 'h';
  const selectedTextMode = chartStyles.textMode || vis.textmode;
  let textMode =
    selectedTextMode === DefaultTextMode || selectedTextMode === 'values+names'
      ? DefaultTextMode
      : selectedTextMode;
  const precisionValue = chartStyles.precisionValue || vis.precisionvalue;
  const metricUnits =
    chartStyles.metricUnits?.substring(0, STATS_METRIC_UNIT_SUBSTRING_LENGTH) || '';
  const metricUnitsSize = valueSize - valueSize * STATS_REDUCE_METRIC_UNIT_SIZE_PERCENTAGE;
  const isDarkMode = uiSettingsService.get('theme:darkMode');
  const textColor = chartStyles.textColor?.childColor || DefaultTextColor;

  if (chartType === 'text' && chartStyles.textMode === undefined) {
    textMode = 'names';
    titleSize = vis.titlesize;
  }

  // margin from left of grid cell for label/value
  const ANNOTATION_MARGIN_LEFT = metricsLength > 1 ? 0.01 : 0;
  let chartLayout: object = {
    annotations: [],
    shapes: [],
  };

  const selectedDimensionsData = dimensions.reduce((prev, cur) => {
    if (prev.length === 0) return data[cur.name].flat();
    return prev.map(
      (item: string | number, index: number) => `${item},<br>${data[cur.name][index]}`
    );
  }, []);

  const createValueText = (value: string | number) =>
    `<b>${value}${
      metricUnits ? `<span style="font-size: ${metricUnitsSize}px"}> ${metricUnits}</span>` : ''
    }</b>`;

  const calculateTextCooridinate = (metricLength: number, index: number) => {
    if (metricLength === 1) {
      return 0.5;
    } else {
      // calculate center of respective axis in each subplot based on metric length
      if (index === 0) {
        return 1 / metricLength / 2;
      } else {
        return (index + 1) / metricLength - 1 / metricLength / 2;
      }
    }
  };

  const createAnnotationsAutoModeHorizontal = ({
    label,
    value,
    index,
    valueColor,
  }: CreateAnnotationType) => {
    return textMode === 'values+names' || textMode === DefaultTextMode
      ? [
          {
            ...STATS_ANNOTATION,
            x: 0 + ANNOTATION_MARGIN_LEFT,
            y: index > 0 ? (index + 1) / metricsLength : 1 / metricsLength,
            xanchor: 'left',
            yanchor: 'top',
            text: label,
            font: {
              size: titleSize,
              color: isDarkMode ? COLOR_WHITE : COLOR_BLACK,
              family: 'Roboto',
            },
            type: 'name',
            metricValue: value,
          },
          {
            ...STATS_ANNOTATION,
            x: 1,
            y: index > 0 ? (index + 1) / metricsLength : 1 / metricsLength,
            xanchor: 'right',
            yanchor: 'top',
            text: createValueText(value),
            font: {
              size: valueSize,
              color: valueColor,
              family: 'Roboto',
            },
            type: 'value',
            metricValue: value,
          },
        ]
      : [
          {
            ...STATS_ANNOTATION,
            x: 0.5,
            y: calculateTextCooridinate(metricsLength, index),
            xanchor: 'center',
            yanchor: 'bottom',
            text: textMode === 'values' ? createValueText(value) : label,
            font: {
              size: textMode === 'values' ? valueSize : titleSize,
              color: textMode === 'names' ? (isDarkMode ? COLOR_WHITE : COLOR_BLACK) : valueColor,
              family: 'Roboto',
            },
            type: textMode === 'names' ? 'name' : 'value',
            metricValue: value,
          },
        ];
  };

  const createAnnotationAutoModeVertical = ({
    label,
    value,
    index,
    valueColor,
  }: CreateAnnotationType) => {
    return textMode === 'values+names' || textMode === DefaultTextMode
      ? [
          {
            ...STATS_ANNOTATION,
            xanchor: 'left',
            yanchor: 'bottom',
            text: label,
            font: {
              size: titleSize,
              color: isDarkMode ? COLOR_WHITE : COLOR_BLACK,
              family: 'Roboto',
            },
            x: index / metricsLength + ANNOTATION_MARGIN_LEFT,
            y: 1,
            metricValue: value,
            type: 'name',
          },
          {
            ...STATS_ANNOTATION,
            xanchor: 'left',
            yanchor: 'top',
            text: createValueText(value),
            font: {
              size: valueSize,
              color: valueColor,
              family: 'Roboto',
            },
            x: index / metricsLength + ANNOTATION_MARGIN_LEFT,
            y: 1,
            type: 'value',
            metricValue: value,
          },
        ]
      : [
          {
            ...STATS_ANNOTATION,
            x: calculateTextCooridinate(metricsLength, index),
            xanchor: 'center',
            y: 0.95,
            yanchor: 'bottom',
            text: textMode === 'values' ? createValueText(value) : label,
            font: {
              size: textMode === 'values' ? valueSize : titleSize,
              color: textMode === 'names' ? (isDarkMode ? COLOR_WHITE : COLOR_BLACK) : valueColor,
              family: 'Roboto',
            },
            type: textMode === 'names' ? 'name' : 'value',
            metricValue: value,
          },
        ];
  };

  // extend y axis range to increase height of subplot w.r.t metric data
  const extendYaxisRange = (metric: ConfigListEntry) => {
    const sortedData = data[metric.label].slice().sort((curr: number, next: number) => next - curr);
    return isNaN(sortedData[0]) ? 100 : sortedData[0] + sortedData[0] / 2;
  };

  const getMetricValue = (label: string) =>
    typeof data[label][data[label].length - 1] === 'number'
      ? getRoundOf(data[label][data[label].length - 1], Math.abs(precisionValue))
      : 0;

  const generateLineTraces = () => {
    return metrics.map((metric: ConfigListEntry, metricIndex: number) => {
      const annotationOption = {
        label: metric.label,
        value: getMetricValue(metric.label),
        index: metricIndex,
        valueColor: '',
      };
      const layoutAxisIndex = metricIndex > 0 ? metricIndex + 1 : '';
      chartLayout = {
        ...chartLayout,
        annotations: chartLayout.annotations.concat(
          orientation === DefaultOrientation || metricsLength === 1
            ? createAnnotationAutoModeVertical(annotationOption)
            : createAnnotationsAutoModeHorizontal(annotationOption)
        ),
        [`xaxis${layoutAxisIndex}`]: {
          visible: false,
          showgrid: false,
          anchor: `y${layoutAxisIndex}`,
          layoutFor: metric.label,
        },
        [`yaxis${layoutAxisIndex}`]: {
          visible: false,
          showgrid: false,
          anchor: `x${layoutAxisIndex}`,
          range: [0, extendYaxisRange(metric)],
          layoutFor: metric.label,
        },
      };

      return {
        x: selectedDimensionsData,
        y: data[metric.label],
        metricValue: getMetricValue(metric.label),
        fill: 'tozeroy',
        mode: 'lines',
        type: 'scatter',
        fillcolor: '',
        line: {
          color: '',
        },
        name: metric.label,
        ...(metricIndex > 0 && {
          xaxis: `x${metricIndex + 1}`,
          yaxis: `y${metricIndex + 1}`,
        }),
        hoverinfo: getTooltipHoverInfo({
          tooltipMode: tooltipOptions.tooltipMode,
          tooltipText: tooltipOptions.tooltipText,
        }),
      };
    });
  };

  const createAnnotationTextModeVertical = ({
    label,
    value,
    index,
    valueColor,
  }: CreateAnnotationType) => {
    return textMode === DefaultTextMode
      ? [
          {
            ...STATS_ANNOTATION,
            xanchor: 'left',
            yanchor: metricsLength === 1 ? 'center' : 'bottom',
            text: label,
            font: {
              size: titleSize,
              color: textColor,
              family: 'Roboto',
            },
            x:
              metricsLength === 1
                ? 0 + ANNOTATION_MARGIN_LEFT
                : index / metricsLength + ANNOTATION_MARGIN_LEFT,
            y: 0.5,
            metricValue: value,
            type: 'name',
          },
          {
            ...STATS_ANNOTATION,
            xanchor: metricsLength === 1 ? 'right' : 'left',
            yanchor: metricsLength === 1 ? 'center' : 'top',
            text: createValueText(value),
            font: {
              size: valueSize,
              color: textColor,
              family: 'Roboto',
            },
            x:
              metricsLength === 1
                ? 1 - ANNOTATION_MARGIN_LEFT
                : index / metricsLength + ANNOTATION_MARGIN_LEFT,
            y: 0.5,
            type: 'value',
            metricValue: value,
          },
        ]
      : [
          {
            ...STATS_ANNOTATION,
            x: calculateTextCooridinate(metricsLength, index),
            xanchor: 'center',
            y: 0.5,
            yanchor: 'center',
            text: textMode === 'values' ? createValueText(value) : label,
            font: {
              size: textMode === 'values' ? valueSize : titleSize,
              color: textColor,
              family: 'Roboto',
            },
            type: textMode === 'names' ? 'name' : 'value',
            metricValue: value,
          },
        ];
  };

  const createAnnotationTextModeHorizontal = ({
    label,
    value,
    index,
    valueColor,
  }: CreateAnnotationType) => {
    return textMode === DefaultTextMode
      ? [
          {
            ...STATS_ANNOTATION,
            xanchor: 'left',
            yanchor: 'center',
            text: label,
            font: {
              size: titleSize,
              color: COLOR_WHITE,
              family: 'Roboto',
            },
            x: 0 + ANNOTATION_MARGIN_LEFT,
            y: calculateTextCooridinate(metricsLength, index),
            metricValue: value,
            type: 'name',
          },
          {
            ...STATS_ANNOTATION,
            xanchor: 'right',
            yanchor: 'center',
            text: createValueText(value),
            font: {
              size: valueSize,
              color: COLOR_WHITE,
              family: 'Roboto',
            },
            x: 1 - ANNOTATION_MARGIN_LEFT,
            y:
              metricsLength === 1
                ? 0.5
                : index === 0
                ? 1 / metricsLength / 2
                : (index + 1) / metricsLength - 1 / metricsLength / 2,
            type: 'value',
            metricValue: value,
          },
        ]
      : [
          {
            ...STATS_ANNOTATION,
            xanchor: 'center',
            yanchor: 'center',
            x: 0.5,
            y:
              metricsLength === 1
                ? 0.5
                : index === 0
                ? 1 / metricsLength / 2
                : (index + 1) / metricsLength - 1 / metricsLength / 2,
            text: textMode === 'values' ? createValueText(value) : label,
            font: {
              size: textMode === 'values' ? valueSize : titleSize,
              color: COLOR_WHITE,
              family: 'Roboto',
            },
            type: textMode === 'names' ? 'name' : 'value',
            metricValue: value,
          },
        ];
  };

  const generateRectShapes = () => {
    const shape = {
      type: 'rect',
      xsizemode: 'scaled',
      layer: 'below',
      yref: 'paper',
      xref: 'paper',
    };
    const shapes: any = [];
    metrics.forEach((metric: ConfigListEntry, metricIndex: number) => {
      chartLayout = {
        ...chartLayout,
        annotations: chartLayout.annotations.concat(
          orientation === DefaultOrientation || metricsLength === 1
            ? createAnnotationTextModeVertical({
                label: metric.label,
                value: getMetricValue(metric.label),
                index: metricIndex,
                valueColor: '',
              })
            : createAnnotationTextModeHorizontal({
                label: metric.label,
                value: getMetricValue(metric.label),
                index: metricIndex,
                valueColor: '',
              })
        ),
        [`yaxis${metricIndex > 0 ? metricIndex + 1 : ''}`]: {
          visible: false,
          showgrid: false,
          anchor: `x${metricIndex > 0 ? metricIndex + 1 : ''}`,
        },
        [`xaxis${metricIndex > 0 ? metricIndex + 1 : ''}`]: {
          visible: false,
          showgrid: false,
          anchor: `y${metricIndex > 0 ? metricIndex + 1 : ''}`,
        },
      };
      const shapeColor = {
        line: {
          color: '',
          width: 3,
        },
        fillcolor: '',
      };
      const nonSimilarAxis = orientation === DefaultOrientation ? 'x' : 'y';
      const similarAxis = orientation === DefaultOrientation ? 'y' : 'x';
      // for first metric
      if (metricIndex === 0) {
        shapes.push({
          ...shape,
          ...shapeColor,
          [`${nonSimilarAxis}0`]: 0,
          [`${nonSimilarAxis}1`]: 1 / metricsLength,
          [`${similarAxis}0`]: 0,
          [`${similarAxis}1`]: 1,
          metricValue: getMetricValue(metric.label),
        });
      } else {
        shapes.push({
          ...shape,
          ...shapeColor,
          [`${nonSimilarAxis}0`]:
            shapes[shapes.length - 1][`${nonSimilarAxis}1`] + STATS_GRID_SPACE_BETWEEN_X_AXIS,
          [`${nonSimilarAxis}1`]:
            shapes[shapes.length - 1][`${nonSimilarAxis}1`] + 1 / metricsLength,
          [`${similarAxis}0`]: 0,
          [`${similarAxis}1`]: 1,
          metricValue: getMetricValue(metric.label),
        });
      }
    });
    return shapes;
  };

  const [statsData, statsLayout]: Plotly.Data[] = useMemo(() => {
    let calculatedStatsData: Plotly.Data[] = [];
    let sortedStatsData: Plotly.Data[] = [];
    let sortedShapesData = [];
    if (chartType === DefaultChartType) {
      calculatedStatsData = generateLineTraces();
      sortedStatsData = calculatedStatsData
        .map((stat, statIndex) => ({ ...stat, oldIndex: statIndex }))
        .sort((statCurrent, statNext) => statCurrent.metricValue - statNext.metricValue);
    } else {
      const shapes = generateRectShapes();
      chartLayout = {
        ...chartLayout,
        shapes,
      };
      sortedShapesData = shapes
        .map((shape: object, shapeIndex: number) => ({ ...shape, oldIndex: shapeIndex }))
        .sort((current: object, next: object) => current.metricValue - next.metricValue);
    }

    if (sortedThresholds.length) {
      // threshold ranges with min, max values
      let thresholdRanges: number[][] = [];
      const maxValue =
        chartType === DefaultChartType
          ? sortedStatsData[sortedStatsData.length - 1].metricValue
          : sortedShapesData[sortedShapesData.length - 1].metricValue;
      thresholdRanges = sortedThresholds.map((thresh, index) => [
        thresh.value,
        index === sortedThresholds.length - 1 ? maxValue : sortedThresholds[index + 1].value,
      ]);

      if (chartType === DefaultChartType) {
        // change color for line traces
        for (let statIndex = 0; statIndex < sortedStatsData.length; statIndex++) {
          const metricValue = Number(sortedStatsData[statIndex].metricValue);
          for (let threshIndex = 0; threshIndex < thresholdRanges.length; threshIndex++) {
            if (
              metricValue >= Number(thresholdRanges[threshIndex][0]) &&
              metricValue <= Number(thresholdRanges[threshIndex][1])
            ) {
              calculatedStatsData[sortedStatsData[statIndex].oldIndex].fillcolor = hexToRgb(
                sortedThresholds[threshIndex].color,
                DefaultChartStyles.FillOpacity / FILLOPACITY_DIV_FACTOR
              );
              calculatedStatsData[sortedStatsData[statIndex].oldIndex].line.color =
                sortedThresholds[threshIndex].color;
            }
          }
        }
        // change color of text annotations
        for (
          let annotationIndex = 0;
          annotationIndex < chartLayout.annotations.length;
          annotationIndex++
        ) {
          const isMetricValueText = chartLayout.annotations[annotationIndex].type === 'value';
          const metricValue = Number(chartLayout.annotations[annotationIndex].metricValue);
          for (let threshIndex = 0; threshIndex < thresholdRanges.length; threshIndex++) {
            if (
              chartType === DefaultChartType &&
              isMetricValueText &&
              metricValue >= Number(thresholdRanges[threshIndex][0]) &&
              metricValue <= Number(thresholdRanges[threshIndex][1])
            ) {
              chartLayout.annotations[annotationIndex].font.color =
                sortedThresholds[threshIndex].color;
            }
          }
        }
      } else {
        // change color of shapes
        for (let shapeIndex = 0; shapeIndex < sortedShapesData.length; shapeIndex++) {
          for (let threshIndex = 0; threshIndex < thresholdRanges.length; threshIndex++) {
            if (
              Number(sortedShapesData[shapeIndex].metricValue) >=
                Number(thresholdRanges[threshIndex][0]) &&
              Number(sortedShapesData[shapeIndex].metricValue) <=
                Number(thresholdRanges[threshIndex][1])
            ) {
              chartLayout.shapes[sortedShapesData[shapeIndex].oldIndex].fillcolor =
                sortedThresholds[threshIndex].color;
              chartLayout.shapes[sortedShapesData[shapeIndex].oldIndex].line.color =
                sortedThresholds[threshIndex].color;
            }
          }
        }
      }
    }
    return [chartType === DefaultChartType ? calculatedStatsData : [], chartLayout];
  }, [
    dimensions,
    metrics,
    data,
    fields,
    thresholds,
    orientation,
    titleSize,
    valueSize,
    textMode,
    metricUnits,
  ]);

  const mergedLayout = useMemo(() => {
    return {
      ...layout,
      ...(layoutConfig.layout && layoutConfig.layout),
      showlegend: false,
      margin:
        chartType === DefaultChartType
          ? STATS_AXIS_MARGIN
          : panelOptions.title || layoutConfig.layout?.title
          ? STATS_AXIS_MARGIN
          : { ...STATS_AXIS_MARGIN, t: 0 },
      ...statsLayout,
      grid: {
        ...(orientation === DefaultOrientation
          ? {
              rows: 1,
              columns: metricsLength,
              xgap: STATS_GRID_SPACE_BETWEEN_X_AXIS,
            }
          : {
              rows: metricsLength,
              columns: 1,
              ygap: STATS_GRID_SPACE_BETWEEN_Y_AXIS,
            }),
        pattern: 'independent',
        roworder: 'bottom to top',
      },
      title: panelOptions.title || layoutConfig.layout?.title || '',
    };
  }, [
    data,
    layout,
    layoutConfig.layout,
    panelOptions.title,
    orientation,
    metricsLength,
    statsLayout,
    thresholds,
  ]);

  const mergedConfigs = {
    ...config,
    ...(layoutConfig.config && layoutConfig.config),
  };

  return <Plt data={statsData} layout={mergedLayout} config={mergedConfigs} />;
};
