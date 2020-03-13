import React from 'react';

import { StateChartVisualization } from './StateChartVisualization';

import styled from 'styled-components';

export const StyledStateChartContainer = styled.section `
  display: grid;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
  padding: 0 1rem;

  &[data-child] {
    grid-template-columns: 1fr 1fr;
  }
`;

export const StateChartContainer = ({ service, onReset }) => {

    return (React.createElement(StyledStateChartContainer, null,

        React.createElement(StateChartVisualization, { service: service, visible: true, onSelectService: () => void 0, onReset: onReset })));

};

