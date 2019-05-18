clear
rm -rf codelinux-puj.zip
zip -r codelinux-puj.zip node_modules app.js index.js package.json package-lock.json
rm -rf /home/hsalazar/TOM/s3files/codelinux-puj.zip
mv codelinux-puj.zip /home/hsalazar/TOM/s3files
cd /home/hsalazar/TOM/s3files
/usr/local/bin/aws s3 sync . s3://bibliobot-bucket/
/usr/local/bin/aws lambda update-function-code --function-name bibliobot-puj --s3-bucket bibliobot-bucket --s3-key codelinux-puj.zip
#clear
