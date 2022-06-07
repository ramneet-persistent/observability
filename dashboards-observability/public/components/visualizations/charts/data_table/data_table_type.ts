/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataTable } from './data_table';
import { getPlotlyCategory } from '../shared/shared_configs';
import { LensIconChartDatatable } from '../../assets/chart_datatable';

import { ConfigValueOptions } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls';
import { VizDataPanel } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/default_vis_editor';

import { ColumnAlignment } from "./data_table"


const VIS_CATEGORY = getPlotlyCategory();

export const createDatatableTypeDefinition = (params: any = {}) => ({
  name: 'data_table',
  type: 'data_table',
  id: 'data_table',
  label: 'Data Table',
  fullLabel: 'Data Table',
  iconType: 'visTable',
  category: VIS_CATEGORY.BASICS,
  selection: {
    dataLoss: 'nothing',
  },
  icon: LensIconChartDatatable,
  editorConfig: {
    editor: null,
    schemas: [
      {
        name: 'Columns',
        isSingleSelection: true,
        onChangeHandler: 'setXaxisSelections',
        component: null,
        mapTo: 'xaxis',
      },
    ],
    panelTabs: [
      {
        id: 'data-panel',
        name: 'Data',
        mapTo: 'dataConfig',
        editor: VizDataPanel,
        sections: [
          {
            id: 'value_options',
            name: 'Value options',
            editor: ConfigValueOptions,
            mapTo: 'valueOptions',
            schemas: [
              // {
              //   name: 'X-axis',
              //   isSingleSelection: false,
              //   component: null,
              //   mapTo: 'xaxis',
              // },
              {
                name: 'Column Alignment',
                isSingleSelection: true,
                component: ColumnAlignment,
                mapTo: 'xaxis',
              },
            ],
          },
        ],
      },
    ],
  },
  component: DataTable,
});
