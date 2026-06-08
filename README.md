# Batayan Bengali Blog

A client-rendered React MVP for a Bengali blog with home page, section listings, searchable index, post details, comments, and a simple admin flow.

## Setup

npm install
npm run dev

## Test

npm test

## Prod link
https://d2ou81s2ipgc0n.cloudfront.net

## Deployment

### AWS S3 and CloudFront

Use a private S3 bucket for the React build and CloudFront for HTTPS, routing, and API proxying.

1. Build the app:

   ```powershell
   npm.cmd run build
   ```

2. Create an S3 bucket for the web app.
   - Keep "Block all public access" enabled.
   - Do not enable S3 static website hosting when using CloudFront OAC.

3. Upload the Vite build output:

   ```powershell
   aws s3 sync dist s3://batayan-web-prod --delete --exclude "index.html" --cache-control "public,max-age=31536000,immutable"
   aws s3 cp dist/index.html s3://batayan-web-prod/index.html --cache-control "no-cache"
   ```

4. Create a CloudFront distribution.
   - Default origin: the S3 bucket REST origin, not the S3 website endpoint.
   - Use Origin Access Control for S3 and apply the generated bucket policy.
   - Default root object: `index.html`.
   - Viewer protocol policy: redirect HTTP to HTTPS.

5. Add the API origin and behavior. 
   - Origin domain: `tch4co3oq4.execute-api.us-east-1.amazonaws.com`.
   - Origin path: leave blank.
   - Behavior path pattern: `/api/*`.
   - Place `/api/*` above the default `*` behavior.
   - Cache policy: caching disabled.
   - Origin request policy: forward query strings and do not forward the viewer `Host` header.

6. Add React Router fallback.
   - Add CloudFront custom error responses for `403` and `404`.
   - Response page path: `/index.html`.
   - HTTP response code: `200`.
   - TTL: `0` or a low value.

7. Invalidate CloudFront after deploy:

   ```powershell
   aws cloudfront create-invalidation --distribution-id E1SKIR1J0X07R --paths '/*'
   ```

For routine deploys, invalidating only `/index.html` is usually enough because Vite assets are content-hashed:

```powershell
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths /index.html
```

Note: image files in post data are served from the public bucket `https://bengali-blog-static-uploads.s3.amazonaws.com`.
