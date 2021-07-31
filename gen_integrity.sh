#!/bin/bash

echo "module.exports = { versionsList : ["
cdn="https://cdn.amplify.aws/packages"
for category in `cat categories.txt`; 
do 
    categoryInfo=`find "./dist/packages/${category}" -type f `

    for file in $categoryInfo
    do  
        version=`echo $file | awk -F'/' '{print $5}'`
        fileName=`echo $file | awk -F'/' '{print $6}'`
        integrity=`shasum -b -a 384 ${file}  | awk '{ print $1 }'  | xxd -r -p | base64`
        integrity="sha384-${integrity}"
        echo "{ category: \"$category\", version: \"$version\", name: \"$fileName\", filename:\"$cdn/$category/$version/$fileName\", checksum:\"$integrity\" },"
    done

done

echo "]};"
