"base_url": "http://40.86.244.31:8088"

### Submit a page for video creation, from host configured in http-client.env.json
POST http://{{base_url}}/submit_page
Content-Type: application/json

{
    "url": "https://www.example.com",
    "title": "Example Website",
    "content": "This is an example website for testing."
}

### Upload a video (Make sure to replace the base64 data with a real video)
POST http://{{base_url}}/upload_video
Content-Type: application/json

{
  "id": 1,
  "video": "VGhpcyBpcyBhIGZha2UgdmlkZW8gZm9yIHRlc3RpbmcgcHVycG9zZXM="
}

### List all videos
GET http://{{base_url}}/list_videos

### Get script for a video
GET http://{{base_url}}/get_script?id=1