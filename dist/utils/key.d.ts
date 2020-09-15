export declare const generateNamespaceKey: () => string;
export declare const generatePatcherId: ({ namespace, }: {
    namespace: string;
}) => string;
export declare const generatePatcherKey: ({ namespace, componentName, }: {
    namespace: string;
    componentName: string;
}) => string;
export declare const generateRandomGlobalActionKey: () => string;
