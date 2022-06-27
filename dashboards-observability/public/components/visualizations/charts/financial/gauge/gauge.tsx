/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { indexOf } from 'lodash';
import Plotly from 'plotly.js-dist';
import { Plt } from '../../../plotly/plot';
import { NUMERICAL_FIELDS } from '../../../../../../common/constants/shared';
import { PLOTLY_GAUGE_COLUMN_NUMBER } from '../../../../../../common/constants/explorer';
import { DefaultGaugeChartSyles } from '../../../../../../common/constants/shared';

export const Gauge = ({ visualizations, layout, config }: any) => {
  const {
    data,
    metadata: { fields },
  } = visualizations.data.rawVizData;

  const { dataConfig = {}, layoutConfig = {} } = visualizations.data.userConfigs;

  const series =
    dataConfig?.valueOptions && dataConfig?.valueOptions?.series
      ? dataConfig.valueOptions.series
      : [];

  console.log('series====', series);

  const value =
    dataConfig?.valueOptions && dataConfig?.valueOptions?.value
      ? dataConfig.valueOptions.value
      : [];
  console.log('valuess===', value);

  const { TitleSize, ValueSize } = DefaultGaugeChartSyles;
  const thresholds = dataConfig?.thresholds || [];
  console.log('dataConfig ----', dataConfig);
  console.log('data===', data);
  const titleSize = dataConfig?.chartStyles?.titleSize || TitleSize;
  const valueSize = dataConfig?.chartStyles?.valueSize || ValueSize;
  const showThresholdMarkers = dataConfig?.chartStyles?.showThresholdMarkers || false;
  const showThresholdLabels = dataConfig?.chartStyles?.showThresholdLabels || false;

  console.log('fields ====', fields);
  console.log('series ===', series);

  const gaugeData: Plotly.Data[] = useMemo(() => {
    let calculatedGaugeData: Plotly.Data[] = [];
    if (series && series[0] && value && value[0]) {
      if (indexOf(NUMERICAL_FIELDS, series[0].type) > 0) {
        calculatedGaugeData = [
          ...data[value[0].name].map((dimesionSlice, index) => ({
            field_name: dimesionSlice,
            value: data[series[0].name][index],
          })),
        ];
      } else {
        value.map((val) => {
          const selectedSeriesIndex = indexOf(data[series[0].name], val.name);
          fields.map((field) => {
            if (field.name !== series[0].name) {
              calculatedGaugeData.push({
                field_name: field.name,
                value: data[field.name][selectedSeriesIndex],
              });
            }
          });
        });
      }
      console.log('calculatedGaugeData========', calculatedGaugeData);
      return calculatedGaugeData.map((gauge, index) => {
        console.log('gauge ====', gauge, 'index');
        return {
          type: 'indicator',
          mode: 'gauge+number+delta',
          value: gauge.value || 0,
          name: "HELLOOOO",
          title: {
            text: gauge.field_name,
            font: { size: titleSize },
          },
          number: {
            font: {
              size: valueSize,
            },
          },
          domain: {
            row: Math.floor(index / PLOTLY_GAUGE_COLUMN_NUMBER),
            column: index % PLOTLY_GAUGE_COLUMN_NUMBER,
          },
          gauge: {
            ...(showThresholdMarkers &&
              thresholds &&
              thresholds.length && {
                threshold: {
                  line: {
                    color: thresholds[0]?.color || 'red',
                    width: 4,
                  },
                  thickness: 0.75,
                  value: thresholds[0]?.value || 0,
                },
              }),
            // axis: {
            //   ...(showThresholdLabels && thresholds && thresholds.length
            //     ? {
            //         ticktext: [gauge.value, thresholds[0]?.name],
            //         tickvals: [gauge.value, thresholds[0]?.value],
            //         ticklen: 5,
            //       }
            //     : {}),
            // },

            // custom gauge chart=========
            axis: {
              range: [null, 50],
              tickwidth: 1,
              tickcolor: 'darkblue',
              ...(showThresholdLabels && thresholds && thresholds.length
                ? {
                    ticktext: [gauge.value, thresholds[0]?.value],
                    tickvals: [gauge.value, thresholds[0]?.value],
                    ticklen: 5,
                  }
                : {}),
            },
            // bar: { color: 'darkblue' },
            // bgcolor: 'white',
            // borderwidth: 2,
            // bordercolor: 'gray',

            steps: [
              // {
              //   range: [10, 12],
              //   color: 'yellow',
              //   // line: {
              //   //   color: 'green',
              //   //   width: 4,
              //   // },
              //   name: 'stepOne-min',
              //   thickness: 0.75,
              //   templateitemname: 'stepOne-min',
              //   visible: true
              // },
              {
                range: [10, 10.5],
                color: 'red',
                // line: {
                //   color: 'blue',
                //   width: 4,
                // },
                name: 'stepTwo-min',
                // thickness: 0.75,
                templateitemname: 'stepTwo-min',
                visible: true
              },
              {
                range: [24, 24.25],
                color: 'blue',
                // line: {
                //   color: 'blue',
                //   width: 4,
                // },
                name: 'stepTwo-min',
                // thickness: 0.75,
                // templateitemname: 'stepTwo-min',
                visible: true
              },
            ],
            // threshold: {
            //   line: { color: 'cyan', width: 4 },
            //   thickness: 0.75,
            //   value: 22,
            // },
          },
        };
      });
    }
    return calculatedGaugeData;
  }, [
    series,
    value,
    data,
    fields,
    thresholds,
    titleSize,
    valueSize,
    showThresholdMarkers,
    showThresholdLabels,
  ]);

  const mergedLayout = useMemo(() => {
    const isAtleastOneFullRow = Math.floor(gaugeData.length / PLOTLY_GAUGE_COLUMN_NUMBER) > 0;
    return {
      grid: {
        rows: Math.floor(gaugeData.length / PLOTLY_GAUGE_COLUMN_NUMBER) + 1,
        columns: isAtleastOneFullRow ? PLOTLY_GAUGE_COLUMN_NUMBER : gaugeData.length,
        pattern: 'independent',
      },
      ...layout,
      ...(layoutConfig.layout && layoutConfig.layout),
      title: dataConfig?.panelOptions?.title || layoutConfig.layout?.title || '',
      showlegend:  true,
      xaxis: {
        tickmode: "linear", //  If "linear", the placement of the ticks is determined by a starting position `tick0` and a tick step `dtick`
        tick0: 0,
        dtick: 8
      }
    };
  }, [layout, gaugeData.length, layoutConfig.layout, dataConfig?.panelOptions?.title]);

  const mergedConfigs = {
    ...config,
    ...(layoutConfig.config && layoutConfig.config),
    responsive: true,
  };

  console.log('gaugeData===@@@@', gaugeData);
  console.log('mergedConfigs===', mergedConfigs);
  console.log('mergedLayout==', mergedLayout);
  return <Plt data={gaugeData} layout={mergedLayout} config={mergedConfigs} />;
};
