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

  console.log('fields', fields);

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
  const selectedOrientation = dataConfig?.chartStyles?.orientation || Orientation;
  let orientation = selectedOrientation === 'auto' || selectedOrientation === 'v' ? 'auto' : 'h';
  const selectedTextMode = dataConfig?.chartStyles?.textMode || StatsTextMode;
  const textMode =
    selectedTextMode === 'auto' || selectedTextMode === 'values+names' ? 'auto' : selectedTextMode;
  const chartType = dataConfig?.chartStyles?.chartType || StatsTextMode;
  // const dataSlice = chartType === 'auto' ? [DataSlice] : [0, 1];
  const dataSlice = chartType === 'auto' ? [DataSlice] : [DataSlice];
  // if (chartType === 'horizontal') {
  //   orientation = 'v';
  // }
  console.log('chartType===', chartType);
  console.log('textMode====', textMode);
  console.log('orientation==', orientation);

  let lineLayout = {
    xaxis: {
      visible: true,
      showgrid: true,
      anchor: 'y1',
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
    },
    yaxis: {
      visible: true,
      showgrid: true,
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
  let annotations: any = [];
  let horizontalChartTrace: any = {
    x: [],
    y: [],
    mode: 'text',
    text: [],
    type: 'scattergl',
    textfont: {
      size: 20,
      color: 'red',
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
                field_name_no_br: `${selectedDimensionsData[metricSliceDataIndex]},${metrics[metricSliceIndex].name}`,
                value: metricSliceData,
              };
            }),
          ];
        });
      }

      console.log('calculatedStatsData ---indicator', calculatedStatsData);
      if (chartType === 'auto') {
        return calculatedStatsData.reduce((prev, curr, index) => {
          console.log('prevvvv', prev, 'currr', curr, 'index===', index);
          lineLayout = {
            ...lineLayout,
            [`yaxis${index > 0 ? index + 1 : ''}`]: {
              visible: true,
              showgrid: true,
              anchor: `x${index > 0 ? index + 1 : ''}`,
              margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
              },
            },
            [`xaxis${index > 0 ? index + 1 : ''}`]: {
              visible: true,
              showgrid: true,
              anchor: `y${index > 0 ? index + 1 : ''}`,
              margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
              },
            },
          };

          const trace: any =
            chartType === 'auto'
              ? [
                  {
                    type: 'indicator',
                    mode: 'number',
                    ...(textMode === 'auto'
                      ? {
                          title: {
                            text: curr.field_name,
                            font: {
                              size: titleSize,
                              color: '#fff',
                            },
                          },
                          value: curr.value || 0,
                        }
                      : textMode === 'names'
                      ? {
                          title: {
                            text: curr.field_name,
                            font: { size: titleSize, color: '#fff' },
                          },
                        }
                      : {
                          value: curr.value || 0,
                        }),
                    ...(valueSize
                      ? {
                          number: {
                            font: {
                              size: valueSize,
                              color: '#fff',
                            },
                          },
                        }
                      : {
                          number: {
                            font: {
                              color: '#fff',
                            },
                          },
                        }),

                    domain: {
                      ...(chartType === 'auto'
                        ? orientation === 'auto'
                          ? { row: 0, column: index }
                          : { row: index, column: 0 }
                        : chartType === 'horizontal'
                        ? orientation === 'auto'
                          ? { row: 0, column: index }
                          : { row: index, column: 0 }
                        : {}),
                    },
                  },
                ]
              : [
                  {
                    x: [0.5],
                    y: [index],
                    mode: 'text',
                    text: 'HELLO',
                    type: 'scattergl',
                    textfont: {
                      size: 20,
                      color: 'red',
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
          if (chartType === 'horizontal') {
            console.log('shapes===== here===');
            shapes.push(
              {
                type: 'rect',
                xref: `x${index > 0 ? index + 1 : ''}`,
                yref: `y${index > 0 ? index + 1 : ''}`,
                x0: 0,
                y0: index,
                // x1: 0.5,
                // y1: 0.5,
                xsizemode: 'scaled',
                line: {
                  color: PLOTLY_COLOR[index % PLOTLY_COLOR.length],
                  width: 3,
                },
                fillcolor: PLOTLY_COLOR[index % PLOTLY_COLOR.length],
                layer: 'below',
              }
              // {
              //   type: 'rect',
              //   xref: `paper`,
              //   yref: `paper`,
              //   x0: 0,
              //   y0: index,
              //   x1: 1,
              //   y1: 1,
              //   xsizemode: 'scaled',
              //   line: {
              //     color: PLOTLY_COLOR[index % PLOTLY_COLOR.length],
              //     width: 3,
              //   },
              //   fillcolor: PLOTLY_COLOR[index % PLOTLY_COLOR.length],
              //   layer: 'below',
              // }
            );

            annotations = annotations.concat([
              {
                showarrow: false,
                valign: 'middle',
                // text: curr.field_name_no_br,
                text: 'one',
                x: 0,
                y: 0.5,
                xref: `x${index > 0 ? index + 1 : ''}`,
                yref: `y${index > 0 ? index + 1 : ''}`,
                // xref: "paper",
                // yref: "paper",
                font: {
                  size: titleSize || 24,
                  color: '#fff',
                },
              },
              {
                showarrow: false,
                valign: 'middle',
                // text: curr.value,
                text: 'two',
                x: 1,
                y: 1,
                xref: `x${index > 0 ? index + 1 : ''}`,
                yref: `y${index > 0 ? index + 1 : ''}`,
                font: {
                  size: titleSize || 24,
                  color: '#fff',
                },
              },
            ]);
            console.log('annotations====@@@@', annotations);
          }
          return prev.concat(trace);
        }, []);
      } else {
        // chart type horizontal/textmode
        return calculatedStatsData.map(() => {
          
        })
      }
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

  console.log('shapes====', shapes);
  console.log('annotations==', annotations);
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
      ...lineLayout,
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
      ...(chartType === 'horizontal'
        ? {
            // shapes,
            // annotations,
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
