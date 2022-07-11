/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist';
import { Plt } from '../../plotly/plot';
import { PLOTLY_GAUGE_COLUMN_NUMBER } from '../../../../../common/constants/explorer';
import { DefaultChartStyles } from '../../../../../common/constants/shared';
import { ThresholdUnitType } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls/config_thresholds';

const { Orientation, StatsTextMode, LegendPosition } = DefaultChartStyles;

export const Stats = ({ visualizations, layout, config }: any) => {
  const {
    data,
    metadata: { fields },
  } = visualizations.data.rawVizData;

  // data config parametrs
  const { dataConfig = {}, layoutConfig = {} } = visualizations.data.userConfigs;
  console.log('visualizations.data.userConfigs==', visualizations);
  const dataConfigTab = visualizations?.data?.rawVizData?.Stats?.dataConfig;
  console.log('dataConfigTab ===', dataConfigTab);
  const dimensions = dataConfigTab?.dimensions ? dataConfigTab?.dimensions : [];
  const metrics = dataConfigTab?.metrics ? dataConfigTab?.metrics : [];
  const dimensionsLength = dimensions.length && dimensions[0]?.name != '' ? dimensions.length : 0;
  const metricsLength = metrics.length && metrics[0]?.name != '' ? metrics.length : 0;
  console.log('dataConfig?.chartStyles===', dataConfig);
  // style panel parameters
  const thresholds = dataConfig?.thresholds || [];
  const titleSize = dataConfig?.chartStyles?.titleSize;
  const valueSize = dataConfig?.chartStyles?.valueSize;
  const orientation = dataConfig?.chartStyles?.orientation || Orientation;
  const textMode = dataConfig?.chartStyles?.textMode || StatsTextMode;
  const legendPosition = dataConfig?.legend?.position || LegendPosition;

  console.log("textMode====", textMode)

  // temp
  const DisplayDefaultStatsSlice = 10;
  const FRACTION = 0.5;

  const statsData: Plotly.Data[] = useMemo(() => {
    let calculatedGaugeData: Plotly.Data[] = [];
    if (dimensionsLength || metricsLength) {
      // case 1,2: no dimension, single/multiple metrics
      if (!dimensionsLength && metricsLength >= 1) {
        calculatedGaugeData = metrics.map((metric: any) => {
          return {
            field_name: metric.name,
            value: data[metric.name][0],
          };
        });
      }

      // case 3: multiple dimensions and multiple metrics
      if (dimensionsLength && metricsLength) {
        const selectedDimensionsData = [
          ...dimensions.map((dimension: any) =>
            data[dimension.name].slice(0, DisplayDefaultStatsSlice)
          ),
        ].reduce(function (prev, cur) {
          return prev.map(function (i, j) {
            return `${i},<br>${cur[j]}`;
          });
        });

        const selectedMetricsData = [
          ...metrics.map((metric: any) => data[metric.name].slice(0, DisplayDefaultStatsSlice)),
        ];

        selectedMetricsData.map((metricSlice: any, metricSliceIndex) => {
          calculatedGaugeData = [
            ...calculatedGaugeData,
            ...metricSlice.map((metricSliceData: any, metricSliceDataIndex: number) => {
              return {
                field_name: `${selectedDimensionsData[metricSliceDataIndex]},<br>${metrics[metricSliceIndex].name}`,
                value: metricSliceData,
              };
            }),
          ];
        });
      }

      return calculatedGaugeData.map((gauge, index) => {
        console.log(
          'DATA === rowwwww',
          Math.floor(index / PLOTLY_GAUGE_COLUMN_NUMBER),
          'column ==',
          index % PLOTLY_GAUGE_COLUMN_NUMBER
        );

        return {
          type: 'indicator',
          mode: 'number',
          value: gauge.value || 0,
          title: {
            text: gauge.field_name,
            font: { size: titleSize },
          },
          ...(valueSize && {
            number: {
              font: {
                size: valueSize,
              },
            },
          }),
          domain: {
            row: Math.floor(index / PLOTLY_GAUGE_COLUMN_NUMBER),
            column: index % PLOTLY_GAUGE_COLUMN_NUMBER,
            // ...(orientation === 'auto' || orientation === 'h'
            //   ? {
            //       row: Math.floor(index / PLOTLY_GAUGE_COLUMN_NUMBER),
            //       column: index % PLOTLY_GAUGE_COLUMN_NUMBER,
            //     }
            //   : {
            //       column: Math.floor(index / PLOTLY_GAUGE_COLUMN_NUMBER),
            //       row: index % PLOTLY_GAUGE_COLUMN_NUMBER,
            //     }),
          },
        };
      });
    }
    return calculatedGaugeData;
  }, [dimensions, metrics, data, fields, thresholds, orientation, titleSize, valueSize]);

  // const mergedLayout = {
  //   ...layout,
  //   ...layoutConfig.layout,
  //   title: dataConfig?.panelOptions?.title || layoutConfig.layout?.title || '',
  //   legend: {
  //     ...layout.legend,
  //     orientation: legendPosition,
  //   },
  //   // margin: { t: 25, r: 25, l: 25, b: 25 },
  // };
  const mergedLayout = useMemo(() => {
    const isAtleastOneFullRow = Math.floor(statsData.length / PLOTLY_GAUGE_COLUMN_NUMBER) > 0;
    console.log(
      'LAYOUT ====isAtleastOneFullRow',
      isAtleastOneFullRow,
      'row ==',
      Math.floor(statsData.length / PLOTLY_GAUGE_COLUMN_NUMBER) + 1,
      'column ==',
      isAtleastOneFullRow ? PLOTLY_GAUGE_COLUMN_NUMBER : statsData.length
    );
    return {
      grid: {
        ...(orientation === 'auto' || orientation === 'h'
          ? {
              rows: Math.floor(statsData.length / PLOTLY_GAUGE_COLUMN_NUMBER) + 1,
              columns: isAtleastOneFullRow ? PLOTLY_GAUGE_COLUMN_NUMBER : statsData.length,
            }
          : {
              columns: Math.floor(statsData.length / PLOTLY_GAUGE_COLUMN_NUMBER) + 1,
              rows: isAtleastOneFullRow ? PLOTLY_GAUGE_COLUMN_NUMBER : statsData.length,
            }),
        pattern: 'independent',
      },
      ...layout,
      ...(layoutConfig.layout && layoutConfig.layout),
      title: dataConfig?.panelOptions?.title || layoutConfig.layout?.title || '',
      margin: { t: 25, r: 25, l: 25, b: 25 },
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
