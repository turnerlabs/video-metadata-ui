# Video Metadata UI

- requires some environment variables to run correctly
```
AWS_DEFAULT_REGION: "us-east-1"
AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
DB_USERNAME: "${DB_USERNAME}"
DB_PASSWORD: "${DB_PASSWORD}"
DB_NAME: "${DB_NAME}"
DB_ENDPOINT: "${DB_ENDPOINT}"
BUCKET: "${BUCKET}"
```

## Current Functionality

* can stream video from s3
* can dynamically query video-metadata DB
* can display video metadata alongside of video as it's playing

## Todos

* add dynmaic way to list videos in s3
* add deep linking ability
* add ability to see histograms of metadata plots
* add ability to search for labels and celebrities and have the video load to that point
