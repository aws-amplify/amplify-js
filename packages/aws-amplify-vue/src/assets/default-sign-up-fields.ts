export interface IField {
  label: string;
  key: string;
  required: boolean;
  placeholder: string;
  type?: 'password' | 'email';
  displayOrder: number;
  value?: string;
  custom?: boolean;
}

export const signUpWithUsername: IField[] = [
  {
    label: 'Username',
    key: 'username',
    required: true,
    placeholder: 'Username',
    displayOrder: 1,
  },
  {
    label: 'Password',
    key: 'password',
    required: true,
    placeholder: 'Password',
    type: 'password',
    displayOrder: 2,
  },
  {
    label: 'Email',
    key: 'email',
    required: true,
    placeholder: 'Email',
    type: 'email',
    displayOrder: 3,
  },
  {
    label: 'Phone Number',
    key: 'phone_number',
    placeholder: 'Phone Number',
    required: true,
    displayOrder: 4,
  },
];

export const signUpWithEmailFields: IField[] = [
  {
    label: 'Email',
    key: 'email',
    required: true,
    placeholder: 'Email',
    type: 'email',
    displayOrder: 1,
  },
  {
    label: 'Password',
    key: 'password',
    required: true,
    placeholder: 'Password',
    type: 'password',
    displayOrder: 2,
  },
  {
    label: 'Phone Number',
    key: 'phone_number',
    placeholder: 'Phone Number',
    required: true,
    displayOrder: 3,
  },
];

export const signUpWithPhoneNumberFields: IField[] = [
  {
    label: 'Phone Number',
    key: 'phone_number',
    placeholder: 'Phone Number',
    required: true,
    displayOrder: 1,
  },
  {
    label: 'Password',
    key: 'password',
    required: true,
    placeholder: 'Password',
    type: 'password',
    displayOrder: 2,
  },
  {
    label: 'Email',
    key: 'email',
    required: true,
    placeholder: 'Email',
    type: 'email',
    displayOrder: 3,
  },
];
