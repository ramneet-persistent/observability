/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, Fragment } from 'react';
import { EuiAccordion, EuiSpacer } from '@elastic/eui';
import { ButtonGroupItem } from './config_button_group';
import { IConfigPanelOptionSection } from '../../../../../../../../common/types/explorer';
import {
  DefaultStatsParameters,
  ConfigChartOptionsEnum,
  NUMBER_INPUT_MIN_LIMIT,
} from '../../../../../../../../common/constants/explorer';

export const ConfigStatChartStyles = ({
  visualizations,
  schemas,
  vizState,
  handleConfigChange,
  sectionName,
  sectionId = 'chartStyles',
}: any) => {
  const { data } = visualizations;
  const { data: vizData = {}, metadata: { fields = [] } = {} } = data?.rawVizData;

  const handleConfigurationChange = useCallback(
    (stateFieldName) => {
      return (changes) => {
        handleConfigChange({
          ...vizState,
          [stateFieldName]: changes,
        });
      };
    },
    [handleConfigChange, vizState]
  );

  /* To update the schema options based on current style mode selection */
  const currentSchemas = useMemo(() => {
    if (
      vizState?.chartType === DefaultStatsParameters.DefaultChartType ||
      vizState?.chartType === undefined
    ) {
      return schemas.filter((schema: IConfigPanelOptionSection) => schema.mapTo !== 'textColor');
    }
    return schemas;
  }, [vizState]);

  const dimensions = useMemo(
    () =>
      currentSchemas &&
      currentSchemas.map((schema: IConfigPanelOptionSection, index: number) => {
        const DimensionComponent = schema.component || ButtonGroupItem;
        let params = {
          title: schema.name,
          vizState,
          ...schema.props,
        };
        switch (schema.eleType) {
          case ConfigChartOptionsEnum.treemapColorPicker:
            params = {
              ...params,
              selectedColor: vizState[schema.mapTo] || schema?.defaultState,
              colorPalettes: schema.options || [],
              numberOfParents: 0,
              onSelectChange: handleConfigurationChange(schema.mapTo),
            };
            break;

          case ConfigChartOptionsEnum.input:
            params = {
              ...params,
              currentValue: vizState[schema.mapTo] || '',
              numValue: vizState[schema.mapTo] || '',
              handleInputChange: handleConfigurationChange(schema.mapTo),
              minLimit: schema.props?.hasOwnProperty('minLimit')
                ? schema.props.minLimit
                : NUMBER_INPUT_MIN_LIMIT,
            };
            break;

          case ConfigChartOptionsEnum.textInput:
            params = {
              ...params,
              currentValue: vizState[schema.mapTo] || '',
              name: schema.mapTo,
              handleInputChange: handleConfigurationChange(schema.mapTo),
            };
            break;

          case ConfigChartOptionsEnum.buttons:
            params = {
              ...params,
              title: schema.name,
              legend: schema.name,
              groupOptions: schema?.props?.options.map((btn: { name: string }) => ({
                ...btn,
                label: btn.name,
              })),
              idSelected: vizState[schema.mapTo] || schema?.props?.defaultSelections[0]?.id,
              handleButtonChange: handleConfigurationChange(schema.mapTo),
            };
            break;

          default:
            params = {
              ...params,
              paddingTitle: schema.name,
              advancedTitle: 'advancedTitle',
              dropdownList: schema?.options || fields,
              onSelectChange: handleConfigurationChange(schema.mapTo),
              isSingleSelection: schema.isSingleSelection,
              selectedAxis: vizState[schema.mapTo] || schema.defaultState,
            };
            break;
        }
        return (
          <Fragment key={`viz-series-${index}`}>
            <DimensionComponent {...params} />
            <EuiSpacer size="s" />
          </Fragment>
        );
      }),
    [currentSchemas, vizState, handleConfigurationChange]
  );

  return (
    <EuiAccordion
      initialIsOpen
      id={`configPanel__${sectionId}`}
      buttonContent={sectionName}
      paddingSize="s"
    >
      {dimensions}
    </EuiAccordion>
  );
};
