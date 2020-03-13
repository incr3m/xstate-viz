import React from 'react';

import { Interpreter } from 'xstate';

interface StateChartContainerProps {

    service: Interpreter<any, any>;

    onReset: () => void;

}

export declare const StyledStateChartContainer: any;

export declare const StateChartContainer: React.SFC<StateChartContainerProps>;

export {};

