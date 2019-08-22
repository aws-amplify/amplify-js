interface BaseFormSectionProps {
  overrideStyle?: boolean;
}

export interface AmplifyFormSectionHeaderProps extends BaseFormSectionProps {
  headerText: string;
}

export interface AmplifyFormSectionFooterProps extends BaseFormSectionProps {
  submitButtonText: string;
}