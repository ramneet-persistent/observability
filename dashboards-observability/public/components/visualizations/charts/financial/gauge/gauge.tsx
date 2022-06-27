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
import { ThresholdUnitType } from '../../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls/config_thresholds';

export const Gauge = ({ visualizations, layout, config }: any) => {
  const {
    data,
    metadata: { fields },
    dataConfig:  dataConfigTab
  } = visualizations.data.rawVizData;
  console.log("visualizations ====", visualizations)
  const { dataConfig = {}, layoutConfig = {} } = visualizations.data.userConfigs;

  console.log("dataConfig ====", dataConfig)
  console.log("dataConfigTab ===", dataConfigTab)
  const series = dataConfigTab?.dimensions ? dataConfigTab?.dimensions : []

  // const series =
  //   dataConfig?.valueOptions && dataConfig?.valueOptions?.series
  //     ? dataConfig.valueOptions.series
  //     : [];
  console.log('series====', series);
  // console.log("dimensions=====", dimensions)

  const value =
    dataConfig?.valueOptions && dataConfig?.valueOptions?.value
      ? dataConfig.valueOptions.value
      : [];

  const { TitleSize, ValueSize } = DefaultGaugeChartSyles;
  const thresholds = dataConfig?.thresholds || [];
  console.log('dataConfig ----', dataConfig);
  console.log('data===', data);
  const titleSize = dataConfig?.chartStyles?.titleSize || TitleSize;
  const valueSize = dataConfig?.chartStyles?.valueSize || ValueSize;
  const showThresholdMarkers = dataConfig?.chartStyles?.showThresholdMarkers || false;
  const showThresholdLabels = dataConfig?.chartStyles?.showThresholdLabels || false;
  // const slicedData = data.slice(0, 10)

  console.log('fields ====', fields);
  console.log('series ===', series);
  console.log('value===', value);
  console.log('thresholds===', thresholds);

  const gaugeData: Plotly.Data[] = useMemo(() => {
    let calculatedGaugeData: Plotly.Data[] = [];
    // if (series && series[0] && value && value[0]) {
    if (series && series[0]) {
      console.log('data===', data);
      console.log('fields ====', fields);
      console.log('series ===', series);
      console.log('value===', value);
      console.log('thresholds===', thresholds);

      console.log('series[0].type===', series[0].type);
      console.log('is NUMERIC==', indexOf(NUMERICAL_FIELDS, series[0].type));
      if (indexOf(NUMERICAL_FIELDS, series[0].type) > 0) {
        console.log('selected series is numeric ====');
        if (value && value[0]) {
          console.log('value is selected ====', value);
          calculatedGaugeData = [
            ...data[value[0].name].map((dimesionSlice, index) => ({
              field_name: dimesionSlice,
              value: data[series[0].name][index],
            })),
          ];
        } else {
          console.log('no value seleceted =====');
          calculatedGaugeData = [
            ...data[series[0].name].slice(0, 10).map((dimesionSlice, index) => ({
              field_name: dimesionSlice,
              value: data[series[0].name][index],
            })),
          ];
        }
      } else {
        console.log('non numeric value is selected');
        if (value && value[0]) {
          console.log('value selected ====');
          value.map((val) => {
            console.log("val map ===",val)
            const selectedSeriesIndex = indexOf(data[series[0].name], val.name);
            console.log("selectedSeriesIndex===", selectedSeriesIndex)
            fields.map((field) => {
              console.log("in fields map ====field", field )
              if (field.name !== series[0].name) {
                calculatedGaugeData.push({
                  field_name: field.name,
                  value: data[field.name][selectedSeriesIndex],
                });
              }
            });
          });
        } else {
          console.log('no value slected =====');
          const values = data[series[0].name].slice(0, 10).map(i => {
            return {
              name: i,
              type: series[0].type,
              label: i
            }
          })
          console.log("filters values from fields", values )
          values.map((val) => {
            console.log("val map ===",val)
            const selectedSeriesIndex = indexOf(data[series[0].name], val.name);
            console.log("selectedSeriesIndex===", selectedSeriesIndex)
            fields.map((field) => {
              console.log("in fields map ====field", field )
              if (field.name !== series[0].name) {
                calculatedGaugeData.push({
                  field_name: field.name,
                  value: data[field.name][selectedSeriesIndex],
                });
              }
            });
          });
        }
      }
      console.log('calculatedGaugeData========', calculatedGaugeData);
      return calculatedGaugeData.map((gauge, index) => {
        console.log('gauge ====', gauge, 'index');
        return {
          type: 'indicator',
          mode: 'gauge+number+delta',
          value: gauge.value || 0,
          name: 'HELLOOOO',
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

            // ...(thresholds &&
            //   thresholds.length && {
            //     steps : thresholds.map((threshold: ThresholdUnitType) => {
            //       const value =Number(threshold.value)
            //       return {
            //         range: [0, value+ 0.25 ],
            //         color: threshold.color || 'red',
            //         name: threshold.name || '',
            //         templateitemname: 'stepTwo-min',
            //         visible: true
            //       }
            //     } )
            //   }),
            // steps: [
            //   {
            //     range: [10, 10.5],
            //     color: 'red',
            //     // line: {
            //     //   color: 'blue',
            //     //   width: 4,
            //     // },
            //     name: 'stepTwo-min',
            //     // thickness: 0.75,
            //     templateitemname: 'stepTwo-min',
            //     visible: true
            //   },
            //   {
            //     range: [24, 24.25],
            //     color: 'blue',
            //     // line: {
            //     //   color: 'blue',
            //     //   width: 4,
            //     // },
            //     name: 'stepTwo-min',
            //     // thickness: 0.75,
            //     // templateitemname: 'stepTwo-min',
            //     visible: true
            //   },
            // ],
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
      showlegend: true,
      xaxis: {
        tickmode: 'linear', //  If "linear", the placement of the ticks is determined by a starting position `tick0` and a tick step `dtick`
        tick0: 0,
        dtick: 8,
      },
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
