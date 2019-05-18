clear
rm -rf codelinux.zip
zip -r codelinux.zip node_modules app.js index.js package.json package-lock.json
rm -rf /home/hsalazar/TOM/s3files/codelinux.zip
mv codelinux.zip /home/hsalazar/TOM/s3files
cd /home/hsalazar/TOM/s3files
/usr/local/bin/aws s3 sync . s3://bibliobot-bucket/
/usr/local/bin/aws lambda update-function-code --function-name bibliobot --s3-bucket bibliobot-bucket --s3-key codelinux.zip
#clear
