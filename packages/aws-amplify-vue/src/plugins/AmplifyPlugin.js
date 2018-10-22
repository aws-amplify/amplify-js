/*
  This plugin is a mechanism for avoiding the importation of Amplify into Amplify-Vue,
  while also making Amplify available to the entire host application.
*/
const requiredModules = [
  'Auth',
  'AuthClass',
  'Logger',
];

const AmplifyPlugin = {
  install(Vue, AmplifyModules) {
    const missingModules = [];
    requiredModules.forEach((r) => {
      if (!Object.keys(AmplifyModules).includes(r)) {
        missingModules.push(r);
      }
    });
    if (missingModules.length > 0) {
      return new Error(`AmplifyPlugin installation method did not receive required modules: ${missingModules.join(', ')}.`); //eslint-disable-line
    }

    Vue.prototype.$Amplify = AmplifyModules;
  },
};

export { AmplifyPlugin }; //eslint-disable-line
