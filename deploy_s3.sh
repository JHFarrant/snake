#! /bin/bash
echo "Deploying Code to S3 Bucket"
aws s3 cp website/ s3://snake.katieandjack.net --recursive --acl public-read --cache-control max-age=60,public --profile=jack --region=eu-west-1