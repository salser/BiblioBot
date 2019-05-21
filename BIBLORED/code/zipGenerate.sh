clear
rm -rf codelinux.zip
zip -r codelinux.zip node_modules app.js index.js package.json package-lock.json
rm -rf /home/hsalazar/TOM/code/codelinux.zip
mv codelinux.zip /home/hsalazar/TOM/code
cd /home/hsalazar/TOM/code
/home/hsalazar/bin/aws s3 sync . s3://bibliobot-bucket/
/home/hsalazar/bin/aws lambda update-function-code --function-name bibliobot --s3-bucket bibliobot-bucket --s3-key codelinux.zip
#clear
