/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist';
import { Plt } from '../../plotly/plot';
import { DefaultStatsParameters } from '../../../../../common/constants/explorer';
import { DefaultChartStyles, PLOTLY_COLOR } from '../../../../../common/constants/shared';
import { ThresholdUnitType } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls/config_thresholds';

const { LegendPosition } = DefaultChartStyles;
const { Orientation, StatsTextMode, DataSlice } = DefaultStatsParameters;

export const Stats = ({ visualizations, layout, config }: any) => {
  const {
    data,
    metadata: { fields },
  } = visualizations.data.rawVizData;

  // data config parametrs
  const { dataConfig = {}, layoutConfig = {} } = visualizations.data.userConfigs;
  const dataConfigTab = visualizations?.data?.rawVizData?.Stats?.dataConfig;
  const dimensions = dataConfigTab?.dimensions
    ? dataConfigTab?.dimensions?.filter((i) => i.name !== '')
    : [];
  const metrics = dataConfigTab?.metrics
    ? dataConfigTab?.metrics?.filter((i) => i.name !== '')
    : [];
  const dimensionsLength = dimensions.length;
  const metricsLength = metrics.length;

  // style panel parameters
  const thresholds = dataConfig?.thresholds || [];
  const titleSize = dataConfig?.chartStyles?.titleSize;
  const valueSize = dataConfig?.chartStyles?.valueSize;
  const selectedOrientation = dataConfig?.chartStyles?.orientation || Orientation
  let orientation = selectedOrientation === 'auto' || selectedOrientation === 'v' ? 'auto' : 'h';
  const textMode = dataConfig?.chartStyles?.textMode || StatsTextMode;
  const chartType = dataConfig?.chartStyles?.chartType || StatsTextMode;
  const legendPosition = dataConfig?.legend?.position || LegendPosition;
  const dataSlice = chartType === 'auto' ? [DataSlice] : [0, 2];
  if (chartType === 'horizontal') {
    orientation = 'v';
  }
  console.log('chartType===', chartType);
  console.log('textMode====', textMode);
  console.log('orientation==', orientation);

  let lineLayout = {
    xaxis: {
      visible: false,
      showgrid: false,
      anchor: 'y1',
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
    },
    yaxis: {
      visible: false,
      showgrid: false,
      anchor: 'x1',
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
    },
  };

  let shapes: any = [];

  const statsData: Plotly.Data[] = useMemo(() => {
    let calculatedStatsData: Plotly.Data[] = [];
    if (dimensionsLength || metricsLength) {
      // case 1,2: no dimension, single/multiple metrics
      if (!dimensionsLength && metricsLength >= 1) {
        calculatedStatsData = metrics.map((metric: any) => {
          return {
            field_name: metric.name,
            value: data[metric.name][0],
          };
        });
      }

      // case 3: multiple dimensions and multiple metrics
      if (dimensionsLength && metricsLength) {
        console.log('data =====', data);
        const selectedDimensionsData = [
          ...dimensions.map((dimension: any) => data[dimension.name].slice(...dataSlice)),
        ].reduce(function (prev, cur) {
          return prev.map(function (i, j) {
            return `${i},<br>${cur[j]}`;
          });
        });

        const selectedDimensionsDataNoSlice = [
          ...dimensions.map((dimension: any) => data[dimension.name]),
        ];

        const selectedMetricsData = [
          ...metrics.map((metric: any) => data[metric.name].slice(...dataSlice)),
        ];

        selectedMetricsData.map((metricSlice: any, metricSliceIndex) => {
          calculatedStatsData = [
            ...calculatedStatsData,
            ...metricSlice.map((metricSliceData: any, metricSliceDataIndex: number) => {
              return {
                dimension_name: selectedDimensionsData[metricSliceDataIndex],
                time_series_metric: data[metrics[metricSliceIndex].name],
                time_series_dimension: selectedDimensionsDataNoSlice[metricSliceDataIndex],
                field_name: `${selectedDimensionsData[metricSliceDataIndex]},<br>${metrics[metricSliceIndex].name}`,
                value: metricSliceData,
              };
            }),
          ];
        });
      }
      console.log('calculatedStatsData ---indicator', calculatedStatsData);
      return calculatedStatsData.reduce((prev, curr, index) => {
        console.log('prevvvv', prev, 'currr', curr, 'index===', index);

        lineLayout = {
          ...lineLayout,
          [`yaxis${index > 0 ? index + 1 : ''}`]: {
            visible: false,
            showgrid: false,
            anchor: `x${index > 0 ? index + 1 : ''}`,
            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 0,
            },
          },
          [`xaxis${index > 0 ? index + 1 : ''}`]: {
            visible: false,
            showgrid: false,
            anchor: `y${index > 0 ? index + 1 : ''}`,
            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 0,
            },
          },
        };

        const trace = [
          {
            type: 'indicator',
            mode: 'number',
            // visible: 'legendonly',
            ...(textMode === 'auto'
              ? {
                  title: {
                    text: curr.field_name,
                    font: { size: titleSize },
                  },
                  value: curr.value || 0,
                }
              : textMode === 'names'
              ? {
                  title: {
                    text: curr.field_name,
                    font: { size: titleSize },
                  },
                }
              : {
                  value: curr.value || 0,
                }),
            ...(valueSize && {
              number: {
                font: {
                  size: valueSize,
                },
                valueformat: 'f',
              },
            }),
            domain: {
              ...(chartType === 'auto'
                ? orientation === 'auto'
                  ? { row: 0, column: index }
                  : { row: index, column: 0 }
                : chartType === 'horizontal'
                ? orientation === 'auto'
                  ? { row: index, column: 0 }
                  : { row: 0, column: index }
                : {}),
            },
          },
        ];
        if (chartType === 'auto') {
          trace.push({
            fill: 'tozeroy',
            mode: 'line',
            x: curr.time_series_dimension,
            y: curr.time_series_metric,
            type: 'scatter',
            name: curr.dimension_name,
            ...(index > 0 && {
              xaxis: `x${index + 1}`,
              yaxis: `y${index + 1}`,
            }),
          });
        }

        if(chartType === 'horizontal'){
          shapes.push({
            type: 'rect',
            xref: `x${index > 0 ? index + 1 : ''}`,
            yref: `y${index > 0 ? index + 1 : ''}`,
            x0: 0,
            y0: index,
            // x1: 0.5,
            // y1: 0.5,
            xsizemode: 'scaled',
            // line: {
            //   color: 'rgb(50, 171, 96)',
            //   width: 3
            // },
            fillcolor: PLOTLY_COLOR[index],
            "layer": "below",
          })
        }

        return prev.concat(trace);
      }, []);
    }
    return calculatedStatsData;
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
    chartType,
  ]);

  const mergedLayout = useMemo(() => {
    return {
      grid: {
        ...(chartType === 'auto'
          ? orientation === 'auto'
            ? {
                rows: 1,
                columns: metricsLength,
                xgap: 0,
              }
            : {
                rows: metricsLength,
                columns: 1,
                ygap: 0,
              }
          : chartType === 'horizontal'
          ? orientation === 'auto'
            ? {
                rows: 1,
                columns: metricsLength,
                xgap: 0,
              }
            : {
                rows: metricsLength,
                columns: 1,
                ygap: 0,
              }
          : {}),

        pattern: 'independent',
        roworder: 'bottom to top',
      },
      ...layout,
      ...(layoutConfig.layout && layoutConfig.layout),
      title: dataConfig?.panelOptions?.title || layoutConfig.layout?.title || '',
      showlegend: false,
      ...(chartType === 'auto' && { ...lineLayout }),
      // ...lineLayout,
      paper_bgcolor: "red",
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
      ...(chartType === 'horizontal'
        ? {
            shapes : shapes
          }
        : {}),
    };
  }, [
    data,
    layout,
    statsData.length,
    layoutConfig.layout,
    dataConfig?.panelOptions?.title,
    orientation,
    chartType,
  ]);

  const mergedConfigs = {
    ...config,
    ...(layoutConfig.config && layoutConfig.config),
  };

  console.log('statsData====', statsData);
  console.log('mergedLayout ===', mergedLayout);
  return <Plt data={statsData} layout={mergedLayout} config={mergedConfigs} />;
};
