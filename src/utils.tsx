import {
  StateNode,
  TransitionDefinition,
  // Edge,
  Action,
  ActionObject,
  Guard,
  EventObject,
  AnyEventObject
} from 'xstate';

// import {
//   StateNode,
//   AnyEventObject,
//   TransitionDefinition,
//   StateMachine,
//   State,
//   ActionObject
// } from 'xstate';


export interface Edge<
  TContext,
  TEvent extends AnyEventObject,
  TEventType extends TEvent['type'] = string
> {
  event: TEventType;
  cond?: any;
  actions?: any;
  source: StateNode<TContext, any, TEvent>;
  target: StateNode<TContext, any, TEvent>;
  transition: TransitionDefinition<TContext, TEvent>;
}

export function isChildOf(
  childState: StateNode,
  parentState: StateNode
): boolean {
  let marker = childState;

  while (marker.parent && marker.parent !== parentState) {
    marker = marker.parent;
  }

  return marker === parentState;
}

export function flatten<T>(array: T[][]): T[] {
  return ([] as T[]).concat(...array);
}

export function transitions(
  stateNode: StateNode
): TransitionDefinition<any, any>[] {
  return flatten(
    stateNode.ownEvents.map((event: string) => {
      return stateNode.definition.on[event];
    })
  );
}

export function condToString(cond: Guard<any, any>) {
  return cond.type;
  // if (typeof cond === "function") {
  //   return cond.toString();
  //   // return cond
  //   //   .toString()
  //   //   .replace(/\n/g, "")
  //   //   .match(/\{(.*)\}/)![1]
  //   //   .trim();
  // }

  // return cond;
}

export const DELAY_EVENT_REGEX = /^xstate\.after\((.+)\)#/;

export function getEventDelay(event: string): string | number | false {
  let match = event.match(DELAY_EVENT_REGEX);

  if (match) {
    return Number.isFinite(+match[1]) ? +match[1] : match[1];
  }

  return false;
}

export function serializeEdge(edge: Edge<any, any>): string {
  const cond = edge.cond ? `[${edge.cond.toString().replace(/\n/g, '')}]` : '';
  return `${edge.source.id}:${edge.event}${cond}->${edge.target.id}`;
}

export function isHidden(el?: Element | null): el is null {
  if (!el) {
    return true;
  }
  const rect = el.getBoundingClientRect();

  if (rect.width === 0 && rect.height === 0) {
    return true;
  }

  return false;
}

export function relative(
  childRect: ClientRect,
  parentElement: Element
): ClientRect {
  const parentRect = parentElement.getBoundingClientRect();

  return {
    top: childRect.top - parentRect.top,
    right: childRect.right - parentRect.left,
    bottom: childRect.bottom - parentRect.top,
    left: childRect.left - parentRect.left,
    width: childRect.width,
    height: childRect.height
  };
}

export function initialStateNodes(stateNode: StateNode): StateNode[] {
  const stateKeys = Object.keys(stateNode.states);

  return stateNode.initialStateNodes.concat(
    flatten(
      stateKeys.map(key => {
        const childStateNode = stateNode.states[key];
        if (
          childStateNode.type === 'compound' ||
          childStateNode.type === 'parallel'
        ) {
          return initialStateNodes(stateNode.states[key]);
        }

        return [];
      })
    )
  );
}

export function stateActions(stateNode: StateNode): ActionObject<any, any>[] {
  return stateNode.onEntry.concat(stateNode.onExit);
}

export interface Point {
  x: number;
  y: number;
  color?: string;
}

export function center(rect: ClientRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

export function isBuiltInEvent(eventType: string): boolean {
  return (
    eventType.indexOf('xstate.') === 0 ||
    eventType.indexOf('done.') === 0 ||
    eventType === ''
  );
}



export function getChildren(machine: StateNode): StateNode[] {
  if (!machine.states) {
    return [];
  }

  return Object.keys(machine.states).map(key => {
    return machine.states[key];
  });
}

export function getEdges(stateNode: StateNode): Array<Edge<any, any, any>> {
  const edges: Array<Edge<any, any, any>> = [];
  console.log('edge statenode', stateNode.on);
  Object.keys(stateNode.on).forEach(eventType => {
    const transitions = stateNode.on[eventType];
  // console.log('transitions',transitions)
    transitions.forEach(t => {
      (t.target || [stateNode]).forEach(target => {
        edges.push({
          event: eventType,
          source: stateNode,
          target,
          transition: t
        });
      });
    });
  });

  console.log('edges',edges)

  return edges;
}

export function getAllEdges(stateNode: StateNode): Array<Edge<any, any, any>> {
  const children = getChildren(stateNode);

  const arrs = [];
  arrs.push(...getEdges(stateNode))
  children.forEach(child => {
    arrs.push(...getAllEdges(child));
  });
  return arrs;

}

export interface Indexes {
  sources: Record<string, Array<TransitionDefinition<any, any>>>;
  targets: Record<string, Array<TransitionDefinition<any, any>>>;
  transitions: Record<string, Edge<any, any>>;
}

// export function getIndexes(machine: StateMachine<any, any, any>): Indexes {
//   const edges = getAllEdges(machine);

//   const indexes: Indexes = {
//     sources: {},
//     targets: {},
//     transitions: {}
//   };

//   edges.forEach(edge => {
//     if (!indexes.sources[edge.source.id]) {
//       indexes.sources[edge.source.id] = [];
//     }

//     indexes.sources[edge.source.id].push(edge.transition);

//     if (!indexes.targets[edge.target.id]) {
//       indexes.targets[edge.target.id] = [];
//     }

//     indexes.targets[edge.target.id].push(edge.transition);

//     const serializedTransition = serializeTransition(edge.transition);

//     indexes.transitions[serializedTransition] = edge;
//   });

//   return indexes;
// }

export interface Point {
  x: number;
  y: number;
  color?: string;
}

export function pointAt(
  rect: ClientRect,
  xPos: number | 'center' | 'left' | 'right',
  yPos: number | 'center' | 'top' | 'bottom'
): Point {
  return {
    x:
      xPos === 'center'
        ? rect.left + rect.width / 2
        : typeof xPos === 'string'
        ? rect[xPos]
        : rect.left + xPos,
    y:
      yPos === 'center'
        ? rect.top + rect.height / 2
        : typeof yPos === 'string'
        ? rect[yPos]
        : yPos < 1 && yPos > 0
        ? rect.top + rect.height / yPos
        : rect.top + yPos
  };
}

// export function center(rect: ClientRect): Point {
//   return {
//     x: rect.left + rect.width / 2,
//     y: rect.top + rect.height / 2
//   };
// }

export function relativePoint(point: Point, parentElement: Element): Point {
  const parentRect = parentElement.getBoundingClientRect();

  return {
    x: point.x - parentRect.left,
    y: point.y - parentRect.top
  };
}

// export function relative(
//   childRect: ClientRect,
//   parentElement: Element
// ): ClientRect {
//   const parentRect = parentElement.getBoundingClientRect();

//   return {
//     top: childRect.top - parentRect.top,
//     right: childRect.right - parentRect.left,
//     bottom: childRect.bottom - parentRect.top,
//     left: childRect.left - parentRect.left,
//     width: childRect.width,
//     height: childRect.height
//   };
// }

export function serializeTransition(
  transition: TransitionDefinition<any, any>
): string {
  return `event:${transition.source.id}:${transition.eventType}:${
    transition.cond ? transition.cond.toString() : ''
  }`;
}

// export function isActive(
//   state: State<any, any>,
//   stateNode: StateNode<any, any>
// ) {
//   const resolvedState = stateNode.machine.resolveState(state);
//   const active = resolvedState.configuration.includes(stateNode);

//   return active;
// }

export function serializeAction(action: ActionObject<any, any>): string {
  return JSON.stringify(action);
}
