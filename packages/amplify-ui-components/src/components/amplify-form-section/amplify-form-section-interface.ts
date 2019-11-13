import { FunctionalComponent } from '@stencil/core';

interface BaseFormSectionProps {
  overrideStyle?: boolean;
}

export interface AmplifyFormSectionHeaderProps extends BaseFormSectionProps {
  headerText: string;
}

export interface AmplifyFormSectionFooterProps extends BaseFormSectionProps {
  primaryContent: string | FunctionalComponent;
  secondaryContent: string | FunctionalComponent;
}
