import React from "react";
import { render } from "react-dom";
// import { MachineViz } from '@xstate/viz';
import { interpret, Machine } from "xstate";
import { StateChartVisualization } from "./StateChartVisualization";
// import { StateChartContainer } from './VizTabs';
import styled from 'styled-components';


const machineDef = {
  id: "fetch",
  initial: "idle",
  context: {
    retries: 0
  },
  states: {
    idle: {
      on: {
        LOAD: "loading",
        FETCH: "fetching",
        EDIT: "success"
      }
    },
    fetching: {
      on: {
        LOAD: "loading"
      }
    },
    loading: {
      on: {
        RESOLVE: "success",
        REJECT: "failure",
        BACK: "idle"
      }
    },
    success: {
      type: "final"
    },
    failure: {
      on: {
        RETRY: {
          target: "loading"
        }
      }
    }
  }
};

export function App() {
  const service = React.useMemo(() => {
    return interpret(Machine(machineDef)).start();
  }, []);

  return (
    <StyledApp>
      <StateChartVisualization
        service={service}
        visible={true}
        onSelectService={() => void 0}
        // onReset={onReset}
      />
    </StyledApp>
  );
}


export const StyledLayoutButton = styled.button`
  appearance: none;
  background: white;
  box-shadow: var(--shadow);
  font-weight: bold;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
  color: black;
  border: none;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  z-index: 2;
  margin-top: 1rem;
  opacity: 0.7;
  transition: all var(--duration) var(--easing);
  transform: translateX(0.5rem);

  &:focus,
  &:hover {
    outline: none;
  }

  &:hover {
    opacity: 1;
    transform: none;
  }

  [data-layout='viz'] & {
    right: 100%;
    color: black;
  }
`;


export const StyledHeader = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  grid-area: header;
  padding: 0.5rem 1rem;
  z-index: 1;
  white-space: nowrap;
`;

const StyledApp = styled.main`
  --color-app-background: #fff;
  --color-border: #c9c9c9;
  --color-primary: rgba(87, 176, 234, 1);
  --color-primary-faded: rgba(87, 176, 234, 0.5);
  --color-primary-shadow: rgba(87, 176, 234, 0.1);
  --color-link: rgba(87, 176, 234, 1);
  --color-disabled: #b3b3b3;
  --color-edge: #c9c9c9;
  --color-edge-active: var(--color-primary);
  --color-secondary: rgba(255, 152, 0, 1);
  --color-secondary-light: rgba(255, 152, 0, 0.5);
  --color-sidebar: #272722;
  --color-gray: #555;
  --color-failure: #ee7170;
  --color-success: #31ae00;
  --radius: 0.2rem;
  --border-width: 2px;
  --sidebar-width: 25rem;
  --shadow: 0 0.5rem 1rem var(--shadow-color, rgba(0, 0, 0, 0.2));
  --duration: 0.2s;
  --easing: cubic-bezier(0.5, 0, 0.5, 1);

  height: 100%;
  display: grid;
  grid-template-areas:
    'header sidebar'
    'content content';
  grid-template-rows: 3rem auto;
  grid-template-columns: auto var(--sidebar-width);
  overflow: hidden;

  > ${StyledLayoutButton} {
    display: inline-block;
    grid-row: 2;
    grid-column: -1;
  }

  @media (max-width: 900px) {
    grid-template-columns: 50% 50%;
  }

  &[data-embed] {
    grid-template-rows: 0 auto;

    > ${StyledHeader} {
      display: none;
    }
  }
`;
