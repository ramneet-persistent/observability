/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="cypress" />
import {
  delay,
  TEST_QUERIES,
  querySearch,
  landOnEventVisualizations,
} from '../../utils/event_constants';

const numberOfWindow = 4;
const legendSize = 20;
const pointSize = 30;
const pointSizeUpdated = 35;
const lineWidth = 7;
const lineWidthUpdated = 9;
const fillOpacity = 10;
const fillOpacityUpdated = 50;
const rotateLevel = 45;
const thresholdValue = 50;
const numberOfClickToAdd = 2;

const renderScatterChart = () => {
  landOnEventVisualizations();
  querySearch(TEST_QUERIES[9].query, TEST_QUERIES[9].dateRangeDOM);
  cy.get('[aria-label="config chart selector"]').click().type('Scatter').type('{enter}');
};

describe('Render scatter chart and verify default behaviour ', () => {
  before(() => {
    renderScatterChart();
  });

  it('Render scatter chart and verify data config and chart styles panel', () => {
    cy.get('.euiTitle.euiTitle--xxsmall').contains('Configuration').should('exist');
    cy.get('.euiTitle.euiTitle--xxsmall').contains('dimensions').should('exist');
    cy.get('.euiTitle.euiTitle--xxsmall').contains('series').should('exist');
    cy.get('.euiTitle.euiTitle--xxsmall').contains('Date Histogram').should('exist');
    cy.get('.euiText.euiText--small:contains(Click to add)').should(
      'have.length',
      numberOfClickToAdd
    );
    cy.get('.euiText.euiText--small.field_text').should('contain', 'avg machine.ram');
    cy.get('[aria-label="Timestamp field"]').contains('timestamp').should('exist');
    cy.get('[aria-label="interval field"]').should('have.value', '1');
    cy.get('[aria-label="date unit"]').contains('Day').should('exist');
    cy.get('[aria-label="interval field"]').should('exist');
    cy.get('[aria-label="date unit"]').should('exist');
    cy.get('.euiIEFlexWrapFix').contains('Panel options').click();
    cy.get('.euiIEFlexWrapFix').contains('Legend').click();
    cy.get('.euiIEFlexWrapFix').contains('Tooltip options').click();
    cy.get('.euiIEFlexWrapFix').contains('Chart styles').click();
    cy.get('.euiIEFlexWrapFix').contains('Color theme').click();
    cy.get('.euiIEFlexWrapFix').contains('Thresholds').click();
  });
});

describe('Check data configuration panel values for scatter chart', () => {
  before(() => {
    renderScatterChart();
  });

  it('Check two way sync for scatter chart', () => {
    cy.get('[aria-label="add-field"]').eq(0).click();
    cy.wait(delay);
    // cy.get('.euiFlexItem.euiFlexItem--flexGrowZero').should('exist')
    cy.get('[aria-label="aggregation input"]').should('contain', 'count');
    cy.get('.euiComboBoxPlaceholder').should('contain', 'Select a field');
    cy.get('[placeholder="Custom label"]').should('have.value', '');
    cy.get('.euiFormLabel.euiFormRow__label').should('contain', 'Side');
    cy.get('[data-test-subj="right"').should('have.attr', 'checked');
    cy.get('[data-test-subj="comboBoxInput"]').eq(1).click().type('bytes').type('{enter}');
    cy.get('[placeholder="Custom label"]').click().type('customBytes');
    cy.get('.euiFlexItem.euiFlexItem--flexGrowZero').eq(4).click();
    cy.get('.euiText.euiText--small.field_text').eq(1).should('contain', 'customBytes');
    cy.get('[data-test-subj="visualizeEditorRenderButton"]').click();
    cy.get('[data-test-subj="searchAutocompleteTextArea"]').should(
      'have.value',
      "source = opensearch_dashboards_sample_data_logs | where match(machine.os,'win')  |  stats avg(machine.ram), count(bytes) as customBytes by span(timestamp, 1d)"
    );
    cy.get('[aria-label="add-field"]').eq(1).should("have.attr", 'disabled')
  });
});

describe('Render scatter chart for panel options', () => {
  before(() => {
    renderScatterChart();
  });

  it('Render scatter chart and verify the title gets updated according to user input ', () => {
    cy.get('input[name="title"]').type('scatter Chart');
    cy.get('textarea[name="description"]').should('exist').click();
    cy.get('.gtitle').contains('scatter Chart').should('exist');
  });
});

describe('Render scatter chart for legend', () => {
  before(() => {
    renderScatterChart();
  });

  it('Render scatter chart and verify legends for Show and Hidden', () => {
    cy.get('[data-test-subj="show"]').should('have.attr', 'checked');
    cy.get('[data-test-subj="hidden"]').eq(0).should('exist').click({ force: true });
    cy.get('[data-unformatted="avg(machine.ram)"]').should('not.exist');
  });

  it('Render scatter chart and verify legends for position Right and Bottom', () => {
    cy.get('[data-text="Right"] [data-test-subj="v"]').should('have.attr', 'checked');
    cy.get('[data-text="Bottom"]').should('have.text', 'Bottom').click();
    cy.get('[data-text="Bottom"] [data-test-subj="h"]').should('not.have.attr', 'checked');
  });

  it('Render scatter chart and increase Legend Size', () => {
    cy.get('[data-test-subj="valueFieldNumber"]').eq(0).click().type(legendSize);
    cy.get('textarea[name="description"]').should('exist').click();
    cy.get('.legendtext').should('have.css', 'font-size', '20px');
  });
});

describe('Render scatter chart for Chart Styles ', () => {
  before(() => {
    renderScatterChart();
  });

  it('Render ltime serires and verify chart style of Marker Mode', () => {
    cy.get('#configPanel__panelOptions .euiFieldText').click().type('scatter chart');
    cy.get('.euiTextArea.euiTextArea--resizeVertical').eq(1)
      .click()
      .type('This is the description for scatter chart with chart style of Points');
    cy.get('[data-text="Marker"]').should('have.text', 'Marker').click();
    cy.get('[data-text="Marker"] [data-test-subj="markers"]').should('have.attr', 'checked');
  });

  it('Render scatter chart and verify chart style of Marker Mode with larger Point size', () => {
    cy.get('#configPanel__panelOptions .euiFieldText').click().type('scatter chart');
    cy.get('[data-text="Marker"]').should('have.text', 'Marker').click();
    cy.get('[data-text="Marker"] [data-test-subj="markers"]').should('have.attr', 'checked');
    cy.get('input[type="range"]')
      .then(($el) => $el[0].stepUp(pointSize))
      .trigger('change');
    cy.get('.euiRangeSlider').should('have.value', pointSizeUpdated);
  });

  it('Render scatter chart and verify chart style of Lines+Marker Mode', () => {
    cy.get('#configPanel__panelOptions .euiFieldText').click().type('scatter chart');
    cy.get('.euiTextArea.euiTextArea--resizeVertical').eq(1)
      .click()
      .type('This is the description for scatter chart with chart style of Lines and Marker');
    cy.get('[data-text="Lines + Markers"]').should('have.text', 'Lines + Markers').click();
    cy.get('[data-text="Lines + Markers"] [data-test-subj="lines+markers"]').should(
      'not.have.attr',
      'checked'
    );
  });

  it('Render scatter chart and verify chart style of Lines+Marker Mode with Line Width, Fill Opacity and Point Size', () => {
    cy.get('#configPanel__panelOptions .euiFieldText').click().type('scatter chart');
    cy.get('.euiTextArea.euiTextArea--resizeVertical').eq(1)
      .click()
      .type('This is the description for scatter chart with chart style of Lines and Marker');
    cy.get('[data-text="Lines + Markers"]').should('have.text', 'Lines + Markers').click();
    cy.get('[data-text="Lines + Markers"] [data-test-subj="lines+markers"]').should(
      'not.have.attr',
      'checked'
    );
    cy.get('input[type="range"]')
      .eq(0)
      .then(($el) => $el[0].stepUp(lineWidth))
      .trigger('change');
    cy.get('.euiRangeSlider').eq(0).should('have.value', lineWidthUpdated);
    cy.get('input[type="range"]')
      .eq(1)
      .then(($el) => $el[0].stepUp(fillOpacity))
      .trigger('change');
    cy.get('.euiRangeSlider').eq(1).should('have.value', fillOpacityUpdated);
    cy.get('input[type="range"]')
      .eq(2)
      .then(($el) => $el[0].stepUp(pointSize))
      .trigger('change');
    cy.get('.euiRangeSlider').eq(2).should('have.value', pointSizeUpdated);
    cy.get('input[type="range"]')
      .eq(3)
      .then(($el) => $el[0].stepUp(rotateLevel))
      .trigger('change');
    cy.get('.euiRangeSlider').eq(3).should('have.value', rotateLevel);
  });
});

describe('Render scatter chart for color theme', () => {
  before(() => {
    renderScatterChart();
  });

  it('Render scatter chart and "Add Color theme"', () => {
    cy.get('.euiButton__text').contains('+ Add color theme').click();
    cy.wait(delay);
    cy.get('[data-test-subj="comboBoxInput"]').eq(3).click();
    cy.get('.euiComboBoxOption__content').contains('avg(machine.ram)').click();
    // cy.get('path[style*="rgb(252, 5, 5)"]').should('exist');  ==== not working on component !!!
  });
});

describe.only('Render scatter chart and work with Thresholds', () => {
  before(() => {
    renderScatterChart();
  });

  it('Render scatter chart and add threshold', () => {
    cy.get('[data-test-subj="addThresholdButton"]').click();
    cy.get('[data-test-subj="nameFieldText"]').type('scatter chart Threshold');
    cy.get('[data-test-subj="valueFieldNumber"]').eq(1).type(thresholdValue);
    cy.get('[data-unformatted="scatter chart Threshold"]').should('be.visible');
    cy.get('path[style*="rgb(252, 5, 5)"]').should('exist');
  });
});

describe('Render scatter chart and verify if reset works properly', () => {
  beforeEach(() => {
    renderScatterChart();
  });

  it('Render scatter chart with all feild data then click on reset and verify reset works properly', () => {
    cy.get('input[placeholder="Title"]').type('scatter chart');
    cy.get('textarea[placeholder="Description"]').type('Description For scatter chart');
    cy.get('[data-text="Hidden"]').should('have.text', 'Hidden').click();
    cy.get('[data-test-subj="valueFieldNumber"]').eq(0).click().type(legendSize);
    cy.get('.euiButton__text').contains('+ Add color theme').click();
    cy.wait(delay);
    cy.get('[data-test-subj="comboBoxInput"]').eq(5).click();
    cy.get('.euiComboBoxOption__content').contains('count()').click();
    cy.get('.euiButton__text').contains('+ Add threshold').click();
    cy.get('[data-test-subj="nameFieldText"]').type('scatter chart Threshold');
    cy.get('[data-test-subj="valueFieldNumber"]').eq(1).type(thresholdValue);
    cy.get('.euiButtonEmpty__text').contains('Reset').click();
    cy.get('input[placeholder="Title"]').should('not.have.value', 'scatter chart');
    cy.get('textarea[placeholder="Description"]').should(
      'not.have.value',
      'Description For scatter chart'
    );
    cy.get('[data-text="Show"] [data-test-subj="show"]').should('have.attr', 'checked');
    cy.get('[data-text="Right"] [data-test-subj="v"]').should('have.attr', 'checked');
    cy.get('[data-test-subj="valueFieldNumber"]').eq(0).should('have.value', '');
  });
});
