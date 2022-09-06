/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './app.scss';

import { isEmpty } from 'lodash';

import React, { useContext, useRef, useState } from 'react';
import { EuiPanel, EuiResizableContainer, EuiSpacer, EuiButtonIcon } from '@elastic/eui';
import { RAW_QUERY, SELECTED_TIMESTAMP } from '../../../../../common/constants/explorer';
import { IField, IQuery, IVisualizationContainerProps } from '../../../../../common/types/explorer';
import { WorkspacePanel } from './workspace_panel';
import { ConfigPanel } from './config_panel';
import { Sidebar } from '../sidebar';
import { DataConfigPanelItem } from './config_panel/config_panes/config_controls/data_config_panel_item';
import { TabContext } from '../../hooks';
import { PPL_STATS_REGEX, visChartTypes } from '../../../../../common/constants/shared';
import { TreemapConfigPanelItem } from './config_panel/config_panes/config_controls/treemap_config_panel_item';
import { LogsViewConfigPanelItem } from './config_panel/config_panes/config_controls/logs_view_config_panel_item';
interface IExplorerVisualizationsProps {
  query: IQuery;
  curVisId: string;
  setCurVisId: (visId: string) => void;
  explorerVis: any;
  explorerFields: IField[];
  explorerData: any;
  handleAddField: (field: IField) => void;
  handleRemoveField: (field: IField) => void;
  visualizations: IVisualizationContainerProps;
  handleOverrideTimestamp: (field: IField) => void;
  callback?: any;
  changeIsValidConfigOptionState: (isValidConfigOptionSelected: boolean) => void;
}

export const ExplorerVisualizations = ({
  query,
  curVisId,
  setCurVisId,
  explorerVis,
  explorerFields,
  explorerData,
  handleAddField,
  handleRemoveField,
  visualizations,
  handleOverrideTimestamp,
  callback,
  changeIsValidConfigOptionState,
}: IExplorerVisualizationsProps) => {
  const collapseFn = useRef({});
  const { tabId } = useContext<any>(TabContext);
  const { data, vis } = visualizations;
  const { data: vizData = {}, metadata: { fields = [] } = {} } = data?.rawVizData;

  const fieldOptionList = explorerFields.availableFields.map((field) => {
    // const fieldOptionList = fields.map((field) => {
    return { ...field, label: field.name };
  });

  const renderDataConfigContainer = () => {
    switch (curVisId) {
      case visChartTypes.TreeMap:
        return (
          <TreemapConfigPanelItem
            fieldOptionList={fieldOptionList}
            visualizations={visualizations}
            tabID={tabId}
          />
        );
      case visChartTypes.LogsView:
        return (
          <LogsViewConfigPanelItem
            fieldOptionList={fieldOptionList}
            visualizations={visualizations}
            tabID={tabId}
          />
        );
      default:
        return (
          <DataConfigPanelItem
            fieldOptionList={fieldOptionList}
            visualizations={visualizations}
            tabID={tabId}
          />
        );
    }
  };

  const [toggleIdToSelectedMap, setToggleIdToSelectedMap] = useState({});

  const onCollapse = (optionId) => {
    const newToggleIdToSelectedMap = {
      ...toggleIdToSelectedMap,
      [optionId]: !toggleIdToSelectedMap[optionId],
    };
    setToggleIdToSelectedMap(newToggleIdToSelectedMap);
  };

  const onChange = (optionId) => {
    onCollapse(optionId);
    collapseFn.current(`panel${optionId}`, optionId === '1' ? 'right' : 'left');
  };

  return (
    <EuiResizableContainer onToggleCollapsed={onCollapse} aria-label="aria-label-container">
      {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
        collapseFn.current = (id, direction = 'left') => togglePanel(id, { direction });
        return (
          <>
            <EuiResizablePanel
              id="panel1"
              aria-label="aria-label-1"
              initialSize={17}
              minSize="300"
              mode={['custom', { position: 'top' }]}
              className="position-relative"
            >
              <div className="dscFieldChooser">
                <Sidebar
                  query={query}
                  explorerFields={explorerFields}
                  explorerData={explorerData}
                  selectedTimestamp={visualizations?.data?.query[SELECTED_TIMESTAMP] || ''}
                  handleOverrideTimestamp={handleOverrideTimestamp}
                  handleAddField={(field: IField) => handleAddField(field)}
                  handleRemoveField={(field: IField) => handleRemoveField(field)}
                  isFieldToggleButtonDisabled={
                    vis.name === visChartTypes.LogsView
                      ? isEmpty(explorerData.jsonData) ||
                        !isEmpty(query[RAW_QUERY].match(PPL_STATS_REGEX))
                      : true
                  }
                />
              </div>
              <EuiButtonIcon
                color="text"
                aria-label="Toggle panel 1"
                iconType="menuLeft"
                onClick={() => onChange(1)}
                className="collapse-btn"
              />
            </EuiResizablePanel>
            <EuiResizableButton />
            <EuiResizablePanel
              id="panel2"
              aria-label="aria-label-2"
              mode={['custom', { position: 'top' }]}
              className="containerPanel position-relative"
              initialSize={14}
              minSize="300"
            >
              <EuiSpacer size="s" />
              <EuiPanel paddingSize="s" className="dataConfigContainer">
                {renderDataConfigContainer()}
              </EuiPanel>
              <EuiButtonIcon
                color="text"
                aria-label={'Toggle panel 2'}
                iconType="menuLeft"
                onClick={() => onChange(2)}
                className="collapse-btn"
              />
            </EuiResizablePanel>

            <EuiResizableButton />
            <EuiResizablePanel
              id="panel-main"
              className="containerPanel"
              initialSize={65}
              minSize="30%"
              mode="main"
            >
              <WorkspacePanel
                curVisId={curVisId}
                setCurVisId={setCurVisId}
                visualizations={visualizations}
              />
            </EuiResizablePanel>
            <EuiResizableButton />
            <EuiResizablePanel
              id="panel3"
              className="containerPanel"
              initialSize={20}
              minSize="200px"
              mode={['collapsible', { position: 'top' }]}
            >
              <ConfigPanel
                vizVectors={explorerVis}
                visualizations={visualizations}
                curVisId={curVisId}
                setCurVisId={setCurVisId}
                callback={callback}
                changeIsValidConfigOptionState={changeIsValidConfigOptionState}
              />
            </EuiResizablePanel>
          </>
        );
      }}
    </EuiResizableContainer>
  );
};
