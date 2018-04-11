const checkNodeVersion = version => {
  const versionRegex = new RegExp(`^${version}\\..*`);
  const versionCorrect = process.versions.node.match(versionRegex);
  if (!versionCorrect) {
    throw Error(
      `Running on wrong Nodejs version. Consider using nvm (Node Version Manager) to install and use nodejs v${version}`
    );
  }
};

checkNodeVersion(6);
