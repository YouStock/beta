import os
version = '1.7.3'

outfile = 'zipBuildOutput'
outdir = '.'
outp = ' >> ' + outfile

packs = (pack for pack in os.listdir('packages'))
for pack in packs:

    infile = 'packages/' + pack;

    zipcmd = 'tar czf '
    zipsuf = '.tar.gz '
    if 'win32' in pack:
        zipcmd = 'zip -r -X '
        zipsuf = '.zip '

    os.system(zipcmd + pack + zipsuf + infile + outp)
    os.system('md5 ' + pack + zipsuf + outp)
    
os.system('mkdir ' + outdir + '/zips')
os.system('mv ' + outdir + '/*gz ' + outdir + '/zips/')
os.system('mv ' + outdir + '/*zip ' + outdir + '/zips/')
