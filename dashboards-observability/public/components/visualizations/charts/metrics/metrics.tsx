/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';
import React from 'react';
import { sum, min, max, meanBy } from 'lodash';
import { EmptyPlaceholder } from '../../../event_analytics/explorer/visualizations/shared_components/empty_placeholder';
import './metrics.scss';

export const Metrics = ({ visualizations }: any) => {
  const {
    data,
    metadata: { fields },
  } = visualizations.data.rawVizData;
	const { dataConfig = {}, layoutConfig = {} } = visualizations.data.userConfigs;
	console.log("dataConfig====", dataConfig)
	console.log("layoutConfig===", layoutConfig)
  const dataConfigTab =
    visualizations.data?.rawVizData?.metrics?.dataConfig &&
    visualizations.data.rawVizData.metrics.dataConfig;

		const calculateAggregateValue = (aggregate: string, label: string) => {
    if (aggregate === 'COUNT') {
      return data[label].length;
    } else if (aggregate === 'AVERAGE') {
      return meanBy(data[label]).toFixed(2);
    } else if (aggregate === 'MAX') {
      return (max(data[label]) as number).toFixed(2);
    } else if (aggregate === 'MIN') {
      return (min(data[label]) as number).toFixed(2);
    } else if (aggregate === 'SUM') {
      return sum(data[label]).toFixed(2);
    }
  };

  return (
    <div className="metricsContainer">
      <div>
        {dataConfigTab && dataConfigTab.metrics.length > 0 ? (
          dataConfigTab.metrics.map((metric) => {
            return (
              <EuiFlexGroup
                justifyContent="spaceAround"
                alignItems="center"
                className="metricValueContainer"
              >
                {metric.aggregation.length !== 0 &&
                  metric.label !== '' &&
                  metric.aggregation.map((aggFunction) => (
                    <EuiFlexItem grow={false} className="metricValue">
                      <div className="aggregateValue">
                        {calculateAggregateValue(aggFunction.label, metric.label)}
                      </div>
                      <div className="aggregateLabel">
                        {metric.custom_label !== '' ? metric.custom_label : metric.label}
                      </div>
                    </EuiFlexItem>
                  ))}
              </EuiFlexGroup>
            );
          })
        ) : (
          <EmptyPlaceholder icon={visualizations?.vis?.iconType} />
        )}
      </div>
    </div>
  )
};
