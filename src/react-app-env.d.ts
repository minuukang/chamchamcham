/// <reference types="react-scripts" />
type ThenArg<T> = T extends Promise<infer U> ? U : T;