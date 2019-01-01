

export interface ISignUpField {
    custom?: boolean;
    displayOrder?: number;
    invalid?: boolean;
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
    type?: string;
}

const signUpFields: ISignUpField [] = [
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
        displayOrder: 3
    },
    {
        label: 'Phone Number',
        key: 'phone_number',
        placeholder: 'Phone Number',
        required: true,
        displayOrder: 4
    }
  ];

export default signUpFields; 