/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataTable } from './data_table';
import { getPlotlyCategory } from '../shared/shared_configs';
import { LensIconChartDatatable } from '../../assets/chart_datatable';

import {
  ConfigInputField,
  ConfigGridColumns,
  ConfigColorTheme
} from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/config_controls';
import { VizDataPanel } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/default_vis_editor';
import { ConfigEditor } from '../../../event_analytics/explorer/visualizations/config_panel/config_panes/json_editor';
import { DefaultTableProperties } from '../../../../../common/constants/shared';

const VIS_CATEGORY = getPlotlyCategory();

const { ColumnAlignment } = DefaultTableProperties;

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
    // schemas: [
    //   {
    //     name: 'Columns',
    //     isSingleSelection: true,
    //     onChangeHandler: 'setXaxisSelections',
    //     component: null,
    //     mapTo: 'xaxis',
    //   },
    // ],
    panelTabs: [
      {
        id: 'data-panel',
        name: 'Data',
        mapTo: 'dataConfig',
        editor: VizDataPanel,
        sections: [
          {
            id: 'columns',
            name: 'Columns',
            editor: ConfigGridColumns,
            mapTo: 'columns',
            schemas: [
              {
                name: 'Column Alignment',
                mapTo: 'columnAlignment',
                component: null,
                props: {
                  options: [
                    // { name: 'Auto', id: 'auto' },
                    { name: 'Left', id: 'left' },
                    { name: 'Center', id: 'center' },
                    { name: 'Right', id: 'right' },
                  ],
                  defaultSelections: [{ name: 'Left', id: ColumnAlignment }],
                },
              },
              {
                name: 'Column Width',
                mapTo: 'columnWidth',
                component: ConfigInputField,
                currentValue: 200,
                eleType: 'input',
              },
              // {
              //   id: 'color-theme',
              //   name: 'Color Theme',
              //   editor: ConfigColorTheme,
              //   mapTo: 'colorTheme',
              //   schemas: [],
              // },
            ],
          },
        ],
      },
    ],
  },
  component: DataTable,
});
