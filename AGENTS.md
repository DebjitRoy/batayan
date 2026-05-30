# Batayan Bengali Blog Project

## Business Requirement

- An MVP of a Multi page Bengali Blog Web application
- Mobile first Responsive modern design
- The Blog page needs to be of elegant design with subtle animations.
- On completion of reading a post, recommend user for similar old posts.
- There will be one home page with a hero image and Caption and sub header. 
- This Blog author is Juthika Ray and contains many of her original writings about mainly these topics - Travel, Essays on Books or movies, Essays ot miscellaneous topics, a guest column and a photo gallery.
- The Blog is divided mainly in these 4 sections which can be accessible from any pages of this blog site.
- Each of these sections consists a hero image, some texts about the section, and  a list of many individual post links sorted by latest first.
- Each list can be paginated or infinite scroll as your choice.
- Each post can be individual or part of a series, if it is a part of a series, in the index/list page, group them together, and for an individual post, show link of other parts of the series.
- Each of the post has it's own link so that individual posts can be shared.
- Each of the Post Contains a header, a hero image, date added, date posted, optional text to attribute photographer etc, a short summary and the body of the post with many images. 
- The section can have a youtube video link as well will be rendered similar size as an image.
- Images needs to be contextual. e.g, for a travel post with 10 images - individual image need to come after it's paragraph.
- Each post has a comment section. Readers can add a comment and read all other comments. Comments should come with the reader's name and date. A comment can be replied by the author or liked.
- A main index that contains searchable list of all types of posts with date and type(travel, essays etc).
- For each of the post page, there can be a floating controller to increase/decrease font size for helping elderly readers.
- A basic login for Blog Author to add a new post or update one
- Admin page will not be available without logging in and it'll list all existing posts
- Create post will allow author to upload hero image, Add sections of text, Add image/video link between sections

## Technical Details

- Implement as a modern React app, client rendered
- For MVP, the entire post with all subsections will be mock data in Bengali text and some static images, but eventually the data will come from MongoDB and REST APIs like - 
GET /posts - (get all posts). can be paginated
GET /posts/{postid} - individual post
POST /posts - Create a new post
PUT /posts/{postid}
DELETE  /posts/{postid}
/posts/:postId/comments
upload image to S3 (post header and section images to S3)
get individual image from S3 link that'd be included in individual post 
- For MVP no real API calls and no persistance and no auth 
Use popular libraries like MUI for CSS and popular animation library
- Elegant UI, vintage/muted color scheme,  and subtle UI

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all critiera are met
3. Carry out extensive integration testing with Playwright or similar, fixing defects
4. Only complete when the MVP is finished and tested, with the server running and ready for the user

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever