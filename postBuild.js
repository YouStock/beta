//set geth exec permissions
var sh = require('shelljs');
sh.find('./dist/assets/exe').forEach(f => {
    sh.chmod('+x', f);
});

//replace baseref
const replace = require('replace-in-file');
const options = {
  files: './dist/index.html',
  from: /base href="\/"/g,
  to: 'base href="./"',
};

replace(options)
  .then(changes => {
    console.log('Modified files:', changes.join(', '));
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
