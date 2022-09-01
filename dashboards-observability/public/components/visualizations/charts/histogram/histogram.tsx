/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { take, isEmpty } from 'lodash';
import { Plt } from '../../plotly/plot';
import { hexToRgb } from '../../../../components/event_analytics/utils/utils';
import { getConfigChartStyleParameter } from '../helpers';
import {
  DefaultChartStyles,
  PLOTLY_COLOR,
  FILLOPACITY_DIV_FACTOR,
  visChartTypes,
  ChartsMinMaxLimits,
} from '../../../../../common/constants/shared';

const { LINE_WIDTH_MAX, LINE_WIDTH_MIN, OPACITY_MIN, OPACITY_MAX } = ChartsMinMaxLimits;

export const Histogram = ({ visualizations, layout, config }: any) => {
  const { LineWidth, FillOpacity, LegendPosition, ShowLegend } = DefaultChartStyles;
  const { vis } = visualizations;
  const {
    data = {},
    metadata: { fields },
  } = visualizations.data.rawVizData;
  const { defaultAxes } = visualizations?.data;
  const {
    dataConfig: {
      chartStyles = {},
      valueOptions = {},
      legend = {},
      colorTheme = [],
      panelOptions = {},
      tooltipOptions = {},
    },
    layoutConfig = {},
  } = visualizations?.data?.userConfigs;
  const lastIndex = fields.length - 1;
  const lineWidth = getConfigChartStyleParameter({
    parameter: 'lineWidth',
    min: LINE_WIDTH_MIN,
    max: LINE_WIDTH_MAX,
    chartStyles,
    vis,
  });
  const showLegend = legend.showLegend && legend.showLegend !== ShowLegend ? false : true;
  const legendPosition = legend.position || LegendPosition;
  const selectedOpacity = getConfigChartStyleParameter({
    parameter: 'fillOpacity',
    min: OPACITY_MIN,
    max: OPACITY_MAX,
    chartStyles,
    vis,
  });
  const fillOpacity = selectedOpacity / FILLOPACITY_DIV_FACTOR;
  const tooltipMode =
    tooltipOptions.tooltipMode !== undefined ? tooltipOptions.tooltipMode : 'show';
  const tooltipText = tooltipOptions.tooltipText !== undefined ? tooltipOptions.tooltipText : 'all';
  const valueSeries = defaultAxes?.yaxis || take(fields, lastIndex > 0 ? lastIndex : 1);

  const xbins: any = {};
  if (valueOptions.dimensions[0].bucketSize) {
    xbins.size = valueOptions.dimensions[0].bucketSize;
  }
  if (valueOptions.dimensions[0].bucketOffset) {
    xbins.start = valueOptions.dimensions[0].bucketOffset;
  }

  const selectedColorTheme = (field: any, index: number, opacity?: number) => {
    let newColor;
    if (colorTheme.length !== 0) {
      newColor = colorTheme.find((colorSelected) => colorSelected.name.name === field.name);
    }
    return hexToRgb(newColor ? newColor.color : PLOTLY_COLOR[index % PLOTLY_COLOR.length], opacity);
  };

  const hisValues = useMemo(
    () =>
      valueSeries.map((field: any, index: number) => ({
        x: data[field.name],
        type: visChartTypes.Histogram,
        name: field.name,
        hoverinfo: tooltipMode === 'hidden' ? 'none' : tooltipText,
        marker: {
          color: selectedColorTheme(field, index, fillOpacity),
          line: {
            color: selectedColorTheme(field, index),
            width: lineWidth,
          },
        },
        xbins: !isEmpty(xbins) ? xbins : undefined,
      })),
    [valueSeries, data, fillOpacity, lineWidth, xbins, selectedColorTheme]
  );

  const mergedLayout = {
    ...layout,
    ...(layoutConfig.layout && layoutConfig.layout),
    title: panelOptions?.title || layoutConfig.layout?.title || '',
    barmode: 'group',
    legend: {
      ...layout.legend,
      orientation: legendPosition,
    },
    showlegend: showLegend,
  };

  const mergedConfigs = useMemo(
    () => ({
      ...config,
      ...(layoutConfig.config && layoutConfig.config),
    }),
    [config, layoutConfig.config]
  );

  return <Plt data={hisValues} layout={mergedLayout} config={mergedConfigs} />;
};
