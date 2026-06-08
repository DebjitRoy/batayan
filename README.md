# Batayan Bengali Blog

A client-rendered React MVP for a Bengali blog with home page, section listings, searchable index, post details, comments, and a simple admin flow.

## Setup

npm install
npm run dev

## Test

npm test

## Deployment

1. Build the app for production:

   npm run build

2. Upload the generated `dist/` folder to your Amazon S3 bucket:

   aws s3 sync dist/ s3://<your-bucket-name> --delete

3. If the bucket is hosting a static website, enable static website hosting in the AWS console and configure the index document as `index.html`.

4. If you want the bucket to serve files publicly, ensure the bucket policy allows public read access for objects.

5. If your site uses a custom domain, configure an Amazon CloudFront distribution or Route 53 alias pointing to the S3 website endpoint.

Note: image files in post data are served from the public bucket `https://bengali-blog-static-uploads.s3.amazonaws.com`.