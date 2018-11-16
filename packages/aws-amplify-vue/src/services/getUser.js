
function GetUser(amplify) {
  return amplify.Auth.currentAuthenticatedUser().then((user) => {
    if (!user) {
      return null;
    }
    return user;
  }).catch(e => new Error(e));
}

export default GetUser;
