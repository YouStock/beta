var sh = require('shelljs');

sh.find('./dist/assets/exe').forEach(f => {
    sh.chmod('+x', f);
});
