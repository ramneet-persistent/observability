/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback, Fragment } from 'react';
import { EuiAccordion, EuiSpacer } from '@elastic/eui';
import { get } from 'lodash';
import { ButtonGroupItem } from './config_button_group';
import { IConfigPanelOptionSection } from '../../../../../../../../common/types/explorer';
import {
  SLIDER_MIN_VALUE,
  SLIDER_MAX_VALUE,
  SLIDER_DEFAULT_STEP,
} from '../../../../../../../../common/constants/shared';
import { ConfigChartOptionsEnum } from '../../../../../../../../common/constants/explorer';

export const ConfigBarChartStyles = ({
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
    if (vizState?.orientation === 'h') {
      return schemas.filter((schema: IConfigPanelOptionSection) => schema.mapTo !== 'labelAngle');
    }
    return schemas;
  }, [vizState]);

  const dimensions = useMemo(
    () =>
      currentSchemas.map((schema: IConfigPanelOptionSection, index: number) => {
        let params = {
          title: schema.name,
          vizState,
          ...schema.props,
        };
        const DimensionComponent = schema.component || ButtonGroupItem;

        const createDimensionComponent = (dimProps) => (
          <Fragment key={`viz-series-${index}`}>
            <DimensionComponent {...dimProps} />
            <EuiSpacer size="s" />
          </Fragment>
        );
        switch (schema.eleType) {
          case ConfigChartOptionsEnum.buttons:
            params = {
              ...params,
              legend: schema.name,
              groupOptions: schema?.props?.options.map((btn: { name: string }) => ({
                ...btn,
                label: btn.name,
              })),
              idSelected: vizState[schema.mapTo] || schema?.props?.defaultSelections[0]?.id,
              handleButtonChange: handleConfigurationChange(schema.mapTo),
            };
            return createDimensionComponent(params);
          case ConfigChartOptionsEnum.input:
            params = {
              title: schema.name,
              currentValue: vizState[schema.mapTo] || '',
              numValue: vizState[schema.mapTo] || '',
              handleInputChange: handleConfigurationChange(schema.mapTo),
              vizState,
              ...schema.props,
            };
            return createDimensionComponent(params);

          case ConfigChartOptionsEnum.slider:
            params = {
              ...params,
              minRange:
                typeof get(schema, 'props.min') === undefined
                  ? SLIDER_MIN_VALUE
                  : get(schema, 'props.min'),
              maxRange:
                typeof get(schema, 'props.max') === undefined
                  ? SLIDER_MAX_VALUE
                  : get(schema, 'props.max'),
              step: schema?.props?.step || SLIDER_DEFAULT_STEP,
              currentRange: vizState[schema.mapTo] || schema?.defaultState,
              ticks: schema?.props?.ticks,
              showTicks: schema?.props?.showTicks || false,
              handleSliderChange: handleConfigurationChange(schema.mapTo),
            };
            return createDimensionComponent(params);

          default:
            params = {
              ...params,
              paddingTitle: schema.name,
              advancedTitle: 'advancedTitle',
              dropdownList:
                schema?.options?.map((option) => ({ ...option })) ||
                fields.map((item) => ({ ...item })),
              onSelectChange: handleConfigurationChange(schema.mapTo),
              isSingleSelection: schema.isSingleSelection,
              selectedAxis: vizState[schema.mapTo] || schema.defaultState,
            };
            return createDimensionComponent(params);
        }
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
