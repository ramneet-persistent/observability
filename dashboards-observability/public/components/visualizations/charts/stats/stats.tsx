/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist';
import { Plt } from '../../plotly/plot';
import { DefaultStatsParameters } from '../../../../../common/constants/explorer';
import { DefaultChartStyles } from '../../../../../common/constants/shared';
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
  const orientation = dataConfig?.chartStyles?.orientation || Orientation;
  const textMode = dataConfig?.chartStyles?.textMode || StatsTextMode;
  const legendPosition = dataConfig?.legend?.position || LegendPosition;

  console.log('textMode====', textMode);
  let lineLayout = {
    yaxis: {
      visible: false,
      showgrid: false,
    },
  };

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
        const selectedDimensionsData = [
          ...dimensions.map((dimension: any) => data[dimension.name].slice(DataSlice)),
        ].reduce(function (prev, cur) {
          return prev.map(function (i, j) {
            return `${i},<br>${cur[j]}`;
          });
        });

        const selectedDimensionsDataNoSlice = [
          ...dimensions.map((dimension: any) => data[dimension.name]),
        ];

        const selectedMetricsData = [
          ...metrics.map((metric: any) => data[metric.name].slice(DataSlice)),
        ];

        selectedMetricsData.map((metricSlice: any, metricSliceIndex) => {
          calculatedStatsData = [
            ...calculatedStatsData,
            ...metricSlice.map((metricSliceData: any, metricSliceDataIndex: number) => {
              return {
                time_series_metric: data[metrics[metricSliceIndex].name],
                time_series_dimension: selectedDimensionsDataNoSlice[metricSliceDataIndex],
                field_name: `${selectedDimensionsData[metricSliceDataIndex]},<br>${metrics[metricSliceIndex].name}`,
                value: metricSliceData,
              };
            }),
          ];
        });
      }

      return calculatedStatsData.reduce((prev, curr, index) => {
        console.log('prevvvv', prev, 'currr', curr, 'index===', index);
        lineLayout = {
          ...lineLayout,
          [`yaxis${index > 0 ? index + 1 : ``}`]: {
            visible: false,
            showgrid: false,
          },
        };
        return prev.concat([
          {
            type: 'indicator',
            mode: 'number',
            value: curr.value || 0,
            title: {
              text: curr.field_name,
              font: { size: titleSize },
              // align: legendPlacement,
            },
            ...(valueSize && {
              number: {
                font: {
                  size: valueSize,
                },
                valueformat: 'f',
              },
            }),
            domain: {
              row: 0,
              column: index,
            },
          },
          {
            fill: 'tozeroy',
            mode: 'line',
            x: curr.time_series_dimension,
            y: curr.time_series_metric,
            type: 'scatter',
            ...(index > 0 && {
              xaxis: `x${index + 1}`,
              yaxis: `y${index + 1}`,
            }),
          },
        ]);
      }, []);
    }
    return calculatedStatsData;
  }, [dimensions, metrics, data, fields, thresholds, orientation, titleSize, valueSize]);

  const mergedLayout = useMemo(() => {
    return {
      grid: {
        rows: 1,
        columns: metricsLength,
        pattern: 'independent',
        roworder: 'bottom to top',
      },
      ...layout,
      ...(layoutConfig.layout && layoutConfig.layout),
      title: dataConfig?.panelOptions?.title || layoutConfig.layout?.title || '',
      showlegend: false,
      xaxis: {
        visible: false,
        showgrid: false,
      },
      ...lineLayout,
    };
  }, [
    data,
    layout,
    statsData.length,
    layoutConfig.layout,
    dataConfig?.panelOptions?.title,
    orientation,
  ]);

  const mergedConfigs = {
    ...config,
    ...(layoutConfig.config && layoutConfig.config),
  };

  console.log('statsData====', statsData);
  return <Plt data={statsData} layout={mergedLayout} config={mergedConfigs} />;
};
