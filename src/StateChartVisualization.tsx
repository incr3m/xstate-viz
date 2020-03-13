import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getEdges, getAllEdges } from './utils';
import { serializeEdge, initialStateNodes } from './utils';
import { Edge } from './Edge';
import { InitialEdge } from './InitialEdge';
import { StateChartNode } from './StateChartNode';
import { State, Interpreter } from 'xstate';
import { useService } from '@xstate/react';


const StyledViewTab = styled.li`
  padding: 0 1rem;
  border-bottom: 2px solid transparent;
  list-style: none;
  text-transform: uppercase;
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:not([data-active]):hover {
    border-color: var(--color-secondary-light);
  }

  &[data-active] {
    border-color: var(--color-secondary);
  }
`;

const StyledViewTabs = styled.ul`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  margin: 0;
  padding: 0;
  flex-grow: 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
`;

const StyledSidebar = styled.div`
  background-color: var(--color-sidebar);
  color: white;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 2rem 1fr;
  border-top-left-radius: 1rem;
  box-shadow: var(--shadow);
  transition: transform 0.6s cubic-bezier(0.5, 0, 0.5, 1);
  z-index: 1;
`;

export const StyledStateChartContainer = styled.section`
  display: grid;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
  padding: 0 1rem;

  &[data-child] {
    grid-template-columns: 1fr 1fr;
  }
`;


export const StyledStateChart = styled.div`
  grid-area: content;
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width, 25rem);
  grid-template-rows: 1fr;
  grid-template-areas: 'content sidebar';
  font-family: sans-serif;
  font-size: 12px;
  overflow: hidden;
  max-height: inherit;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  > ${StyledSidebar} {
    grid-area: sidebar;
  }

  > ${StyledStateChartContainer} {
    grid-area: content;
  }

  > * {
    max-height: inherit;
    overflow-y: auto;
  }

  [data-layout='viz'] & {
    > :not(${StyledSidebar}) {
      grid-column: 1 / -1;
    }

    > ${StyledSidebar} {
      transform: translateX(100%);
    }
  }
`;


const StyledVisualization = styled.div`
  position: relative;
  max-height: inherit;
  overflow-y: auto;
`;

export const StateChartVisualization: React.SFC<{
  service: Interpreter<any, any>;
  visible: boolean;
  onSelectService: (service: Interpreter<any>) => void;
  onReset: () => void;
}> = ({ service, visible, onSelectService, onReset }) => {
  const [transitionCount, setTransitionCount] = useState(0);
  const [current, send] = useService(service);
  const [state, setState] = React.useState<{
    [key: string]: any;
    preview?: State<any, any>;
  }>({
    toggledStates: {},
    previewEvent: undefined,
    preview: undefined
  });
  const svgRef = React.useRef<SVGSVGElement>(null);
  let edges: ReturnType<typeof getEdges> | null;

  try {
    edges = [];
    for (const stateKey in service.machine.states) {
      edges.push(...getAllEdges(service.machine.states[stateKey]));
    }
  } catch (err) {
    edges = null;
    console.error(err);
  }
  
  console.log('edges xx', edges);
  
  useEffect(() => {
    setTransitionCount(transitionCount + 1);
  }, [current]);

  if (!visible || !edges) {
    return null;
  }

  return (
    <StyledStateChart>
      <StyledVisualization>
        <svg
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            // @ts-ignore
            '--color': 'gray',
            overflow: 'visible',
            pointerEvents: 'none'
          }}
          ref={svgRef}
          key={JSON.stringify(state.toggledStates)}
        >
          <defs>
            <marker
              id="marker"
              markerWidth="4"
              markerHeight="4"
              refX="2"
              refY="2"
              markerUnits="strokeWidth"
              orient="auto"
            >
              <path d="M0,0 L0,4 L4,2 z" fill="var(--color-edge)" />
            </marker>
            <marker
              id="marker-preview"
              markerWidth="4"
              markerHeight="4"
              refX="2"
              refY="2"
              markerUnits="strokeWidth"
              orient="auto"
            >
              <path d="M0,0 L0,4 L4,2 z" fill="var(--color-edge-active)" />
            </marker>
          </defs>
          {edges.map(edge => {
            if (!svgRef.current) {
              return;
            }

            // const svgRect = this.svgRef.current.getBoundingClientRect();

            return (
              <Edge
                key={serializeEdge(edge)}
                svg={svgRef.current}
                edge={edge}
                preview={
                  edge.event === state.previewEvent &&
                  current.matches(edge.source.path.join('.')) &&
                  !!state.preview &&
                  state.preview.matches(edge.target.path.join('.'))
                }
              />
            );
          })}
          {initialStateNodes(service.machine).map((initialStateNode, i) => {
            if (!svgRef.current) {
              return;
            }

            return (
              <InitialEdge
                key={`${initialStateNode.id}_${i}`}
                source={initialStateNode}
                svgRef={svgRef.current}
                preview={
                  current.matches(initialStateNode.path.join('.')) ||
                  (!!state.preview &&
                    state.preview.matches(initialStateNode.path.join('.')))
                }
              />
            );
          })}
        </svg>
        <StateChartNode
          stateNode={service.machine}
          current={service.state}
          transitionCount={transitionCount}
          level={0}
          preview={state.preview}
          onReset={onReset}
          onEvent={event => {
            send(event);
          }}
          onPreEvent={event => {
            if (!state.preview) {
              setState({
                ...state,
                preview: service.nextState(event),
                previewEvent: event
              });
            }
          }}
          onExitPreEvent={() => {
            setState({
              ...state,
              preview: undefined,
              previewEvent: undefined
            });
          }}
          onSelectServiceId={serviceId => {
            const s = (service as any).children.get(serviceId);

            if (s) {
              onSelectService(s); // TODO: pass service via context
            }
          }}
          toggledStates={state.toggledStates}
        />
      </StyledVisualization>
    </StyledStateChart>
  );
};
