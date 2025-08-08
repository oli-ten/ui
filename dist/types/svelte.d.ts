export type SubComponent<T> = T & {
    new (options: {
        props: never;
    }): unknown;
};
