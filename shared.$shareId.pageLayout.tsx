import { ReactNode, FunctionComponent } from 'react';

export type LayoutComponentShouldRequireChildren = FunctionComponent<{ children: ReactNode }>;

// This is a public page, so it should not use any shared layouts that require authentication.
const layouts: LayoutComponentShouldRequireChildren[] = [];
export default layouts;