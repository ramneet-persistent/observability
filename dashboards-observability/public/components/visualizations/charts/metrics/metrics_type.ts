/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Metrics } from './metrics';
import { getPlotlyCategory, getPlotlySharedConfigs } from '../shared/shared_configs';
import { LensIconChartDatatable } from '../../assets/chart_datatable';
import { VizDataPanel } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/default_vis_editor';
import { PLOTLY_COLOR } from '../../../../../common/constants/shared';

const sharedConfigs = getPlotlySharedConfigs();
const VIS_CATEGORY = getPlotlyCategory();

export const createMetricsTypeDefinition = (params: any = {}) => ({
  name: 'metrics',
  type: 'metrics',
  id: 'metrics',
  label: 'Metrics',
  fulllabel: 'Metrics',
  icontype: 'visTable',
  category: VIS_CATEGORY.BASICS,
  selection: {
    dataLoss: 'nothing',
  },
  icon: LensIconChartDatatable,
  categoryaxis: 'xaxis',
  seriesaxis: 'yaxis',
  editorconfig: {
    panelTabs: [
      {
        id: 'data-panel',
        name: 'Style',
        mapTo: 'dataConfig',
        editor: VizDataPanel,
        sections: [],
      },
    ],
  },
  visconfig: {
    layout: {
      ...sharedConfigs.layout,
      colorway: PLOTLY_COLOR,
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      xaxis: {
        fixedrange: true,
        showgrid: false,
        visible: true,
      },
      yaxis: {
        fixedrange: true,
        showgrid: false,
        visible: true,
      },
    },
    config: {
      ...sharedConfigs.config,
      barmode: 'line',
      xaxis: {
        automargin: true,
      },
      yaxis: {
        automargin: true,
      },
    },
  },
  component: Metrics,
});
