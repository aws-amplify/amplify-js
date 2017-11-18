/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { Hub, ClientDevice } from 'aws-amplify';

export const Container = {
    fontFamily: `-apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                "Helvetica Neue",
                Arial,
                sans-serif,
                "Apple Color Emoji",
                "Segoe UI Emoji",
                "Segoe UI Symbol"`,
    textAlign: 'center'
};

export const Section = {
    fontWeight: '200'
};

export const FormSection = {
    display: 'inline-block',
    fontWeight: '200'
};

export const ErrorSection = {
    background: 'orange',
    padding: '0.5em',
    margin: '0.2em auto',
    fontWeight: '300'
};

export const NavBar = {
    padding: '0.5em 0.5em 0.2em',
    marginBottom: '0.5em',
    borderBottom: '1px solid #00fff6'
};

export const NavRight = {
    textAlign: 'right',
    fontSize: '0.8em'
};

export const NavButton = {
    padding: '0',
    border: 'none',
    borderBottom: '1px solid #007bff',
    margin: 'auto 0.3em',
    background: '#fff',
    color: '#007bff'
}

export const SectionHeader = {
    background: '#007bff',
    color: '#fff',
    padding: '0.6em',
    fontSize: '1.2em',
    fontWeight: 'normal',
    textAlign: 'center'
};

export const SectionBody = {
    background: '#fff',
    color: '#000',
    padding: '1em',
    fontSize: '1em'
};

export const SectionFooter = {
    background: '#fff',
    color: '#000',
    padding: '1em',
    fontSize: '0.8em',
    textAlign: 'left',
    borderBottom: '1px solid #00fff6'
};

export const FormRow = {
    marginBottom: '0.5em',
    textAlign: 'left'
};

export const ActionRow = {
    marginTop: '1.5em',
    textAlign: 'right'
};

export const Input = {
    fontSize: '1em',
    fontWeight: '200',
    width: '15em',
    padding: '4px 2px',
    border: '1px solid #aaa'
};

export const Button = {
    fontSize: '1em',
    padding: '0.3em 0.5em',
    margin: 'auto 0.3em',
    border: '1px solid #007bff',
    background: '#fff',
    color: '#007bff'
}

export const Album = {
    display: 'block',
    width: '100%',
    textAlign: 'left'
}

export const AlbumPhoto = {
    display: 'inline-block',
    width: '32.5%',
    margin: '0.2%',
    verticalAlign: 'top'
}

export const Photo = {
    display: 'inline-block',
    width: '32.5%',
    margin: '0.2%',
    verticalAlign: 'top'
}

export const PhotoPicker = {
}

export const PhotoPickerButton = {
    background: '#fff',
    border: '1px solid #ccc',
    fontWeight: '200'
}

export const PhotoPickerInput = {
}

export const A = {
    textDecoration: 'underline'
}

export const Label = {
    margin: 'auto 0.5em'
}

export const Col2 = {
    display: 'inline-block',
    width: '16.66%'
}

export const Col3 = {
    display: 'inline-block',
    width: '24.5%',
    margin: '0.2%'
}

export const Col4 = {
    display: 'inline-block',
    width: '32%',
    margin: '0.2%'
}

export const Col6 = {
    display: 'inline-block',
    width: '49.5%',
    margin: '0.2%'
}

export const Center = {
    textAlign: 'center'
}

export const Hidden = {
    display: 'none'
}

const AmplifyTheme = {
    container: Container,
    navBar: NavBar,
    navRight: NavRight,
    navButton: NavButton,

    section: Section,
    sectionHeader: SectionHeader,
    sectionBody: SectionBody,
    sectionFooter: SectionFooter,

    formSection: FormSection,
    formRow: FormRow,
    actionRow: ActionRow,
    input: Input,
    button: Button,

    errorSection: ErrorSection,

    photo: Photo,
    album: Album,
    albumPhoto: AlbumPhoto,
    photoPicker: PhotoPicker,
    photoPickerButton: PhotoPickerButton,
    photoPickerInput: PhotoPickerInput,

    a: A,
    label: Label,

    col3: Col3,
    col4: Col4,
    col6: Col6,

    center: Center,
    hidden: Hidden
}

class MediaQuery {
    query() {
        const dim = ClientDevice.dimension();
        const { width, height } = dim;

        if (width < 576) {
            AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col6);
            AmplifyTheme.Photo = Object.assign({}, Photo, Col6);
        } else if (width < 768) {
            AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col4);
            AmplifyTheme.Photo = Object.assign({}, Photo, Col4);
        } else if (width < 992) {
            AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col3);
            AmplifyTheme.Photo = Object.assign({}, Photo, Col3);
        } else {
            AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col2);
            AmplifyTheme.Photo = Object.assign({}, Photo, Col2);
        }
    }

    onHubCapsule() {
        this.query();
    }
}

const mediaQuery = new MediaQuery();
mediaQuery.query();
Hub.listen('window', mediaQuery, 'AmplifyTheme');

export default AmplifyTheme;
