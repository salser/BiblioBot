clear
rm -rf codelinux.zip
zip -r codelinux.zip node_modules app.js index.js package.json package-lock.json
rm -rf /home/bibliobot/Documents/ToM/s3Files/codelinux.zip
mv codelinux.zip /home/bibliobot/Documents/ToM/s3Files/
cd /home/bibliobot/Documents/ToM/s3Files
/home/bibliobot/bin/aws s3 sync . s3://bibliobot-bucket/
/home/bibliobot/bin/aws lambda update-function-code --function-name bibliobot --s3-bucket bibliobot-bucket --s3-key codelinux.zip
#clear
