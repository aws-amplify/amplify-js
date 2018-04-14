const theme: any = {};

theme.button = {
  'border-radius': '2px',
  'height': '3.6rem',
  'font-size': '1.4rem',
  'font-weight': '500',
  'color': '#fff',
  'background-color': '#488aff',
  'box-shadow': `0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12)`,
  'margin': '0.4rem 0.2rem',
  'padding': '0 1.1em',
  'text-transform': 'uppercase'
};

theme.form = {
  container: {
    'border-radius': '2px',
    'font-size': '1.4rem',
    'box-shadow': `0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 1px 5px 0 rgba(0, 0, 0, 0.12)`
  },
  body: {
    'padding': '16px'
  },
  row: {
    'display': 'flex'
  },
  leftCell: {
    'flex': '1',
    'text-align': 'left',
    'margin': '8px 0 8px 8px'
  },
  rightCell: {
    'flex': '1',
    'text-align': 'right',
    'margin': '8px 8px 8px 0'
  },
  input: {
    'margin': '8px',
    'margin-right': '0',
    'width': 'calc(100% - 8px)',
    'font-size': '1.6rem',
    'border': '0'
  },
  button: Object.assign({}, theme.button, {
    'width': '100%'
  }),
  errorMessage: {
    'padding': '16px',
    'background-color': 'orange'
  }
};

theme.photoPicker = {
  container: {
    'position': 'relative'
  },
  preview: {
    'text-align': 'center'
  },
  previewImg: {
    'width': 'auto',
    'max-width': '100%',
    'display': 'inline-block'
  },
  button: {
    'text-align': 'center',
    'border': '1px solid #ddd',
    'padding': '0.5em',
    'font-size': '1.5em'
  },
  picker: {
    'width': '100%',
    'height': '100%',
    'display': 'block',
    'position': 'absolute',
    'left': '0',
    'top': '0',
    'opacity': '0',
    'background': 'black'
  }
};

theme.album = {};

theme.image = {
  container: {
    'text-align': 'center',
    'border-radius': '2px',
    'box-shadow': `0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 1px 5px 0 rgba(0, 0, 0, 0.12);`,
    '-webkit-box-shadow': `0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 1px 5px 0 rgba(0, 0, 0, 0.12);`
  },
  image: {
    'display': 'inline-block',
    'width': 'auto',
    'max-width': '100%'
  }
};

export default theme;
