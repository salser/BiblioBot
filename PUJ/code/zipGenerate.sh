clear
rm -rf codelinux-puj.zip
zip -r codelinux-puj.zip node_modules app.js index.js package.json package-lock.json
rm -rf /home/bibliobot/Documents/ToM/s3Files/codelinux.zip
mv codelinux-puj.zip /home/bibliobot/Documents/ToM/s3Files/
cd /home/bibliobot/Documents/ToM/s3Files
/home/bibliobot/bin/aws s3 sync . s3://bibliobot-bucket/
/home/bibliobot/bin/aws lambda update-function-code --function-name bibliobot-puj --s3-bucket bibliobot-bucket --s3-key codelinux-puj.zip
#clear
