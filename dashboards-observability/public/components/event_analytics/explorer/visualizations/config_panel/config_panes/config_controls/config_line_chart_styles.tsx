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
  visChartTypes,
  SLIDER_MIN_VALUE,
  SLIDER_MAX_VALUE,
  SLIDER_DEFAULT_STEP,
} from '../../../../../../../../common/constants/shared';

export const ConfigLineChartStyles = ({
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
    (stateFiledName) => {
      return (changes) => {
        handleConfigChange({
          ...vizState,
          [stateFiledName]: changes,
        });
      };
    },
    [handleConfigChange, vizState]
  );

  /* To update the schema options based on current style mode selection */
  const currentSchemas = useMemo(() => {
    if (vizState?.style) {
      switch (vizState.style) {
        case 'lines':
          return schemas.filter(
            (schema: IConfigPanelOptionSection) => schema.mapTo !== 'pointSize'
          );
        case 'bar':
          return schemas.filter(
            (schema: IConfigPanelOptionSection) =>
              !['interpolation', 'pointSize'].includes(schema.mapTo)
          );
        case 'markers':
          return schemas.filter((schema: IConfigPanelOptionSection) =>
            ['style', 'pointSize'].includes(schema.mapTo)
          );
        case 'lines+markers':
          return schemas.filter(
            (schema: IConfigPanelOptionSection) => schema.mapTo !== 'interpolation'
          );
      }
    } else if (visualizations?.vis?.name === visChartTypes.Scatter) {
      return schemas.filter((schema: IConfigPanelOptionSection) =>
        ['style', 'pointSize'].includes(schema.mapTo)
      );
    } else {
      return schemas.filter((schema: IConfigPanelOptionSection) => schema.mapTo !== 'pointSize');
    }
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
        if (schema.eleType === 'buttons') {
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
        } else if (schema.eleType === 'slider') {
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
        } else if (schema.eleType === 'input') {
          params = {
            ...params,
            numValue: vizState[schema.mapTo] || '',
            handleInputChange: handleConfigurationChange(schema.mapTo),
          };
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
