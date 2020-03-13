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
    <div style={{border:'solid 3px black', margin:50}}>
      <StateChartVisualization
        service={service}
        visible={true}
        onSelectService={() => void 0}
        // onReset={onReset}
        />
    </div>
  );
}