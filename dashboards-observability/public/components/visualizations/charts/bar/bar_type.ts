/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bar } from './bar';
import { getPlotlySharedConfigs, getPlotlyCategory } from '../shared/shared_configs';
import { LensIconChartBar } from '../../assets/chart_bar';
import { VizDataPanel } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/default_vis_editor';
import { ConfigEditor } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/json_editor';
import {
  ConfigLegend,
  InputFieldItem,
  ConfigColorTheme,
  SliderConfig,
  ConfigBarChartStyles,
  ButtonGroupItem,
  ConfigAvailability,
} from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls';
import { DefaultChartStyles } from '../../../../../common/constants/shared';
import {
  DefaultBarChartStyles,
  ChartsMinMaxLimits,
} from '../../../../../common/constants/explorer';
import { fetchConfigObject } from '../../../../components/event_analytics/utils/utils';

const sharedConfigs = getPlotlySharedConfigs();
const VIS_CATEGORY = getPlotlyCategory();

const { LegendPosition, ShowLegend, LabelAngle, FillOpacity } = DefaultChartStyles;
const { BarMode, GroupWidth, BarWidth, LineWidth } = DefaultBarChartStyles;
const {
  LINE_WIDTH_MAX,
  LINE_WIDTH_MIN,
  LABEL_ANGLE_MIN,
  LABEL_ANGLE_MAX,
  OPACITY_MIN,
  OPACITY_MAX,
} = ChartsMinMaxLimits;

export const createBarTypeDefinition = (params: any) => ({
  name: 'bar',
  type: 'bar',
  id: 'bar',
  label: 'Vertical bar',
  fulllabel: 'Vertical bar',
  icontype: 'visBarVerticalStacked',
  selection: {
    dataLoss: 'nothing',
  },
  category: VIS_CATEGORY.BASICS,
  icon: LensIconChartBar,
  categoryaxis: 'xaxis',
  seriesaxis: 'yaxis',
  orientation: 'v',
  mode: BarMode,
  labelangle: LabelAngle,
  linewidth: LineWidth,
  fillopacity: FillOpacity,
  groupwidth: GroupWidth,
  barwidth: BarWidth,
  showlegend: ShowLegend,
  legendposition: LegendPosition,
  component: Bar,
  editorconfig: {
    panelTabs: [
      {
        id: 'data-panel',
        name: 'Style',
        mapTo: 'dataConfig',
        editor: VizDataPanel,
        sections: [
          fetchConfigObject('Tooltip', {
            options: [
              { name: 'All', id: 'all' },
              { name: 'Dimension', id: 'x' },
              { name: 'Metrics', id: 'y' },
            ],
            defaultSelections: [{ name: 'All', id: 'all' }],
          }),
          {
            id: 'legend',
            name: 'Legend',
            editor: ConfigLegend,
            mapTo: 'legend',
            schemas: [
              {
                name: 'Show legend',
                mapTo: 'showLegend',
                component: null,
                props: {
                  options: [
                    { name: 'Show', id: 'show' },
                    { name: 'Hidden', id: 'hidden' },
                  ],
                  defaultSelections: [{ name: 'Show', id: ShowLegend }],
                },
              },
              {
                name: 'Position',
                mapTo: 'position',
                component: null,
                props: {
                  options: [
                    { name: 'Right', id: 'v' },
                    { name: 'Bottom', id: 'h' },
                  ],
                  defaultSelections: [{ name: 'Right', id: LegendPosition }],
                },
              },
            ],
          },
          {
            id: 'chart_styles',
            name: 'Chart styles',
            editor: ConfigBarChartStyles,
            mapTo: 'chartStyles',
            schemas: [
              {
                name: 'Orientation',
                component: ButtonGroupItem,
                mapTo: 'orientation',
                eleType: 'buttons',
                props: {
                  options: [
                    { name: 'Vertical', id: 'v' },
                    { name: 'Horizontal', id: 'h' },
                  ],
                  defaultSelections: [{ name: 'Vertical', id: 'v' }],
                },
              },
              {
                name: 'Mode',
                component: ButtonGroupItem,
                mapTo: 'mode',
                eleType: 'buttons',
                props: {
                  options: [
                    { name: 'Group', id: 'group' },
                    { name: 'Stack', id: 'stack' },
                  ],
                  defaultSelections: [{ name: 'Group', id: 'group' }],
                },
              },
              {
                name: 'Label size',
                component: InputFieldItem,
                mapTo: 'labelSize',
                eleType: 'input',
              },
              {
                name: 'Rotate bar labels',
                component: SliderConfig,
                mapTo: 'labelAngle',
                eleType: 'slider',
                defaultState: LabelAngle,
                props: {
                  ticks: [
                    { label: '-90°', value: -90 },
                    { label: '-45°', value: -45 },
                    { label: '0°', value: 0 },
                    { label: '45°', value: 45 },
                    { label: '90°', value: 90 },
                  ],
                  showTicks: true,
                  min: LABEL_ANGLE_MIN,
                  max: LABEL_ANGLE_MAX,
                },
              },
              {
                name: 'Group width',
                component: SliderConfig,
                mapTo: 'groupWidth',
                defaultState: GroupWidth,
                props: {
                  max: 1,
                  step: 0.01,
                },
                eleType: 'slider',
              },
              {
                name: 'Bar width',
                component: SliderConfig,
                mapTo: 'barWidth',
                defaultState: BarWidth,
                props: {
                  max: 1,
                  step: 0.01,
                },
                eleType: 'slider',
              },
              {
                name: 'Line width',
                component: SliderConfig,
                mapTo: 'lineWidth',
                defaultState: LineWidth,
                props: {
                  max: LINE_WIDTH_MAX,
                  min: LINE_WIDTH_MIN,
                },
                eleType: 'slider',
              },
              {
                name: 'Fill opacity',
                component: SliderConfig,
                mapTo: 'fillOpacity',
                defaultState: FillOpacity,
                props: {
                  max: OPACITY_MAX,
                  min: OPACITY_MIN,
                },
                eleType: 'slider',
              },
            ],
          },
          {
            id: 'color-theme',
            name: 'Color theme',
            editor: ConfigColorTheme,
            mapTo: 'colorTheme',
            schemas: [],
          },
        ],
      },
      {
        id: 'style-panel',
        name: 'Layout',
        mapTo: 'layoutConfig',
        editor: ConfigEditor,
        content: [],
      },
      {
        id: 'availability-panel',
        name: 'Availability',
        mapTo: 'availabilityConfig',
        editor: ConfigAvailability,
      },
    ],
  },
  visconfig: {
    layout: {
      ...sharedConfigs.layout,
    },
    config: {
      ...sharedConfigs.config,
    },
    isUniColor: false,
  },
});
