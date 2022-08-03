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
import { EmptyPlaceholder } from '../../../event_analytics/explorer/visualizations/shared_components/empty_placeholder';
import { last } from 'lodash';
import { AvailabilityUnitType } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls/config_availability';

const { Orientation, StatsTextMode, TextSize, TextColor, TextAlignment } = DefaultStatsParameters;
const MAX_GRID_LENGTH = 10;
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

  if (!dimensionsLength || !metricsLength)
    return <EmptyPlaceholder icon={visualizations?.vis?.iconType} />;

  // style panel parameters
  const thresholds = dataConfig?.thresholds || [];
  const textSize = dataConfig?.chartStyles?.textSize || TextSize;
  const selectedOrientation = dataConfig?.chartStyles?.orientation || Orientation;
  let orientation = selectedOrientation === 'auto' || selectedOrientation === 'v' ? 'auto' : 'h';
  const selectedTextMode = dataConfig?.chartStyles?.textMode || StatsTextMode;
  const textMode =
    selectedTextMode === 'auto' || selectedTextMode === 'values+names' ? 'auto' : selectedTextMode;
  const chartType = dataConfig?.chartStyles?.chartType || StatsTextMode;
  const selectedMetricsData = metrics.map((metric: any) => data[metric.name]);
  const selectedDimensionsData = dimensions.map((dimension: any) => data[dimension.name]);
  const textColor = dataConfig?.chartStyles?.textColor?.childColor || TextColor;
  const textAlign = dataConfig?.chartStyles?.textAlign || TextAlignment;
  console.log('dimensions ===', dimensions, 'selectedDimensionsData', selectedDimensionsData);
  console.log('metrics===', metrics, 'selectedMetricsData', selectedMetricsData);
  console.log('textAlign===', textAlign);

  let autoChartLayout = {
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

  const [statsData, statsLayout]: Plotly.Data[] = useMemo(() => {
    let calculatedStatsData: Plotly.Data[] = [];
    if (dimensionsLength || metricsLength) {
      // case 1,2: no dimension, single/multiple metrics for chart type horizontal/text
      // will be handled with horizontal/textmode chart
      // if (!dimensionsLength && metricsLength >= 1) {}

      // case 3: multiple dimensions and multiple metrics
      // chart type auto
      if (dimensionsLength && metricsLength) {
        console.log('CASE 22222===3333');
        console.log('data =====', data);
        const selectedDimensionsData = dimensions
          .map((dimension: any) => data[dimension.name])
          .reduce((prev, cur) => {
            return prev.map((i, j) => `${i},<br>${cur[j]}`);
          });
        calculatedStatsData = metrics.map((metric: any, metricIndex: number) => {
          autoChartLayout = {
            ...autoChartLayout,
            [`yaxis${metricIndex > 0 ? metricIndex + 1 : ''}`]: {
              visible: false,
              showgrid: false,
              anchor: `x${metricIndex > 0 ? metricIndex + 1 : ''}`,
              margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
              },
            },
            [`xaxis${metricIndex > 0 ? metricIndex + 1 : ''}`]: {
              visible: false,
              showgrid: false,
              anchor: `y${metricIndex > 0 ? metricIndex + 1 : ''}`,
              margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
              },
            },
          };

          return {
            x: selectedDimensionsData,
            y: data[metric.label],
            fill: 'tozeroy',
            mode: 'line',
            type: 'scattergl',
            name: metric.label,
            ...(metricIndex > 0 && {
              xaxis: `x${metricIndex + 1}`,
              yaxis: `y${metricIndex + 1}`,
            }),
          };
        });

        // label/text
        let textLabelTrace: any = {
          x: [],
          y: [],
          mode: 'text',
          text: [],
          type: 'scatter',
          xaxis: `x${metricsLength + 1}`,
          yaxis: `y${metricsLength + 1}`,
          textfont: {
            size: textSize,
            color: textColor,
          },
        };
        let reaptedAxis = metricsLength === 1 || orientation === 'auto' ? 'x' : 'y';
        let singleAxis = metricsLength === 1 || orientation === 'auto' ? 'y' : 'x';
        const singleAxisCoords =
          metricsLength === 1 || orientation === 'auto'
            ? [MAX_GRID_LENGTH - 1, MAX_GRID_LENGTH - 1.4]
            : [MAX_GRID_LENGTH - 1, MAX_GRID_LENGTH - 1];
        const ZERO_ERROR = metricsLength === 1 || orientation === 'auto' ? 0 : 0.5;
        const isSingleText = textMode === 'auto' ? false : true;
        metrics.map((m: any, index: number) => {
          // for layout of text trace
          if (textMode === 'auto') {
            textLabelTrace.text.push(`${data[m.label].slice(-1)}`);
            textLabelTrace.text.push(`${m.label}`);
          } else if (textMode === 'names') {
            textLabelTrace.text.push(`${m.label}`);
          } else {
            textLabelTrace.text.push(`${data[m.label].slice(-1)}`);
          }
          if (metricsLength === 1 || index + 1 === metricsLength) {
            // for single metric || last metric
            if (isSingleText) {
              textLabelTrace[reaptedAxis].push(MAX_GRID_LENGTH - 1);
            } else {
              textLabelTrace[reaptedAxis].push(
                MAX_GRID_LENGTH - 1,
                MAX_GRID_LENGTH - 1 + ZERO_ERROR
              );
            }
          } else {
            if (textLabelTrace[reaptedAxis].length) {
              // covering all in between cases
              if (isSingleText) {
                textLabelTrace[reaptedAxis].push(
                  textLabelTrace[reaptedAxis][textLabelTrace[reaptedAxis].length - 1] +
                    MAX_GRID_LENGTH / metricsLength
                );
              } else {
                textLabelTrace[reaptedAxis].push(
                  textLabelTrace[reaptedAxis][textLabelTrace[reaptedAxis].length - 1] +
                    MAX_GRID_LENGTH / metricsLength,
                  textLabelTrace[reaptedAxis][textLabelTrace[reaptedAxis].length - 1] +
                    MAX_GRID_LENGTH / metricsLength +
                    ZERO_ERROR
                );
              }
            } else {
              // for very first metric
              if (isSingleText) {
                textLabelTrace[reaptedAxis].push(MAX_GRID_LENGTH / metricsLength - 1);
              } else {
                textLabelTrace[reaptedAxis].push(
                  MAX_GRID_LENGTH / metricsLength - 1,
                  MAX_GRID_LENGTH / metricsLength - 1 + ZERO_ERROR
                );
              }
            }
          }
          if (isSingleText) {
            textLabelTrace[singleAxis].push(singleAxisCoords[0]);
          } else {
            textLabelTrace[singleAxis].push(...singleAxisCoords);
          }
        });
        console.log('textLabelTrace===', textLabelTrace);
        calculatedStatsData = [...calculatedStatsData, textLabelTrace];
        // add layout for text traces
        autoChartLayout = {
          ...autoChartLayout,
          [`xaxis${metrics.length + 1}`]: {
            range: [0, MAX_GRID_LENGTH],
            showline: false,
            zeroline: false,
            showgrid: false,
          },
          [`yaxis${metrics.length + 1}`]: {
            range: [0, MAX_GRID_LENGTH],
            showline: false,
            zeroline: false,
            showgrid: false,
          },
        };

        if (thresholds.length && dimensions.length) {
          const thresholdTraces = {
            x: [],
            y: [],
            mode: 'text',
            text: [],
          };

          const mapToLine = (list: ThresholdUnitType[] | AvailabilityUnitType[]) => {
            return list.map((thr: ThresholdUnitType) => {
              thresholdTraces.x.push(data[dimensions[0].label][0]);
              thresholdTraces.y.push(thr.value * (1 + 0.06));
              thresholdTraces.text.push(thr.name);
              return calculatedStatsData
                .filter((i) => i.mode === 'line')
                .map((stat: any, index: number) => {
                  return {
                    type: 'line',
                    x0: data[dimensions[0].label][0],
                    y0: thr.value,
                    x1: last(data[dimensions[0].label]),
                    y1: thr.value,
                    xref: `x${index + 1}`,
                    yref: `y${index + 1}`,
                    name: thr.name || '',
                    opacity: 0.7,
                    line: {
                      color: thr.color,
                      width: 3,
                      dash: 'dashdot',
                    },
                  };
                });
            });
          };
          console.log("mapToLine(thresholds, { dash: 'dashdot' })", mapToLine(thresholds).flat(2));

          calculatedStatsData = [...calculatedStatsData, thresholdTraces];
          autoChartLayout = {
            ...autoChartLayout,
            shapes: mapToLine(thresholds).flat(2),
          };
        }

        console.log('calculatedStatsData===', calculatedStatsData);
        return [calculatedStatsData, autoChartLayout];
      }
    }
  }, [dimensions, metrics, data, fields, thresholds, orientation, textSize, textMode, chartType]);

  const mergedLayout = useMemo(() => {
    return {
      ...layout,
      ...(layoutConfig.layout && layoutConfig.layout),
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      },
      ...statsLayout,
      grid: {
        ...(orientation === 'auto'
          ? {
              rows: 1,
              columns: metricsLength,
              xgap: 0.01,
            }
          : {
              rows: metricsLength,
              columns: 1,
              ygap: 0.01,
            }),
        pattern: 'independent',
        roworder: 'bottom to top',
      },
      ...(dataConfig?.panelOptions?.title || layoutConfig.layout?.title
        ? {
            title: {
              text: 'Plot Title',
              xref: 'paper',
              yref: 'paper',
              y: 1,
            },
          }
        : {}),
    };
  }, [
    data,
    layout,
    layoutConfig.layout,
    dataConfig?.panelOptions?.title,
    orientation,
    metricsLength,
    statsLayout,
  ]);

  const mergedConfigs = {
    ...config,
    ...(layoutConfig.config && layoutConfig.config),
  };

  console.log('statsData====', statsData);
  console.log('mergedLayout ===', mergedLayout);
  return <Plt data={statsData} layout={mergedLayout} config={mergedConfigs} />;
};
