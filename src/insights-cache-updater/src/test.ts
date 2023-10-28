import * as AWS from "aws-sdk";

(async () => {
    AWS.config.update({region: 'us-east-1'})
    const s3bucket = new AWS.S3();

    s3bucket.putObject({
        Bucket: 'sage-insights-cache',
        Key: 'test.json',
        Body: JSON.stringify({test: `hi from ${Date.now()}`}),
        ContentType: "application/json",
    }, (err, data) => {
        console.log("error uploading", err)
    })
})();